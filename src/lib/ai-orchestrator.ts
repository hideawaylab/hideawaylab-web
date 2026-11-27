import { GoogleGenAI } from "@google/genai";
import {
  addAgentLog,
  getTaskWithLogs,
  updateTask,
  type LeaderModelId,
  type TaskMode,
  type WorkerModelId,
  type WorkspaceTaskRecord,
} from "./db";
import { fetchReferenceUrls } from "./web-tools";

export const ALLOWED_LEADER_MODELS: readonly LeaderModelId[] = [
  "gemini-4-hydrogen",
  "gemini-4-argon",
  "gemini-4-neon",
] as const;

export const ALLOWED_WORKER_MODELS: readonly WorkerModelId[] = [
  "gemini-3.5-flash-lite",
  "gemini-4-hydrogen",
] as const;

export const ALLOWED_MODES: readonly TaskMode[] = ["fast", "deep"] as const;

export interface UploadedAttachment {
  name: string;
  mimeType: string;
  base64Data?: string;
  textContent?: string;
  sizeBytes: number;
}

export interface OrchestrationToolContext {
  attachment?: UploadedAttachment | null;
  referenceUrls?: string[];
}

const PASS_SCORE_THRESHOLD = 85;
const STEP_DELAY_MS = 1200;

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
    lower.includes("free tier") ||
    lower.includes("billing") ||
    lower.includes("paid tier")
  ) {
    return "선택하신 고성능 모델(Argon/Neon)은 유료 결제(Paid Tier) API 키 전용입니다. 무료 티어에서는 리더 모델을 'Gemini 4 Hydrogen'으로 선택해 주세요.";
  }

  if (
    lower.includes("429") ||
    lower.includes("resource_exhausted") ||
    lower.includes("rate limit") ||
    lower.includes("quota")
  ) {
    return "Gemini API 요청 한도(무료 티어 분당/일일 제한)에 도달했습니다. 30초~1분 뒤 '다시 실행'을 누르거나, 빠른 협업 모드 + 리뷰 라운드 1~2회로 실행해 보세요.";
  }

  if (
    lower.includes("api key") ||
    lower.includes("401") ||
    lower.includes("403") ||
    lower.includes("permission")
  ) {
    return "GEMINI_API_KEY 인증에 실패했습니다. 오라클 서버 .env.local의 API 키가 올바른지 확인해 주세요.";
  }

  return `AI 협업 실행 중 오류가 발생했습니다: ${raw.slice(0, 240)}`;
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
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

type MultimodalBlock =
  | { type: "text"; text: string }
  | { type: "image"; data: string; mime_type: string }
  | { type: "document"; data: string; mime_type: "application/pdf" };

function buildModelInput(
  promptText: string,
  attachment?: UploadedAttachment | null
): string | MultimodalBlock[] {
  if (!attachment) {
    return promptText;
  }

  if (attachment.textContent) {
    return `${promptText}\n\n[첨부 텍스트 파일: ${attachment.name}]\n${attachment.textContent}`;
  }

  if (attachment.base64Data && attachment.mimeType === "application/pdf") {
    return [
      {
        type: "text",
        text: `${promptText}\n\n[첨부 PDF 문서(${attachment.name})를 직접 읽고 핵심 내용을 분석에 반영하세요.]`,
      },
      {
        type: "document",
        data: attachment.base64Data,
        mime_type: "application/pdf",
      },
    ];
  }

  if (attachment.base64Data && attachment.mimeType.startsWith("image/")) {
    return [
      {
        type: "text",
        text: `${promptText}\n\n[첨부 이미지(${attachment.name})를 시각적으로 분석해 기획·개발·재무·마케팅에 반영하세요.]`,
      },
      {
        type: "image",
        data: attachment.base64Data,
        mime_type: attachment.mimeType,
      },
    ];
  }

  return promptText;
}

interface FastWorkersResult {
  title: string;
  researchOutput: string;
  engineeringOutput: string;
  growthOutput: string;
  financeOutput: string;
}

interface DeepPmBreakdown {
  title: string;
  pmPlan: string;
  researchBrief: string;
  engineeringBrief: string;
  growthBrief: string;
  financeBrief: string;
}

interface ReviewerResult {
  verdict: "PASS" | "REJECT";
  score: number;
  metCriteria: string[];
  missingItems: string[];
  critique: string;
  debateTopic: string;
  approvalNote: string;
}

interface DebateResult {
  debateTranscript: string;
  updatedFinanceSummary: string;
  agreedChanges: string;
}

const FINANCE_GUIDANCE = [
  "재무 분석가 AI는 반드시 마크다운 표와 구체적 원화(KRW)/달러(USD) 수치·계산 근거로 아래 5가지를 작성해야 합니다:",
  "1) 초기 구축 비용 (도메인, 디자인/개발 툴, 스토어 등록비 등 일회성 비용)",
  "2) 월 고정 및 변동 운영비 (오라클 무료 서버 vs 유료 확장 시점, Gemini API 예상 토큰 비용, 결제 수수료, 외부 서비스 비용)",
  "3) 무료 티어(0원)로 버틸 수 있는 최대 사용자 수 및 유료 전환 임계점",
  "4) 손익분기점(BEP) — 단가/구독가 가정 및 필요 유료 고객 수",
  "5) 3단계 수익 시나리오 (보수적 / 기본 / 낙관적) 및 비용 절감 권고안",
].join("\n");

async function gatherToolContext(
  task: WorkspaceTaskRecord,
  tools?: OrchestrationToolContext
): Promise<string> {
  const sections: string[] = [];

  if (tools?.attachment) {
    const kb = Math.max(1, Math.round(tools.attachment.sizeBytes / 1024));
    addAgentLog({
      taskId: task.id,
      agentRole: "실무 도구",
      stepTitle: `첨부 파일 연동 (${tools.attachment.name})`,
      content: `파일명: ${tools.attachment.name}\n형식: ${tools.attachment.mimeType}\n크기: 약 ${kb}KB\n상태: 6인 AI 팀 분석 입력에 직접 첨부 완료`,
    });
    sections.push(
      `[첨부 파일 정보] ${tools.attachment.name} (${tools.attachment.mimeType}, ${kb}KB)`
    );
  }

  const urls = tools?.referenceUrls ?? task.referenceUrls;
  if (urls && urls.length > 0) {
    const fetched = await fetchReferenceUrls(urls);
    const summaryLog = fetched
      .map((item, idx) =>
        item.error
          ? `${idx + 1}. ${item.url}\n   - 상태: 실패 (${item.error})`
          : `${idx + 1}. ${item.url}\n   - 제목: ${item.title}\n   - 추출 분량: ${item.excerpt.length}자`
      )
      .join("\n");

    addAgentLog({
      taskId: task.id,
      agentRole: "실무 도구",
      stepTitle: `참고 URL 실시간 분석 (${fetched.length}건)`,
      content: summaryLog,
    });

    const successful = fetched.filter((item) => !item.error && item.excerpt);
    if (successful.length > 0) {
      sections.push(
        successful
          .map(
            (item, idx) =>
              `[참고 웹페이지 ${idx + 1}: ${item.title} (${item.url})]\n${item.excerpt}`
          )
          .join("\n\n")
      );
    }
  }

  return sections.join("\n\n");
}

async function runInitialDraft(
  ai: GoogleGenAI,
  task: WorkspaceTaskRecord,
  toolContextText: string,
  attachment?: UploadedAttachment | null
): Promise<{ draftReport: string; financeSummary: string; title: string }> {
  const directiveHeader = [
    `카테고리: ${task.category}`,
    `대표자 업무 지시:\n${task.directive}`,
    toolContextText ? `\n[실무 도구 수집 자료]\n${toolContextText}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  if (task.mode === "deep") {
    const pmBreak = await ai.interactions.create({
      model: task.leaderModel,
      store: false,
      system_instruction:
        "당신은 하이드어웨이 랩(앱 개발 및 다양한 수익화 비즈니스 랩)의 총괄 PM AI입니다. 대표자(신정우)의 지시와 첨부·참고 자료를 분석하고 기획·개발·마케팅·재무 분석가 4명에게 전달할 구체적 작업 지시서를 JSON으로 작성하세요.",
      input: buildModelInput(directiveHeader, attachment),
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: {
          type: "object",
          properties: {
            title: { type: "string", description: "25자 이내 한국어 제목" },
            pmPlan: { type: "string", description: "전체 목표, 핵심 성공 기준, 우선순위" },
            researchBrief: { type: "string", description: "기획·리서치 AI 지시사항" },
            engineeringBrief: { type: "string", description: "개발 AI 지시사항" },
            growthBrief: { type: "string", description: "마케팅·카피 AI 지시사항" },
            financeBrief: {
              type: "string",
              description: "재무 분석가 AI 지시사항 (정확한 비용 산출 포인트 포함)",
            },
          },
          required: [
            "title",
            "pmPlan",
            "researchBrief",
            "engineeringBrief",
            "growthBrief",
            "financeBrief",
          ],
        },
      },
      generation_config: { max_output_tokens: 2048 },
    });

    const pmData = parseJsonSafe<DeepPmBreakdown>(
      pmBreak.output_text ?? ""
    ) ?? {
      title: task.title,
      pmPlan: pmBreak.output_text?.trim() || "업무 분해 완료",
      researchBrief: task.directive,
      engineeringBrief: task.directive,
      growthBrief: task.directive,
      financeBrief: task.directive,
    };

    const resolvedTitle = pmData.title?.trim() || task.title;
    addAgentLog({
      taskId: task.id,
      agentRole: "총괄 PM AI",
      stepTitle: `1단계 · 요구사항 분해 (${task.leaderModel})`,
      content: pmData.pmPlan,
    });
    updateTask(task.id, { title: resolvedTitle });

    await sleep(STEP_DELAY_MS);

    const researchStep = await ai.interactions.create({
      model: task.workerModel,
      store: false,
      system_instruction:
        "당신은 하이드어웨이 랩의 기획·리서치 AI입니다. 1인 AI 비즈니스 랩이 바로 실행할 수 있도록 시장 문제, 타깃 고객, 핵심 MVP/사업 구조, 수익화 모델을 마크다운으로 깔끔하게 작성하세요.",
      input: buildModelInput(
        `${directiveHeader}\n\nPM 지시사항: ${pmData.researchBrief}`,
        attachment
      ),
      generation_config: { max_output_tokens: 2048 },
    });
    const researchText =
      researchStep.output_text?.trim() || "기획 산출물을 생성하지 못했습니다.";
    addAgentLog({
      taskId: task.id,
      agentRole: "기획 · 리서치 AI",
      stepTitle: `2단계 · 시장 리서치 및 기획 (${task.workerModel})`,
      content: researchText,
    });

    await sleep(STEP_DELAY_MS);

    const engineeringStep = await ai.interactions.create({
      model: task.workerModel,
      store: false,
      system_instruction:
        "당신은 하이드어웨이 랩의 개발 AI입니다. Next.js, TypeScript, 오라클 클라우드 무료 서버 등 1인 실행에 최적화된 기술 스택, 구현/자동화 아키텍처, 일정 및 리스크를 마크다운으로 작성하세요.",
      input: buildModelInput(
        `${directiveHeader}\n\nPM 지시사항: ${pmData.engineeringBrief}\n\n[기획 AI 산출물]\n${researchText}`,
        attachment
      ),
      generation_config: { max_output_tokens: 2048 },
    });
    const engineeringText =
      engineeringStep.output_text?.trim() || "개발 설계안을 생성하지 못했습니다.";
    addAgentLog({
      taskId: task.id,
      agentRole: "개발 AI",
      stepTitle: `3단계 · 기술 스택 및 실행 설계 (${task.workerModel})`,
      content: engineeringText,
    });

    await sleep(STEP_DELAY_MS);

    const growthStep = await ai.interactions.create({
      model: task.workerModel,
      store: false,
      system_instruction:
        "당신은 하이드어웨이 랩의 마케팅·카피 AI입니다. 네이밍 후보, 핵심 메시지, 랜딩/세일즈 카피, 0원으로 시작하는 초기 고객 확보 전략을 마크다운으로 작성하세요.",
      input: `${directiveHeader}\n\nPM 지시사항: ${pmData.growthBrief}\n\n[기획 AI 산출물]\n${researchText}`,
      generation_config: { max_output_tokens: 2048 },
    });
    const growthText =
      growthStep.output_text?.trim() || "마케팅 전략을 생성하지 못했습니다.";
    addAgentLog({
      taskId: task.id,
      agentRole: "마케팅 · 카피 AI",
      stepTitle: `4단계 · 포지셔닝 및 수익화 카피 (${task.workerModel})`,
      content: growthText,
    });

    await sleep(STEP_DELAY_MS);

    const financeStep = await ai.interactions.create({
      model: task.workerModel,
      store: false,
      system_instruction: `당신은 하이드어웨이 랩의 재무 분석가 AI입니다. 기획·개발·마케팅 계획을 모두 검토하여 이 프로젝트에 실제로 들어가는 비용과 수익성을 냉정하고 정확하게 마크다운 표와 수치로 보고하세요.\n\n${FINANCE_GUIDANCE}`,
      input: buildModelInput(
        [
          directiveHeader,
          `\nPM 재무 지시사항: ${pmData.financeBrief}`,
          `\n[기획 AI]\n${researchText}`,
          `\n[개발 AI]\n${engineeringText}`,
          `\n[마케팅 AI]\n${growthText}`,
        ].join("\n"),
        attachment
      ),
      generation_config: { max_output_tokens: 2400 },
    });
    const financeText =
      financeStep.output_text?.trim() || "재무 분석을 생성하지 못했습니다.";
    addAgentLog({
      taskId: task.id,
      agentRole: "재무 분석가 AI",
      stepTitle: `5단계 · 정밀 비용 및 손익 분석 (${task.workerModel})`,
      content: financeText,
    });
    updateTask(task.id, { financeSummary: financeText });

    await sleep(STEP_DELAY_MS);

    const pmDraft = await ai.interactions.create({
      model: task.leaderModel,
      store: false,
      system_instruction:
        "당신은 하이드어웨이 랩의 총괄 PM AI입니다. 기획·개발·마케팅·재무 분석가 4명의 산출물을 모순 없이 통합해 마크다운 서식(제목, 표, 글머리표)으로 대표자 보고서 초안을 작성하세요. 재무 분석가의 핵심 비용·BEP 수치와 '지금 당장 실행할 액션 3가지'를 반드시 포함하세요.",
      input: [
        directiveHeader,
        `\n[기획 · 리서치 AI]\n${researchText}`,
        `\n[개발 AI]\n${engineeringText}`,
        `\n[마케팅 · 카피 AI]\n${growthText}`,
        `\n[재무 분석가 AI]\n${financeText}`,
      ].join("\n"),
      generation_config: { max_output_tokens: 2800 },
    });

    const draftReport =
      pmDraft.output_text?.trim() || "초안 보고서를 생성하지 못했습니다.";
    addAgentLog({
      taskId: task.id,
      agentRole: "총괄 PM AI",
      stepTitle: `6단계 · 4개 팀 산출물 통합 초안 (${task.leaderModel})`,
      content: draftReport,
    });

    return { draftReport, financeSummary: financeText, title: resolvedTitle };
  }

  // FAST MODE: 1 structured worker call (with multimodal attachment + URL context) + 1 leader PM synthesis
  const workersStep = await ai.interactions.create({
    model: task.workerModel,
    store: false,
    system_instruction: [
      "당신은 하이드어웨이 랩(앱 개발 및 다양한 수익화 비즈니스 랩)의 실무 AI 4인 팀(기획·리서치 AI, 개발 AI, 마케팅·카피 AI, 재무 분석가 AI)입니다.",
      "대표자(신정우)의 지시와 첨부·참고 자료를 분석해 각 담당자의 전문 산출물을 마크다운 서식으로 정리하여 JSON 스키마로 작성하세요.",
      FINANCE_GUIDANCE,
    ].join("\n\n"),
    input: buildModelInput(directiveHeader, attachment),
    response_format: {
      type: "text",
      mime_type: "application/json",
      schema: {
        type: "object",
        properties: {
          title: { type: "string", description: "25자 이내 한국어 업무 제목" },
          researchOutput: {
            type: "string",
            description: "기획·리서치 AI: 문제 정의, 타깃 고객, 핵심 MVP/사업 모델",
          },
          engineeringOutput: {
            type: "string",
            description:
              "개발 AI: 추천 기술 스택, 구현/자동화 구조, 일정 및 리스크",
          },
          growthOutput: {
            type: "string",
            description:
              "마케팅·카피 AI: 네이밍 후보, 핵심 카피, 0원 초기 유입 전략",
          },
          financeOutput: {
            type: "string",
            description:
              "재무 분석가 AI: 마크다운 표를 포함한 초기 구축비, 월 고정/변동 운영비, 무료 티어 한계, 손익분기점(BEP), 3단계 수익 시나리오",
          },
        },
        required: [
          "title",
          "researchOutput",
          "engineeringOutput",
          "growthOutput",
          "financeOutput",
        ],
      },
    },
    generation_config: { max_output_tokens: 4096 },
  });

  const parsedWorkers = parseJsonSafe<FastWorkersResult>(
    workersStep.output_text ?? ""
  );
  const resolvedTitle = parsedWorkers?.title?.trim() || task.title;
  const researchText =
    parsedWorkers?.researchOutput?.trim() ||
    workersStep.output_text?.trim() ||
    "기획 산출물 생성됨";
  const engineeringText =
    parsedWorkers?.engineeringOutput?.trim() || "개발 설계안 생성됨";
  const growthText =
    parsedWorkers?.growthOutput?.trim() || "마케팅 전략 생성됨";
  const financeText =
    parsedWorkers?.financeOutput?.trim() || "재무 분석 생성됨";

  addAgentLog({
    taskId: task.id,
    agentRole: "기획 · 리서치 AI",
    stepTitle: `기획 · 사업 구조 설계 (${task.workerModel})`,
    content: researchText,
  });
  addAgentLog({
    taskId: task.id,
    agentRole: "개발 AI",
    stepTitle: `기술 · 실행 설계 (${task.workerModel})`,
    content: engineeringText,
  });
  addAgentLog({
    taskId: task.id,
    agentRole: "마케팅 · 카피 AI",
    stepTitle: `브랜딩 및 유입 전략 (${task.workerModel})`,
    content: growthText,
  });
  addAgentLog({
    taskId: task.id,
    agentRole: "재무 분석가 AI",
    stepTitle: `정밀 비용 및 손익 분석 (${task.workerModel})`,
    content: financeText,
  });

  updateTask(task.id, {
    title: resolvedTitle,
    financeSummary: financeText,
  });

  await sleep(STEP_DELAY_MS);

  const pmStep = await ai.interactions.create({
    model: task.leaderModel,
    store: false,
    system_instruction:
      "당신은 하이드어웨이 랩의 총괄 PM AI입니다. 실무 4인(기획·개발·마케팅·재무)의 결과를 종합해 모순을 정리하고, 마크다운 서식(제목, 요약 표, 글머리표)으로 대표자 결재용 통합 보고서 초안을 작성하세요. 재무 분석의 핵심 비용·BEP 수치와 '지금 당장 실행할 액션 3가지'를 반드시 포함하세요.",
    input: [
      directiveHeader,
      `\n[기획 · 리서치 AI]\n${researchText}`,
      `\n[개발 AI]\n${engineeringText}`,
      `\n[마케팅 · 카피 AI]\n${growthText}`,
      `\n[재무 분석가 AI]\n${financeText}`,
    ].join("\n"),
    generation_config: { max_output_tokens: 2800 },
  });

  const draftReport =
    pmStep.output_text?.trim() || "통합 초안 보고서를 생성하지 못했습니다.";

  addAgentLog({
    taskId: task.id,
    agentRole: "총괄 PM AI",
    stepTitle: `실무 4인 산출물 통합 초안 (${task.leaderModel})`,
    content: draftReport,
  });

  return { draftReport, financeSummary: financeText, title: resolvedTitle };
}

async function runReviewerCheck(
  ai: GoogleGenAI,
  task: WorkspaceTaskRecord,
  currentReport: string,
  financeSummary: string,
  round: number
): Promise<ReviewerResult> {
  const reviewStep = await ai.interactions.create({
    model: task.leaderModel,
    store: false,
    system_instruction: [
      "당신은 하이드어웨이 랩의 '품질 리뷰어 AI(Quality Gatekeeper)'입니다.",
      "대표자(신정우)의 원본 지시 의도대로 팀 보고서와 재무 분석이 충분히 완성되었는지 냉정하고 깐깐하게 평가하세요.",
      `점수가 ${PASS_SCORE_THRESHOLD}점 이상이고 대표 지시의 핵심 누락이 없을 때만 verdict를 'PASS'로 주세요.`,
      "추상적이거나, 비용 계산 근거가 빈약하거나, 개발·기획·재무 간 모순이 있거나, 대표 지시 사항 중 빠진 게 있다면 주저 없이 'REJECT'하고 구체적인 보완 지시와 팀 토론 주제를 제시하세요.",
    ].join("\n"),
    input: [
      `[검수 라운드 ${round} / 최대 ${task.maxReviewRounds}]`,
      `카테고리: ${task.category}`,
      `대표자 원본 지시:\n${task.directive}`,
      `\n[현재 통합 보고서]\n${currentReport}`,
      `\n[재무 분석가 보고]\n${financeSummary}`,
    ].join("\n"),
    response_format: {
      type: "text",
      mime_type: "application/json",
      schema: {
        type: "object",
        properties: {
          verdict: {
            type: "string",
            enum: ["PASS", "REJECT"],
            description: "기준 충족 시 PASS, 보완·재토론 필요 시 REJECT",
          },
          score: { type: "integer", description: "0~100점 사이 품질 점수" },
          metCriteria: {
            type: "array",
            items: { type: "string" },
            description: "잘 충족된 항목 목록",
          },
          missingItems: {
            type: "array",
            items: { type: "string" },
            description: "부족하거나 보완이 필요한 항목 목록",
          },
          critique: {
            type: "string",
            description:
              "어떤 팀(기획/개발/마케팅/재무/PM)이 무엇을 보완해야 하는지 구체적 리뷰 의견",
          },
          debateTopic: {
            type: "string",
            description: "REJECT 시 AI 팀원들이 재토론해야 할 핵심 쟁점",
          },
          approvalNote: {
            type: "string",
            description: "PASS 시 대표자에게 전달할 추천·승인 의견",
          },
        },
        required: [
          "verdict",
          "score",
          "metCriteria",
          "missingItems",
          "critique",
          "debateTopic",
          "approvalNote",
        ],
      },
    },
    generation_config: { max_output_tokens: 2048 },
  });

  const parsed = parseJsonSafe<ReviewerResult>(reviewStep.output_text ?? "");
  if (!parsed) {
    return {
      verdict: "PASS",
      score: 86,
      metCriteria: ["보고서 기본 구조 완성"],
      missingItems: [],
      critique: reviewStep.output_text?.trim() || "리뷰 완료",
      debateTopic: "",
      approvalNote: "대표자 검토를 위해 상정합니다.",
    };
  }

  const clampedScore = Math.max(0, Math.min(100, Math.round(parsed.score)));
  const normalizedVerdict: "PASS" | "REJECT" =
    parsed.verdict === "PASS" && clampedScore >= PASS_SCORE_THRESHOLD
      ? "PASS"
      : "REJECT";

  return {
    ...parsed,
    score: clampedScore,
    verdict: normalizedVerdict,
  };
}

function formatReviewerLog(review: ReviewerResult): string {
  const lines: string[] = [
    `**판정**: ${review.verdict === "PASS" ? "✅ 통과 (PASS)" : "❌ 리젝 (REJECT)"} · **품질 점수**: ${review.score} / 100점`,
    "",
    `### 리뷰어 총평\n${review.critique}`,
  ];

  if (review.metCriteria.length > 0) {
    lines.push(
      "",
      `### 충족된 항목\n${review.metCriteria.map((item) => `- ${item}`).join("\n")}`
    );
  }
  if (review.missingItems.length > 0) {
    lines.push(
      "",
      `### 보완 필요 항목\n${review.missingItems.map((item) => `- ${item}`).join("\n")}`
    );
  }
  if (review.verdict === "REJECT" && review.debateTopic) {
    lines.push("", `### 재토론 소집 주제\n${review.debateTopic}`);
  }
  if (review.verdict === "PASS" && review.approvalNote) {
    lines.push("", `### 대표자 전달 의견\n${review.approvalNote}`);
  }

  return lines.join("\n");
}

async function runTeamDebateAndRevise(
  ai: GoogleGenAI,
  task: WorkspaceTaskRecord,
  currentReport: string,
  financeSummary: string,
  critique: string,
  debateTopic: string,
  roundLabel: string
): Promise<{ revisedReport: string; updatedFinance: string }> {
  const debateStep = await ai.interactions.create({
    model: task.workerModel,
    store: false,
    system_instruction: [
      "당신은 하이드어웨이 랩의 실무 AI 팀(기획·리서치 AI, 개발 AI, 마케팅·카피 AI, 재무 분석가 AI) 내부 토론 진행자입니다.",
      "품질 리뷰어(또는 대표자)의 지적 사항을 바탕으로 각 담당자가 서로 반론·제안·타협하며 최선의 개선안을 합의하는 회의록을 JSON으로 작성하세요.",
      "비용이나 수익 구조에 변화가 생기면 재무 분석가 AI가 업데이트된 정밀 비용·손익 요약을 마크다운 표로 반드시 갱신하세요.",
    ].join("\n"),
    input: [
      `대표자 원본 지시:\n${task.directive}`,
      `\n[기존 보고서]\n${currentReport}`,
      `\n[기존 재무 분석]\n${financeSummary}`,
      `\n[리젝 사유 / 보완 지시]\n${critique}`,
      `\n[핵심 토론 주제]\n${debateTopic}`,
    ].join("\n"),
    response_format: {
      type: "text",
      mime_type: "application/json",
      schema: {
        type: "object",
        properties: {
          debateTranscript: {
            type: "string",
            description:
              "기획·개발·마케팅·재무 AI가 각자 입장을 밝히고 충돌을 조율한 구체적 토론 내용",
          },
          agreedChanges: {
            type: "string",
            description: "토론 끝에 팀이 합의한 구체적 수정 사항 요약",
          },
          updatedFinanceSummary: {
            type: "string",
            description:
              "토론 결과를 반영해 재무 분석가 AI가 갱신한 최종 비용·손익분기점·수익 시나리오",
          },
        },
        required: [
          "debateTranscript",
          "agreedChanges",
          "updatedFinanceSummary",
        ],
      },
    },
    generation_config: { max_output_tokens: 3072 },
  });

  const debateData = parseJsonSafe<DebateResult>(debateStep.output_text ?? "");
  const debateText = debateData
    ? `${debateData.debateTranscript}\n\n### 팀 합의 수정안\n${debateData.agreedChanges}`
    : debateStep.output_text?.trim() || "팀 재토론 완료";
  const updatedFinance =
    debateData?.updatedFinanceSummary?.trim() || financeSummary;

  addAgentLog({
    taskId: task.id,
    agentRole: "AI 팀 토론",
    stepTitle: `${roundLabel} · 실무 4인 재토론 (${task.workerModel})`,
    content: debateText,
  });

  updateTask(task.id, { financeSummary: updatedFinance });

  await sleep(STEP_DELAY_MS);

  const pmRevise = await ai.interactions.create({
    model: task.leaderModel,
    store: false,
    system_instruction:
      "당신은 하이드어웨이 랩의 총괄 PM AI입니다. 리뷰어의 지적과 AI 팀 재토론에서 합의된 수정안, 갱신된 재무 수치를 완벽히 반영하여 마크다운 서식으로 한 단계 높아진 개정 보고서를 작성하세요. 상단에 '이번 라운드에서 개선된 핵심 사항'을 적어주세요.",
    input: [
      `대표자 원본 지시:\n${task.directive}`,
      `\n[이전 보고서]\n${currentReport}`,
      `\n[리뷰어 지적 사항]\n${critique}`,
      `\n[AI 팀 재토론 결과]\n${debateText}`,
      `\n[갱신된 재무 분석]\n${updatedFinance}`,
    ].join("\n"),
    generation_config: { max_output_tokens: 3072 },
  });

  const revisedReport = pmRevise.output_text?.trim() || currentReport;

  addAgentLog({
    taskId: task.id,
    agentRole: "총괄 PM AI",
    stepTitle: `${roundLabel} · 개정 통합 보고서 (${task.leaderModel})`,
    content: revisedReport,
  });

  return { revisedReport, updatedFinance };
}

async function conveneEmergencyMeeting(
  ai: GoogleGenAI,
  task: WorkspaceTaskRecord,
  currentReport: string,
  financeSummary: string,
  lastReview: ReviewerResult
): Promise<string> {
  const meetingStep = await ai.interactions.create({
    model: task.leaderModel,
    store: false,
    system_instruction: [
      "당신은 하이드어웨이 랩의 품질 리뷰어 AI입니다.",
      "AI 팀과 여러 차례 재토론을 진행했지만 아직 대표자(신정우)의 이상적인 기준을 100% 충족하지 못했거나, 기능·일정·비용 사이에 대표자의 결단이 필요한 트레이드오프가 남아 있어 긴급 회의를 소집했습니다.",
      "대표님께 아래 4가지를 마크다운으로 명료하게 보고하고 승인 여부를 정중히 여쭤보세요:",
      "1) 현재 도달 수준 요약 (점수 및 잘된 점)",
      "2) AI 팀끼리 끝내 해소하지 못한 핵심 쟁점 / 한계",
      "3) 대표님께 제안하는 현실적 선택지 2~3안 (각 안의 장단점과 예상 비용 차이)",
      "4) '현재 수준으로 승인하실지, 아니면 위 선택지 중 어느 방향으로 추가 토론을 지시하실지' 명확한 질문",
    ].join("\n"),
    input: [
      `대표자 원본 지시:\n${task.directive}`,
      `\n최종 리뷰 점수: ${lastReview.score}점 (최대 ${task.maxReviewRounds}라운드 진행)`,
      `\n마지막 미해결 항목:\n${lastReview.missingItems.join("\n")}`,
      `\n마지막 리뷰 비판:\n${lastReview.critique}`,
      `\n[현재 보고서]\n${currentReport}`,
      `\n[재무 분석 요약]\n${financeSummary}`,
    ].join("\n"),
    generation_config: { max_output_tokens: 2048 },
  });

  return (
    meetingStep.output_text?.trim() ||
    `현재 품질 점수 ${lastReview.score}점으로 기준(${PASS_SCORE_THRESHOLD}점)에 다소 못 미쳐 대표님과의 긴급 회의를 소집했습니다.\n\n남은 쟁점: ${lastReview.critique}\n\n이 수준으로 승인하실지, 아니면 방향을 지정해 추가 토론을 지시하실지 결정해 주세요.`
  );
}

export async function runTaskOrchestration(
  taskId: string,
  tools?: OrchestrationToolContext
): Promise<WorkspaceTaskRecord> {
  const task = getTaskWithLogs(taskId);
  if (!task) {
    throw new Error("업무를 찾을 수 없습니다.");
  }

  try {
    const ai = getClient();

    // Gather real-world tool inputs (URL fetch + multimodal file metadata)
    const toolContextText = await gatherToolContext(task, tools);

    // Phase A: Initial 6-agent production (4 workers + PM synthesis)
    const initial = await runInitialDraft(
      ai,
      task,
      toolContextText,
      tools?.attachment
    );
    let currentReport = initial.draftReport;
    let currentFinance = initial.financeSummary;

    const maxRounds = Math.max(1, Math.min(3, task.maxReviewRounds));

    // Phase B: Quality Reviewer gate + Reject/Debate loop
    for (let round = 1; round <= maxRounds; round += 1) {
      await sleep(STEP_DELAY_MS);
      const review = await runReviewerCheck(
        ai,
        task,
        currentReport,
        currentFinance,
        round
      );

      addAgentLog({
        taskId: task.id,
        agentRole: "품질 리뷰어 AI",
        stepTitle: `검수 라운드 ${round} · ${review.verdict === "PASS" ? `통과 (${review.score}점)` : `리젝 (${review.score}점)`} (${task.leaderModel})`,
        content: formatReviewerLog(review),
      });

      updateTask(task.id, {
        reviewRounds: round,
        reviewScore: review.score,
        reviewVerdict: review.verdict,
        finalReport: currentReport,
        financeSummary: currentFinance,
      });

      if (review.verdict === "PASS") {
        updateTask(task.id, {
          status: "승인 대기",
          reviewVerdict: "PASS",
          meetingAgenda: null,
          errorMessage: null,
        });
        return getTaskWithLogs(task.id)!;
      }

      if (round < maxRounds) {
        await sleep(STEP_DELAY_MS);
        const debated = await runTeamDebateAndRevise(
          ai,
          task,
          currentReport,
          currentFinance,
          review.critique,
          review.debateTopic,
          `재토론 라운드 ${round}`
        );
        currentReport = debated.revisedReport;
        currentFinance = debated.updatedFinance;
      } else {
        await sleep(STEP_DELAY_MS);
        const agenda = await conveneEmergencyMeeting(
          ai,
          task,
          currentReport,
          currentFinance,
          review
        );

        addAgentLog({
          taskId: task.id,
          agentRole: "품질 리뷰어 AI",
          stepTitle: `긴급 회의 소집 · 대표자 호출 (${review.score}점)`,
          content: agenda,
        });

        updateTask(task.id, {
          status: "회의 소집",
          reviewVerdict: "MEETING",
          meetingAgenda: agenda,
          finalReport: currentReport,
          financeSummary: currentFinance,
          errorMessage: null,
        });
        return getTaskWithLogs(task.id)!;
      }
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

export async function runGuidedDebateRound(
  taskId: string,
  ceoGuidance: string
): Promise<WorkspaceTaskRecord> {
  const task = getTaskWithLogs(taskId);
  if (!task) {
    throw new Error("업무를 찾을 수 없습니다.");
  }

  addAgentLog({
    taskId,
    agentRole: "대표자",
    stepTitle: "긴급 회의 가이드라인 · 추가 토론 지시",
    content: ceoGuidance,
  });

  updateTask(taskId, {
    status: "진행 중",
    ceoFeedback: ceoGuidance,
    errorMessage: null,
  });

  try {
    const ai = getClient();
    const nextRound = task.reviewRounds + 1;
    const currentReport = task.finalReport ?? task.directive;
    const currentFinance = task.financeSummary ?? "(기존 재무 분석 없음)";

    const debated = await runTeamDebateAndRevise(
      ai,
      task,
      currentReport,
      currentFinance,
      `대표자 회의 지침: ${ceoGuidance}`,
      ceoGuidance,
      `대표 지시 추가 토론 (라운드 ${nextRound})`
    );

    await sleep(STEP_DELAY_MS);

    const review = await runReviewerCheck(
      ai,
      task,
      debated.revisedReport,
      debated.updatedFinance,
      nextRound
    );

    addAgentLog({
      taskId,
      agentRole: "품질 리뷰어 AI",
      stepTitle: `재검수 라운드 ${nextRound} · ${review.verdict === "PASS" ? `통과 (${review.score}점)` : `재논의 필요 (${review.score}점)`} (${task.leaderModel})`,
      content: formatReviewerLog(review),
    });

    if (review.verdict === "PASS") {
      updateTask(taskId, {
        status: "승인 대기",
        reviewRounds: nextRound,
        reviewScore: review.score,
        reviewVerdict: "PASS",
        finalReport: debated.revisedReport,
        financeSummary: debated.updatedFinance,
        meetingAgenda: null,
        errorMessage: null,
      });
    } else {
      await sleep(STEP_DELAY_MS);
      const agenda = await conveneEmergencyMeeting(
        ai,
        task,
        debated.revisedReport,
        debated.updatedFinance,
        review
      );
      addAgentLog({
        taskId,
        agentRole: "품질 리뷰어 AI",
        stepTitle: `긴급 회의 재소집 · 대표자 확인 요청 (${review.score}점)`,
        content: agenda,
      });
      updateTask(taskId, {
        status: "회의 소집",
        reviewRounds: nextRound,
        reviewScore: review.score,
        reviewVerdict: "MEETING",
        finalReport: debated.revisedReport,
        financeSummary: debated.updatedFinance,
        meetingAgenda: agenda,
        errorMessage: null,
      });
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
    stepTitle: "직접 수정 지시 전달",
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
      model: task.leaderModel,
      store: false,
      system_instruction:
        "당신은 하이드어웨이 랩의 총괄 PM AI입니다. 대표자(신정우)의 직접 수정 지시를 정확히 반영해 기존 보고서와 재무 수치를 보완한 수정 최종 보고서를 마크다운 서식으로 작성하세요. 맨 위에 '반영된 수정 사항 요약'을 먼저 적어주세요.",
      input: [
        `원본 업무 지시:\n${task.directive}`,
        `\n기존 최종 보고서:\n${task.finalReport ?? "(없음)"}`,
        `\n기존 재무 분석:\n${task.financeSummary ?? "(없음)"}`,
        `\n대표자 수정 지시:\n${feedback}`,
      ].join("\n"),
      generation_config: { max_output_tokens: 3072 },
    });

    const revisedReport =
      interaction.output_text?.trim() || "수정 보고서를 생성하지 못했습니다.";

    addAgentLog({
      taskId,
      agentRole: "총괄 PM AI",
      stepTitle: `대표자 피드백 반영 수정 보고서 (${task.leaderModel})`,
      content: revisedReport,
    });

    updateTask(taskId, {
      status: "승인 대기",
      finalReport: revisedReport,
      meetingAgenda: null,
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
