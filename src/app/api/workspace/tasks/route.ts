import { NextResponse } from "next/server";
import { getCeoSession } from "@/lib/auth";
import {
  createTask,
  listTasksWithLogs,
  type LeaderModelId,
  type TaskMode,
  type WorkerModelId,
} from "@/lib/db";
import {
  ALLOWED_LEADER_MODELS,
  ALLOWED_MODES,
  ALLOWED_WORKER_MODELS,
  isGeminiConfigured,
  runTaskOrchestration,
} from "@/lib/ai-orchestrator";

export async function GET() {
  const session = await getCeoSession();
  if (!session) {
    return NextResponse.json(
      { error: "대표자 로그인이 필요합니다." },
      { status: 401 }
    );
  }

  const tasks = listTasksWithLogs();
  return NextResponse.json({
    tasks,
    hasApiKey: isGeminiConfigured(),
  });
}

export async function POST(request: Request) {
  const session = await getCeoSession();
  if (!session) {
    return NextResponse.json(
      { error: "대표자 로그인이 필요합니다." },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "잘못된 요청 형식입니다." },
      { status: 400 }
    );
  }

  const payload = body as {
    directive?: unknown;
    mode?: unknown;
    leaderModel?: unknown;
    workerModel?: unknown;
    maxReviewRounds?: unknown;
  };

  const directive =
    typeof payload.directive === "string" ? payload.directive.trim() : "";
  if (directive.length < 3 || directive.length > 2000) {
    return NextResponse.json(
      { error: "업무 지시는 3자 이상 2,000자 이하로 입력해 주세요." },
      { status: 400 }
    );
  }

  const mode: TaskMode = ALLOWED_MODES.includes(payload.mode as TaskMode)
    ? (payload.mode as TaskMode)
    : "fast";

  const leaderModel: LeaderModelId = ALLOWED_LEADER_MODELS.includes(
    payload.leaderModel as LeaderModelId
  )
    ? (payload.leaderModel as LeaderModelId)
    : "gemini-4-hydrogen";

  const workerModel: WorkerModelId = ALLOWED_WORKER_MODELS.includes(
    payload.workerModel as WorkerModelId
  )
    ? (payload.workerModel as WorkerModelId)
    : "gemini-3.5-flash-lite";

  const parsedRounds = Number(payload.maxReviewRounds);
  const maxReviewRounds =
    Number.isInteger(parsedRounds) && parsedRounds >= 1 && parsedRounds <= 3
      ? parsedRounds
      : 2;

  if (!isGeminiConfigured()) {
    return NextResponse.json(
      {
        error:
          "오라클 서버 .env.local에 GEMINI_API_KEY가 아직 설정되지 않았습니다.",
      },
      { status: 503 }
    );
  }

  const created = createTask({
    directive,
    mode,
    leaderModel,
    workerModel,
    maxReviewRounds,
  });
  const completed = await runTaskOrchestration(created.id);

  return NextResponse.json({ task: completed }, { status: 201 });
}
