import { NextResponse } from "next/server";
import { getCeoSession } from "@/lib/auth";
import { addAgentLog, deleteTask, getTaskWithLogs, updateTask } from "@/lib/db";
import {
  isGeminiConfigured,
  reviseTaskWithFeedback,
  runTaskOrchestration,
} from "@/lib/ai-orchestrator";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getCeoSession();
  if (!session) {
    return NextResponse.json(
      { error: "대표자 로그인이 필요합니다." },
      { status: 401 }
    );
  }

  const { id } = await context.params;
  const existing = getTaskWithLogs(id);
  if (!existing) {
    return NextResponse.json(
      { error: "해당 업무를 찾을 수 없습니다." },
      { status: 404 }
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
    action?: unknown;
    feedback?: unknown;
    note?: unknown;
  };

  if (payload.action === "approve") {
    const note =
      typeof payload.note === "string" && payload.note.trim()
        ? payload.note.trim()
        : "대표자 최종 승인 완료";

    addAgentLog({
      taskId: id,
      agentRole: "대표자",
      stepTitle: "최종 승인",
      content: note,
    });

    const updated = updateTask(id, {
      status: "완료",
      ceoFeedback: note,
      errorMessage: null,
    });

    return NextResponse.json({ task: updated });
  }

  if (payload.action === "revise") {
    const feedback =
      typeof payload.feedback === "string" ? payload.feedback.trim() : "";
    if (feedback.length < 2 || feedback.length > 1500) {
      return NextResponse.json(
        { error: "수정 지시는 2자 이상 1,500자 이하로 입력해 주세요." },
        { status: 400 }
      );
    }

    if (!isGeminiConfigured()) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY가 서버에 설정되지 않았습니다." },
        { status: 503 }
      );
    }

    const revised = await reviseTaskWithFeedback(id, feedback);
    return NextResponse.json({ task: revised });
  }

  if (payload.action === "retry") {
    if (!isGeminiConfigured()) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY가 서버에 설정되지 않았습니다." },
        { status: 503 }
      );
    }

    updateTask(id, { status: "진행 중", errorMessage: null });
    const retried = await runTaskOrchestration(id);
    return NextResponse.json({ task: retried });
  }

  return NextResponse.json(
    { error: "지원하지 않는 작업 요청입니다." },
    { status: 400 }
  );
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getCeoSession();
  if (!session) {
    return NextResponse.json(
      { error: "대표자 로그인이 필요합니다." },
      { status: 401 }
    );
  }

  const { id } = await context.params;
  const deleted = deleteTask(id);
  if (!deleted) {
    return NextResponse.json(
      { error: "해당 업무를 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true });
}
