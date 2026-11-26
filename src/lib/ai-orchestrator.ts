import { GoogleGenAI } from "@google/genai";
import {
  addAgentLog,
  getTaskWithLogs,
  updateTask,
  type GeminiModelId,
  type TaskMode,
  type WorkspaceTaskRecord,
} from "./db";

export const ALLOWED_MODELS: readonly GeminiModelId[] = [
  "gemini-3.5-flash-lite",
  "gemini-4-hydrogen",
] as const;

export const ALLOWED_MODES: readonly TaskMode[] = ["fast", "deep"] as const;

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY가 서버(.env.local)에 설정되지 않았습니다."
    );
  }
  return new GoogleGenAI({ apiKey });
}

function formatGeminiError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  const lower = raw.toLowerCase();

  if (
    lower.includes("429") ||
    lower.includes("resource_exhausted") ||
    lower.includes("rate limit") ||
    lower.includes("quota")
  ) {
    return "Gemini API 요청 한도(무료 티어 분당/일일 제한)에 도달했습니다. 30초~1분 뒤 다시 시도하거나 '빠른 협업 모드' + 'Flash-Lite' 모델을 사용해 보세요.";
  }

  if (
    lower.includes("api key") ||
    lower.includes("401") ||
    lower.includes("403") ||
    lower.includes("permission")
  ) {
    return "GEMINI_API_KEY 인증에 실패했습니다. 오라클 서버 .env.local의 API 키가 올바른지 확인해 주세요.";
  }

  return `AI 협업 실행 중 오류가 발생했습니다: ${raw.slice(0, 220)}`;
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

interface FastCollaborationResult {
  title: string;
  pmPlan: string;
  researchOutput: string;
  engineeringOutput: string;
  growthOutput: string;
  finalReport: string;
}

interface DeepPmBreakdown {
  title: string;
  pmPlan: string;
  researchBrief: string;
  engineeringBrief: string;
  growthBrief: string;
}

function parseJsonSafe<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function runFastCollaboration(
  ai: GoogleGenAI,
  task: WorkspaceTaskRecord
): Promise<void> {
  const interaction = await ai.interactions.create({
    model: task.model,
    store: false,
    system_instruction: [
      "당신은 1인 AI 소프트웨어 스튜디오 '하이드어웨이 랩(Hideaway Lab)'의 멀티 에이전트 협업 시스템입니다.",
      "대표자(신정우)의 지시를 받아 4명의 AI 전문가(총괄 PM AI, 기획·리서치 AI, 개발 AI, 마케팅·카피 AI)가 협업한 결과를 지정된 JSON 스키마로 한국어 존댓말로 작성하세요.",
      "현실적이고 바로 실행 가능한 1인 기업 관점으로 간결하면서도 핵심이 빠지지 않게 정리하세요.",
    ].join("\n"),
    input: `대표자 업무 지시:\n${task.directive}`,
    response_format: {
      type: "text",
      mime_type: "application/json",
      schema: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "업무를 한눈에 파악할 수 있는 25자 이내 한국어 제목",
          },
          pmPlan: {
            type: "string",
            description: "총괄 PM AI의 목표 요약, 우선순위, 단계별 실행 계획",
          },
          researchOutput: {
            type: "string",
            description:
              "기획·리서치 AI의 핵심 사용자 문제, MVP 기능 목록, 수익화 아이디어",
          },
          engineeringOutput: {
            type: "string",
            description:
              "개발 AI의 추천 기술 스택, 데이터/화면 구조, 빠른 구현 순서",
          },
          growthOutput: {
            type: "string",
            description:
              "마케팅·카피 AI의 핵심 가치 제안, 서비스명 후보, 랜딩 카피 및 초기 유입 전략",
          },
          finalReport: {
            type: "string",
            description:
              "총괄 PM AI가 대표자 결재용으로 정리한 최종 통합 보고서 (핵심 결론 + 당장 실행할 액션 3가지 포함)",
          },
        },
        required: [
          "title",
          "pmPlan",
          "researchOutput",
          "engineeringOutput",
          "growthOutput",
          "finalReport",
        ],
      },
    },
    generation_config: {
      max_output_tokens: 4096,
    },
  });

  const rawText = interaction.output_text?.trim();
  if (!rawText) {
    throw new Error("AI 응답이 비어 있습니다.");
  }

  const parsed = parseJsonSafe<FastCollaborationResult>(rawText);
  if (!parsed) {
    addAgentLog({
      taskId: task.id,
      agentRole: "총괄 PM AI",
      stepTitle: "통합 보고서 작성",
      content: rawText,
    });
    updateTask(task.id, {
      status: "승인 대기",
      finalReport: rawText,
      errorMessage: null,
    });
    return;
  }

  addAgentLog({
    taskId: task.id,
    agentRole: "총괄 PM AI",
    stepTitle: "목표 분석 및 업무 분해",
    content: parsed.pmPlan,
  });
  addAgentLog({
    taskId: task.id,
    agentRole: "기획 · 리서치 AI",
    stepTitle: "시장 분석 및 MVP 기획",
    content: parsed.researchOutput,
  });
  addAgentLog({
    taskId: task.id,
    agentRole: "개발 AI",
    stepTitle: "기술 아키텍처 및 구현 설계",
    content: parsed.engineeringOutput,
  });
  addAgentLog({
    taskId: task.id,
    agentRole: "마케팅 · 카피 AI",
    stepTitle: "브랜딩 카피 및 초기 성장 전략",
    content: parsed.growthOutput,
  });

  updateTask(task.id, {
    title: parsed.title?.trim() || task.title,
    status: "승인 대기",
    finalReport: parsed.finalReport,
    errorMessage: null,
  });
}

async function runDeepCollaboration(
  ai: GoogleGenAI,
  task: WorkspaceTaskRecord
): Promise<void> {
  // 1. Chief PM breaks down the directive into tailored briefs
  const pmStep = await ai.interactions.create({
    model: task.model,
    store: false,
    system_instruction:
      "당신은 하이드어웨이 랩의 총괄 PM AI입니다. 대표자 지시를 분석하고 기획·개발·마케팅 AI에게 전달할 명확한 작업 지시서를 JSON으로 작성하세요.",
    input: `대표자 업무 지시:\n${task.directive}`,
    response_format: {
      type: "text",
      mime_type: "application/json",
      schema: {
        type: "object",
        properties: {
          title: { type: "string", description: "25자 이내 한국어 제목" },
          pmPlan: { type: "string", description: "전체 목표와 일정/우선순위 정리" },
          researchBrief: { type: "string", description: "기획·리서치 AI에게 주는 구체적 지시" },
          engineeringBrief: { type: "string", description: "개발 AI에게 주는 구체적 지시" },
          growthBrief: { type: "string", description: "마케팅·카피 AI에게 주는 구체적 지시" },
        },
        required: [
          "title",
          "pmPlan",
          "researchBrief",
          "engineeringBrief",
          "growthBrief",
        ],
      },
    },
    generation_config: { max_output_tokens: 2048 },
  });

  const pmData = parseJsonSafe<DeepPmBreakdown>(pmStep.output_text ?? "") ?? {
    title: task.title,
    pmPlan: pmStep.output_text?.trim() || "업무 분해 완료",
    researchBrief: task.directive,
    engineeringBrief: task.directive,
    growthBrief: task.directive,
  };

  addAgentLog({
    taskId: task.id,
    agentRole: "총괄 PM AI",
    stepTitle: "1단계 · 요구사항 분해 및 지시 배정",
    content: pmData.pmPlan,
  });
  updateTask(task.id, { title: pmData.title?.trim() || task.title });

  // Small delay helps avoid hitting Free Tier burst RPM limits.
  await sleep(1500);

  // 2. Research & Product Agent
  const researchStep = await ai.interactions.create({
    model: task.model,
    store: false,
    system_instruction:
      "당신은 하이드어웨이 랩의 기획·리서치 AI입니다. 1인 AI 기업이 빠르게 실행할 수 있도록 시장 문제, 타깃 고객, 핵심 MVP 기능, 수익화 모델을 구조화된 한국어로 작성하세요.",
    input: `원본 지시: ${task.directive}\n\nPM 지시사항: ${pmData.researchBrief}`,
    generation_config: { max_output_tokens: 2048 },
  });
  const researchText =
    researchStep.output_text?.trim() || "기획 산출물을 생성하지 못했습니다.";
  addAgentLog({
    taskId: task.id,
    agentRole: "기획 · 리서치 AI",
    stepTitle: "2단계 · 시장 리서치 및 PRD 초안",
    content: researchText,
  });

  await sleep(1500);

  // 3. Engineering Agent
  const engineeringStep = await ai.interactions.create({
    model: task.model,
    store: false,
    system_instruction:
      "당신은 하이드어웨이 랩의 수석 개발 AI입니다. Next.js, TypeScript, 오라클 클라우드 무료 서버 환경 등 1인 개발에 최적화된 기술 스택, DB 설계, 구현 단계와 리스크를 한국어로 작성하세요.",
    input: `원본 지시: ${task.directive}\n\nPM 지시사항: ${pmData.engineeringBrief}\n\n기획 AI 요약:\n${researchText}`,
    generation_config: { max_output_tokens: 2048 },
  });
  const engineeringText =
    engineeringStep.output_text?.trim() || "개발 설계안을 생성하지 못했습니다.";
  addAgentLog({
    taskId: task.id,
    agentRole: "개발 AI",
    stepTitle: "3단계 · 기술 스택 및 구현 설계",
    content: engineeringText,
  });

  await sleep(1500);

  // 4. Growth & Copy Agent
  const growthStep = await ai.interactions.create({
    model: task.model,
    store: false,
    system_instruction:
      "당신은 하이드어웨이 랩의 마케팅·카피 AI입니다. 타깃 고객의 공감을 얻는 네이밍 후보, 핵심 슬로건, 랜딩 카피, 0원으로 시작하는 초기 고객 확보 전략을 한국어로 작성하세요.",
    input: `원본 지시: ${task.directive}\n\nPM 지시사항: ${pmData.growthBrief}\n\n기획 AI 요약:\n${researchText}`,
    generation_config: { max_output_tokens: 2048 },
  });
  const growthText =
    growthStep.output_text?.trim() || "마케팅 전략을 생성하지 못했습니다.";
  addAgentLog({
    taskId: task.id,
    agentRole: "마케팅 · 카피 AI",
    stepTitle: "4단계 · 포지셔닝 및 런칭 카피",
    content: growthText,
  });

  await sleep(1500);

  // 5. Chief PM Final Synthesis Report
  const finalStep = await ai.interactions.create({
    model: task.model,
    store: false,
    system_instruction:
      "당신은 하이드어웨이 랩의 총괄 PM AI입니다. 3개 팀의 산출물을 통합 검수해 대표자(신정우)가 바로 승인 여부를 결정할 수 있는 간결하고 명확한 최종 결재 보고서를 작성하세요. 마지막에 '지금 바로 실행할 다음 액션 3가지'를 포함하세요.",
    input: [
      `대표자 원본 지시: ${task.directive}`,
      `\n[기획·리서치 AI 보고]\n${researchText}`,
      `\n[개발 AI 보고]\n${engineeringText}`,
      `\n[마케팅·카피 AI 보고]\n${growthText}`,
    ].join("\n"),
    generation_config: { max_output_tokens: 2560 },
  });
  const finalReport =
    finalStep.output_text?.trim() || "최종 통합 보고서를 생성하지 못했습니다.";

  addAgentLog({
    taskId: task.id,
    agentRole: "총괄 PM AI",
    stepTitle: "5단계 · 최종 검수 및 대표자 결재 보고",
    content: finalReport,
  });

  updateTask(task.id, {
    status: "승인 대기",
    finalReport,
    errorMessage: null,
  });
}

export async function runTaskOrchestration(
  taskId: string
): Promise<WorkspaceTaskRecord> {
  const task = getTaskWithLogs(taskId);
  if (!task) {
    throw new Error("업무를 찾을 수 없습니다.");
  }

  try {
    const ai = getClient();
    if (task.mode === "deep") {
      await runDeepCollaboration(ai, task);
    } else {
      await runFastCollaboration(ai, task);
    }
  } catch (error) {
    const message = formatGeminiError(error);
    updateTask(taskId, {
      status: "오류",
      errorMessage: message,
    });
  }

  return getTaskWithLogs(taskId)!;
}

export async function reviseTaskWithFeedback(
  taskId: string,
  feedback: string
): Promise<WorkspaceTaskRecord> {
  const task = getTaskWithLogs(taskId);
  if (!task) {
    throw new Error("업무를 찾을 수 없습니다.");
  }

  addAgentLog({
    taskId,
    agentRole: "대표자",
    stepTitle: "수정 지시 전달",
    content: feedback,
  });

  updateTask(taskId, {
    status: "진행 중",
    ceoFeedback: feedback,
    errorMessage: null,
  });

  try {
    const ai = getClient();
    const interaction = await ai.interactions.create({
      model: task.model,
      store: false,
      system_instruction:
        "당신은 하이드어웨이 랩의 총괄 PM AI입니다. 대표자의 수정 지시를 정확히 반영해 기존 보고서를 보완한 수정 최종 보고서를 한국어 존댓말로 작성하세요. 맨 위에 '반영된 수정 사항 요약'을 먼저 적어주세요.",
      input: [
        `원본 업무 지시:\n${task.directive}`,
        `\n기존 최종 보고서:\n${task.finalReport ?? "(없음)"}`,
        `\n대표자 수정 지시:\n${feedback}`,
      ].join("\n"),
      generation_config: { max_output_tokens: 3072 },
    });

    const revisedReport =
      interaction.output_text?.trim() || "수정 보고서를 생성하지 못했습니다.";

    addAgentLog({
      taskId,
      agentRole: "총괄 PM AI",
      stepTitle: "대표자 피드백 반영 수정 보고서",
      content: revisedReport,
    });

    updateTask(taskId, {
      status: "승인 대기",
      finalReport: revisedReport,
      errorMessage: null,
    });
  } catch (error) {
    const message = formatGeminiError(error);
    updateTask(taskId, {
      status: "오류",
      errorMessage: message,
    });
  }

  return getTaskWithLogs(taskId)!;
}
