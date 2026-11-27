import { NextResponse } from "next/server";
import { getCeoSession } from "@/lib/auth";
import {
  createTask,
  listTasksWithLogs,
  TASK_CATEGORIES,
  type LeaderModelId,
  type TaskCategory,
  type TaskMode,
  type WorkerModelId,
} from "@/lib/db";
import {
  ALLOWED_LEADER_MODELS,
  ALLOWED_MODES,
  ALLOWED_WORKER_MODELS,
  isGeminiConfigured,
  runTaskOrchestration,
  type UploadedAttachment,
} from "@/lib/ai-orchestrator";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB cap for cost & memory safety
const MAX_TEXT_FILE_CHARS = 18000;

const ALLOWED_BINARY_MIMES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

const ALLOWED_TEXT_MIMES = new Set([
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
]);

function isTextFileName(name: string): boolean {
  const lower = name.toLowerCase();
  return (
    lower.endsWith(".txt") ||
    lower.endsWith(".md") ||
    lower.endsWith(".csv") ||
    lower.endsWith(".json")
  );
}

function parseUrlList(raw: string): string[] {
  return raw
    .split(/[\n,\s]+/)
    .map((u) => u.trim())
    .filter((u) => u.startsWith("http://") || u.startsWith("https://"))
    .slice(0, 2);
}

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

  let rawDirective = "";
  let rawCategory = "";
  let rawMode = "";
  let rawLeaderModel = "";
  let rawWorkerModel = "";
  let rawMaxRounds: unknown = 2;
  let referenceUrls: string[] = [];
  let attachment: UploadedAttachment | null = null;

  const contentType = request.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      rawDirective = String(formData.get("directive") ?? "");
      rawCategory = String(formData.get("category") ?? "");
      rawMode = String(formData.get("mode") ?? "");
      rawLeaderModel = String(formData.get("leaderModel") ?? "");
      rawWorkerModel = String(formData.get("workerModel") ?? "");
      rawMaxRounds = formData.get("maxReviewRounds");
      referenceUrls = parseUrlList(String(formData.get("referenceUrls") ?? ""));

      const fileEntry = formData.get("attachment");
      if (fileEntry instanceof File && fileEntry.size > 0) {
        if (fileEntry.size > MAX_FILE_SIZE_BYTES) {
          return NextResponse.json(
            { error: "첨부 파일은 최대 5MB까지만 업로드할 수 있습니다." },
            { status: 400 }
          );
        }

        const mime = fileEntry.type.toLowerCase();
        const fileName = fileEntry.name || "attachment";

        if (ALLOWED_BINARY_MIMES.has(mime)) {
          const buffer = Buffer.from(await fileEntry.arrayBuffer());
          attachment = {
            name: fileName,
            mimeType: mime,
            base64Data: buffer.toString("base64"),
            sizeBytes: fileEntry.size,
          };
        } else if (ALLOWED_TEXT_MIMES.has(mime) || isTextFileName(fileName)) {
          const text = await fileEntry.text();
          attachment = {
            name: fileName,
            mimeType: mime || "text/plain",
            textContent: text.slice(0, MAX_TEXT_FILE_CHARS),
            sizeBytes: fileEntry.size,
          };
        } else {
          return NextResponse.json(
            {
              error:
                "지원하는 첨부 파일 형식은 PNG, JPG, WEBP, GIF, PDF, TXT, MD, CSV, JSON입니다.",
            },
            { status: 400 }
          );
        }
      }
    } else {
      const payload = (await request.json()) as {
        directive?: unknown;
        category?: unknown;
        mode?: unknown;
        leaderModel?: unknown;
        workerModel?: unknown;
        maxReviewRounds?: unknown;
        referenceUrls?: unknown;
      };
      rawDirective =
        typeof payload.directive === "string" ? payload.directive : "";
      rawCategory =
        typeof payload.category === "string" ? payload.category : "";
      rawMode = typeof payload.mode === "string" ? payload.mode : "";
      rawLeaderModel =
        typeof payload.leaderModel === "string" ? payload.leaderModel : "";
      rawWorkerModel =
        typeof payload.workerModel === "string" ? payload.workerModel : "";
      rawMaxRounds = payload.maxReviewRounds;
      if (Array.isArray(payload.referenceUrls)) {
        referenceUrls = payload.referenceUrls
          .filter((u): u is string => typeof u === "string")
          .map((u) => u.trim())
          .filter((u) => u.startsWith("http://") || u.startsWith("https://"))
          .slice(0, 2);
      } else if (typeof payload.referenceUrls === "string") {
        referenceUrls = parseUrlList(payload.referenceUrls);
      }
    }
  } catch {
    return NextResponse.json(
      { error: "요청 데이터를 처리할 수 없습니다." },
      { status: 400 }
    );
  }

  const directive = rawDirective.trim();
  if (directive.length < 3 || directive.length > 2000) {
    return NextResponse.json(
      { error: "업무 지시는 3자 이상 2,000자 이하로 입력해 주세요." },
      { status: 400 }
    );
  }

  const category: TaskCategory = TASK_CATEGORIES.includes(
    rawCategory as TaskCategory
  )
    ? (rawCategory as TaskCategory)
    : "앱 · 서비스 개발";

  const mode: TaskMode = ALLOWED_MODES.includes(rawMode as TaskMode)
    ? (rawMode as TaskMode)
    : "fast";

  const leaderModel: LeaderModelId = ALLOWED_LEADER_MODELS.includes(
    rawLeaderModel as LeaderModelId
  )
    ? (rawLeaderModel as LeaderModelId)
    : "gemini-4-hydrogen";

  const workerModel: WorkerModelId = ALLOWED_WORKER_MODELS.includes(
    rawWorkerModel as WorkerModelId
  )
    ? (rawWorkerModel as WorkerModelId)
    : "gemini-3.5-flash-lite";

  const parsedRounds = Number(rawMaxRounds);
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
    category,
    mode,
    leaderModel,
    workerModel,
    maxReviewRounds,
    referenceUrls,
    attachmentName: attachment?.name ?? null,
    attachmentMime: attachment?.mimeType ?? null,
  });

  const completed = await runTaskOrchestration(created.id, {
    attachment,
    referenceUrls,
  });

  return NextResponse.json({ task: completed }, { status: 201 });
}
