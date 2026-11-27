import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

export type TaskMode = "fast" | "deep";
export type LeaderModelId =
  | "gemini-4-hydrogen"
  | "gemini-4-argon"
  | "gemini-4-neon";
export type WorkerModelId = "gemini-3.5-flash-lite" | "gemini-4-hydrogen";
export type ReviewVerdict = "PASS" | "REJECT" | "MEETING";
export type TaskStatus = "진행 중" | "승인 대기" | "회의 소집" | "완료" | "오류";

export type AgentRoleName =
  | "총괄 PM AI"
  | "품질 리뷰어 AI"
  | "재무 분석가 AI"
  | "기획 · 리서치 AI"
  | "개발 AI"
  | "마케팅 · 카피 AI"
  | "AI 팀 토론"
  | "대표자";

export interface AgentLogRecord {
  id: number;
  taskId: string;
  agentRole: AgentRoleName;
  stepTitle: string;
  content: string;
  createdAt: string;
}

export interface WorkspaceTaskRecord {
  id: string;
  title: string;
  directive: string;
  mode: TaskMode;
  model: string;
  leaderModel: LeaderModelId;
  workerModel: WorkerModelId;
  maxReviewRounds: number;
  reviewRounds: number;
  reviewScore: number | null;
  reviewVerdict: ReviewVerdict | null;
  status: TaskStatus;
  finalReport: string | null;
  financeSummary: string | null;
  meetingAgenda: string | null;
  ceoFeedback: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  logs: AgentLogRecord[];
}

interface RawTaskRow {
  id: string;
  title: string;
  directive: string;
  mode: string;
  model: string;
  leader_model: string | null;
  worker_model: string | null;
  max_review_rounds: number | null;
  review_rounds: number | null;
  review_score: number | null;
  review_verdict: string | null;
  status: string;
  final_report: string | null;
  finance_summary: string | null;
  meeting_agenda: string | null;
  ceo_feedback: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

interface RawLogRow {
  id: number;
  task_id: string;
  agent_role: string;
  step_title: string;
  content: string;
  created_at: string;
}

let dbInstance: DatabaseSync | null = null;

function ensureTaskColumns(db: DatabaseSync): void {
  const cols = db.prepare("PRAGMA table_info(tasks)").all() as Array<{
    name: string;
  }>;
  const existing = new Set(cols.map((c) => c.name));

  const migrations: Array<{ name: string; sql: string }> = [
    {
      name: "leader_model",
      sql: "ALTER TABLE tasks ADD COLUMN leader_model TEXT NOT NULL DEFAULT 'gemini-4-hydrogen'",
    },
    {
      name: "worker_model",
      sql: "ALTER TABLE tasks ADD COLUMN worker_model TEXT NOT NULL DEFAULT 'gemini-3.5-flash-lite'",
    },
    {
      name: "max_review_rounds",
      sql: "ALTER TABLE tasks ADD COLUMN max_review_rounds INTEGER NOT NULL DEFAULT 2",
    },
    {
      name: "review_rounds",
      sql: "ALTER TABLE tasks ADD COLUMN review_rounds INTEGER NOT NULL DEFAULT 0",
    },
    {
      name: "review_score",
      sql: "ALTER TABLE tasks ADD COLUMN review_score INTEGER",
    },
    {
      name: "review_verdict",
      sql: "ALTER TABLE tasks ADD COLUMN review_verdict TEXT",
    },
    {
      name: "finance_summary",
      sql: "ALTER TABLE tasks ADD COLUMN finance_summary TEXT",
    },
    {
      name: "meeting_agenda",
      sql: "ALTER TABLE tasks ADD COLUMN meeting_agenda TEXT",
    },
  ];

  for (const m of migrations) {
    if (!existing.has(m.name)) {
      db.exec(m.sql);
    }
  }
}

function getDb(): DatabaseSync {
  if (dbInstance) {
    return dbInstance;
  }

  const dataDir = path.join(process.cwd(), "data");
  fs.mkdirSync(dataDir, { recursive: true });
  const dbPath = path.join(dataDir, "workspace.db");

  const db = new DatabaseSync(dbPath);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      directive TEXT NOT NULL,
      mode TEXT NOT NULL,
      model TEXT NOT NULL,
      leader_model TEXT NOT NULL DEFAULT 'gemini-4-hydrogen',
      worker_model TEXT NOT NULL DEFAULT 'gemini-3.5-flash-lite',
      max_review_rounds INTEGER NOT NULL DEFAULT 2,
      review_rounds INTEGER NOT NULL DEFAULT 0,
      review_score INTEGER,
      review_verdict TEXT,
      status TEXT NOT NULL,
      final_report TEXT,
      finance_summary TEXT,
      meeting_agenda TEXT,
      ceo_feedback TEXT,
      error_message TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS agent_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id TEXT NOT NULL,
      agent_role TEXT NOT NULL,
      step_title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_agent_logs_task_id ON agent_logs(task_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
  `);

  ensureTaskColumns(db);

  dbInstance = db;
  return db;
}

function mapLogRow(row: RawLogRow): AgentLogRecord {
  return {
    id: row.id,
    taskId: row.task_id,
    agentRole: row.agent_role as AgentRoleName,
    stepTitle: row.step_title,
    content: row.content,
    createdAt: row.created_at,
  };
}

function mapTaskRow(
  row: RawTaskRow,
  logs: AgentLogRecord[]
): WorkspaceTaskRecord {
  return {
    id: row.id,
    title: row.title,
    directive: row.directive,
    mode: row.mode as TaskMode,
    model: row.model,
    leaderModel: (row.leader_model as LeaderModelId) || "gemini-4-hydrogen",
    workerModel: (row.worker_model as WorkerModelId) || "gemini-3.5-flash-lite",
    maxReviewRounds: row.max_review_rounds ?? 2,
    reviewRounds: row.review_rounds ?? 0,
    reviewScore: row.review_score ?? null,
    reviewVerdict: (row.review_verdict as ReviewVerdict | null) ?? null,
    status: row.status as TaskStatus,
    finalReport: row.final_report,
    financeSummary: row.finance_summary ?? null,
    meetingAgenda: row.meeting_agenda ?? null,
    ceoFeedback: row.ceo_feedback,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    logs,
  };
}

function generateTaskId(db: DatabaseSync): string {
  const row = db
    .prepare("SELECT COUNT(*) as count FROM tasks")
    .get() as { count: number };
  const nextNumber = (row?.count ?? 0) + 1;
  const suffix = String(nextNumber).padStart(3, "0");
  const candidate = `TASK-${suffix}`;
  const exists = db
    .prepare("SELECT 1 FROM tasks WHERE id = ?")
    .get(candidate);
  if (!exists) {
    return candidate;
  }
  return `TASK-${Date.now().toString().slice(-6)}`;
}

export function listTasksWithLogs(): WorkspaceTaskRecord[] {
  const db = getDb();
  const taskRows = db
    .prepare("SELECT * FROM tasks ORDER BY created_at DESC")
    .all() as unknown as RawTaskRow[];

  if (taskRows.length === 0) {
    return [];
  }

  const logRows = db
    .prepare("SELECT * FROM agent_logs ORDER BY id ASC")
    .all() as unknown as RawLogRow[];

  const logsByTask = new Map<string, AgentLogRecord[]>();
  for (const rawLog of logRows) {
    const mapped = mapLogRow(rawLog);
    const list = logsByTask.get(mapped.taskId);
    if (list) {
      list.push(mapped);
    } else {
      logsByTask.set(mapped.taskId, [mapped]);
    }
  }

  return taskRows.map((row) => mapTaskRow(row, logsByTask.get(row.id) ?? []));
}

export function getTaskWithLogs(id: string): WorkspaceTaskRecord | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .get(id) as unknown as RawTaskRow | undefined;

  if (!row) {
    return null;
  }

  const logRows = db
    .prepare("SELECT * FROM agent_logs WHERE task_id = ? ORDER BY id ASC")
    .all(id) as unknown as RawLogRow[];

  return mapTaskRow(row, logRows.map(mapLogRow));
}

export function createTask(params: {
  directive: string;
  mode: TaskMode;
  leaderModel: LeaderModelId;
  workerModel: WorkerModelId;
  maxReviewRounds: number;
}): WorkspaceTaskRecord {
  const db = getDb();
  const id = generateTaskId(db);
  const now = new Date().toISOString();
  const initialTitle =
    params.directive.length > 42
      ? `${params.directive.slice(0, 42)}…`
      : params.directive;

  db.prepare(
    `INSERT INTO tasks (
      id, title, directive, mode, model,
      leader_model, worker_model, max_review_rounds,
      review_rounds, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`
  ).run(
    id,
    initialTitle,
    params.directive,
    params.mode,
    `${params.leaderModel} / ${params.workerModel}`,
    params.leaderModel,
    params.workerModel,
    params.maxReviewRounds,
    "진행 중",
    now,
    now
  );

  return getTaskWithLogs(id)!;
}

export function addAgentLog(params: {
  taskId: string;
  agentRole: AgentRoleName;
  stepTitle: string;
  content: string;
}): void {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO agent_logs (task_id, agent_role, step_title, content, created_at)
     VALUES (?, ?, ?, ?, ?)`
  ).run(params.taskId, params.agentRole, params.stepTitle, params.content, now);
  db.prepare("UPDATE tasks SET updated_at = ? WHERE id = ?").run(
    now,
    params.taskId
  );
}

export function updateTask(
  id: string,
  updates: {
    title?: string;
    status?: TaskStatus;
    reviewRounds?: number;
    reviewScore?: number | null;
    reviewVerdict?: ReviewVerdict | null;
    finalReport?: string | null;
    financeSummary?: string | null;
    meetingAgenda?: string | null;
    ceoFeedback?: string | null;
    errorMessage?: string | null;
  }
): WorkspaceTaskRecord | null {
  const db = getDb();
  const existing = getTaskWithLogs(id);
  if (!existing) {
    return null;
  }

  const now = new Date().toISOString();
  db.prepare(
    `UPDATE tasks
     SET title = ?,
         status = ?,
         review_rounds = ?,
         review_score = ?,
         review_verdict = ?,
         final_report = ?,
         finance_summary = ?,
         meeting_agenda = ?,
         ceo_feedback = ?,
         error_message = ?,
         updated_at = ?
     WHERE id = ?`
  ).run(
    updates.title ?? existing.title,
    updates.status ?? existing.status,
    updates.reviewRounds ?? existing.reviewRounds,
    updates.reviewScore !== undefined
      ? updates.reviewScore
      : existing.reviewScore,
    updates.reviewVerdict !== undefined
      ? updates.reviewVerdict
      : existing.reviewVerdict,
    updates.finalReport !== undefined
      ? updates.finalReport
      : existing.finalReport,
    updates.financeSummary !== undefined
      ? updates.financeSummary
      : existing.financeSummary,
    updates.meetingAgenda !== undefined
      ? updates.meetingAgenda
      : existing.meetingAgenda,
    updates.ceoFeedback !== undefined
      ? updates.ceoFeedback
      : existing.ceoFeedback,
    updates.errorMessage !== undefined
      ? updates.errorMessage
      : existing.errorMessage,
    now,
    id
  );

  return getTaskWithLogs(id);
}

export function deleteTask(id: string): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
  return Number(result.changes) > 0;
}
