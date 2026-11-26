import { NextResponse } from "next/server";
import { getCeoSession } from "@/lib/auth";
import {
  createTask,
  listTasksWithLogs,
  type GeminiModelId,
  type TaskMode,
} from "@/lib/db";
import {
  ALLOWED_MODELS,
  ALLOWED_MODES,
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
    model?: unknown;
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

  const model: GeminiModelId = ALLOWED_MODELS.includes(
    payload.model as GeminiModelId
  )
    ? (payload.model as GeminiModelId)
    : "gemini-3.5-flash-lite";

  if (!isGeminiConfigured()) {
    return NextResponse.json(
      {
        error:
          "오라클 서버 .env.local에 GEMINI_API_KEY가 아직 설정되지 않았습니다.",
      },
      { status: 503 }
    );
  }

  const created = createTask({ directive, mode, model });
  const completed = await runTaskOrchestration(created.id);

  return NextResponse.json({ task: completed }, { status: 201 });
}
