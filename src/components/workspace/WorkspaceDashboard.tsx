"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Bot,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  FileText,
  Layers,
  Loader2,
  LogOut,
  MessageSquarePlus,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserCheck,
  Zap,
} from "lucide-react";
import { BrandMark } from "@/components/Navbar";
import { logoutAction } from "@/app/workspace/actions";
import type {
  AgentRoleName,
  GeminiModelId,
  TaskMode,
  TaskStatus,
  WorkspaceTaskRecord,
} from "@/lib/db";

const previewTasks: WorkspaceTaskRecord[] = [
  {
    id: "DEMO-001",
    title: "1인 사업자용 영수증 정리 앱 MVP 기획",
    directive:
      "1인 사업자용 영수증 정리 앱 기획서 작성하고 MVP 기능과 초기 마케팅 전략 잡아줘",
    mode: "fast",
    model: "gemini-3.5-flash-lite",
    status: "승인 대기",
    finalReport:
      "## 핵심 결론\n1인 사업자가 영수증 사진을 찍어 올리면 자동으로 항목·부가세·경비 분류 후 엑셀로 내보내는 초경량 웹앱을 2주 MVP로 출시하는 전략을 추천합니다.\n\n## 당장 실행할 다음 액션 3가지\n1. 핵심 기능 3개(사진 업로드, OCR 자동 분류, CSV 다운로드)만 포함한 프로토타입 제작\n2. 세무 신고 시즌(5월·1월) 키워드 중심 랜딩 페이지 공개\n3. 초기 1인 사업자 10명 무료 베타 테스트 후 월 4,900원 구독 모델 검증",
    ceoFeedback: null,
    errorMessage: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    logs: [
      {
        id: 1,
        taskId: "DEMO-001",
        agentRole: "총괄 PM AI",
        stepTitle: "목표 분석 및 업무 분해",
        content:
          "1인 사업자 세무 정리의 가장 큰 병목인 '영수증 수기 입력' 해결에 집중하여 2주 내 출시 가능한 MVP 범위로 기획·개발·마케팅 업무를 분배했습니다.",
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        taskId: "DEMO-001",
        agentRole: "기획 · 리서치 AI",
        stepTitle: "시장 분석 및 MVP 기획",
        content:
          "기존 회계 프로그램은 기능이 과도하게 복잡합니다. 스마트폰 촬영 → 자동 분류 → 월별 합계 확인의 3단계 흐름에 집중하면 높은 재사용률을 기대할 수 있습니다.",
        createdAt: new Date().toISOString(),
      },
      {
        id: 3,
        taskId: "DEMO-001",
        agentRole: "개발 AI",
        stepTitle: "기술 아키텍처 및 구현 설계",
        content:
          "Next.js + Gemini 멀티모달 영수증 파싱 + 오라클 서버 SQLite 조합으로 서버비 0원 MVP 구현이 가능합니다.",
        createdAt: new Date().toISOString(),
      },
      {
        id: 4,
        taskId: "DEMO-001",
        agentRole: "마케팅 · 카피 AI",
        stepTitle: "브랜딩 카피 및 초기 성장 전략",
        content:
          "슬로건 제안: '영수증 사진 한 장으로 끝내는 1인 사업자 경비 정리'. 네이버 블로그·스레드·1인 창업 커뮤니티 중심으로 초기 사용자를 확보합니다.",
        createdAt: new Date().toISOString(),
      },
    ],
  },
];

const roleBadgeStyles: Record<AgentRoleName, string> = {
  "총괄 PM AI": "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
  "기획 · 리서치 AI": "border-sky-400/30 bg-sky-500/10 text-sky-300",
  "개발 AI": "border-amber-400/30 bg-amber-500/10 text-amber-300",
  "마케팅 · 카피 AI": "border-violet-400/30 bg-violet-500/10 text-violet-300",
  대표자: "border-white/25 bg-white/10 text-white",
};

interface WorkspaceDashboardProps {
  mode: "authenticated" | "preview";
  ceoEmail?: string;
  initialTasks?: WorkspaceTaskRecord[];
  hasGeminiApiKey?: boolean;
  onExitPreview?: () => void;
}

export function WorkspaceDashboard({
  mode,
  ceoEmail,
  initialTasks = [],
  hasGeminiApiKey = false,
  onExitPreview,
}: WorkspaceDashboardProps) {
  const isAuthenticated = mode === "authenticated";

  const [tasks, setTasks] = useState<WorkspaceTaskRecord[]>(
    isAuthenticated ? initialTasks : previewTasks
  );
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(
    (isAuthenticated ? initialTasks : previewTasks)[0]?.id ?? null
  );
  const [activeTab, setActiveTab] = useState<"report" | "logs">("report");

  const [directive, setDirective] = useState("");
  const [collabMode, setCollabMode] = useState<TaskMode>("fast");
  const [model, setModel] = useState<GeminiModelId>("gemini-3.5-flash-lite");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [revisionText, setRevisionText] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const selectedTask =
    tasks.find((t) => t.id === selectedTaskId) ?? tasks[0] ?? null;

  function upsertTask(updated: WorkspaceTaskRecord) {
    setTasks((prev) => {
      const exists = prev.some((t) => t.id === updated.id);
      if (exists) {
        return prev.map((t) => (t.id === updated.id ? updated : t));
      }
      return [updated, ...prev];
    });
    setSelectedTaskId(updated.id);
  }

  async function handleAddDirective(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = directive.trim();
    if (!trimmed) return;
    setActionError(null);

    if (!isAuthenticated) {
      const now = new Date().toISOString();
      const demoTask: WorkspaceTaskRecord = {
        id: `DEMO-00${tasks.length + 1}`,
        title: trimmed.length > 36 ? `${trimmed.slice(0, 36)}…` : trimmed,
        directive: trimmed,
        mode: collabMode,
        model,
        status: "승인 대기",
        finalReport:
          "미리보기 모드에서는 실제 Gemini API를 호출하지 않습니다.\n대표자 계정으로 로그인하시면 총괄 PM·기획·개발·마케팅 AI가 실제 협업 보고서를 생성하고 서버 DB에 영구 저장합니다.",
        ceoFeedback: null,
        errorMessage: null,
        createdAt: now,
        updatedAt: now,
        logs: [
          {
            id: Date.now(),
            taskId: `DEMO-00${tasks.length + 1}`,
            agentRole: "총괄 PM AI",
            stepTitle: "미리보기 접수 완료",
            content: `"${trimmed}" 지시가 미리보기 보드에 추가되었습니다.`,
            createdAt: now,
          },
        ],
      };
      upsertTask(demoTask);
      setDirective("");
      setActiveTab("report");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/workspace/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          directive: trimmed,
          mode: collabMode,
          model,
        }),
      });
      const data = (await res.json()) as {
        task?: WorkspaceTaskRecord;
        error?: string;
      };
      if (!res.ok || !data.task) {
        setActionError(data.error ?? "업무 생성 중 오류가 발생했습니다.");
        return;
      }
      upsertTask(data.task);
      setDirective("");
      setActiveTab("report");
    } catch {
      setActionError("서버와 통신하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleApprove(taskId: string) {
    setActionError(null);

    if (!isAuthenticated) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, status: "완료", ceoFeedback: "대표자 승인 완료 (미리보기)" }
            : t
        )
      );
      return;
    }

    setBusyTaskId(taskId);
    try {
      const res = await fetch(`/api/workspace/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      const data = (await res.json()) as {
        task?: WorkspaceTaskRecord;
        error?: string;
      };
      if (!res.ok || !data.task) {
        setActionError(data.error ?? "승인 처리에 실패했습니다.");
        return;
      }
      upsertTask(data.task);
    } catch {
      setActionError("승인 요청 중 네트워크 오류가 발생했습니다.");
    } finally {
      setBusyTaskId(null);
    }
  }

  async function handleRevise(e: React.FormEvent, taskId: string) {
    e.preventDefault();
    const trimmed = revisionText.trim();
    if (!trimmed) return;
    setActionError(null);

    if (!isAuthenticated) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                ceoFeedback: trimmed,
                logs: [
                  ...t.logs,
                  {
                    id: Date.now(),
                    taskId,
                    agentRole: "대표자",
                    stepTitle: "수정 지시 (미리보기)",
                    content: trimmed,
                    createdAt: new Date().toISOString(),
                  },
                ],
              }
            : t
        )
      );
      setRevisionText("");
      return;
    }

    setBusyTaskId(taskId);
    try {
      const res = await fetch(`/api/workspace/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revise", feedback: trimmed }),
      });
      const data = (await res.json()) as {
        task?: WorkspaceTaskRecord;
        error?: string;
      };
      if (!res.ok || !data.task) {
        setActionError(data.error ?? "수정 지시 처리에 실패했습니다.");
        return;
      }
      upsertTask(data.task);
      setRevisionText("");
      setActiveTab("report");
    } catch {
      setActionError("수정 지시 요청 중 네트워크 오류가 발생했습니다.");
    } finally {
      setBusyTaskId(null);
    }
  }

  async function handleRetry(taskId: string) {
    if (!isAuthenticated) return;
    setActionError(null);
    setBusyTaskId(taskId);
    try {
      const res = await fetch(`/api/workspace/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "retry" }),
      });
      const data = (await res.json()) as {
        task?: WorkspaceTaskRecord;
        error?: string;
      };
      if (!res.ok || !data.task) {
        setActionError(data.error ?? "재시도에 실패했습니다.");
        return;
      }
      upsertTask(data.task);
    } catch {
      setActionError("재시도 요청 중 네트워크 오류가 발생했습니다.");
    } finally {
      setBusyTaskId(null);
    }
  }

  async function handleDelete(taskId: string) {
    if (!window.confirm("이 업무와 모든 AI 협업 기록을 삭제할까요?")) {
      return;
    }
    setActionError(null);

    if (!isAuthenticated) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      if (selectedTaskId === taskId) {
        setSelectedTaskId(null);
      }
      return;
    }

    setBusyTaskId(taskId);
    try {
      const res = await fetch(`/api/workspace/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setActionError("삭제 처리에 실패했습니다.");
        return;
      }
      setTasks((prev) => {
        const next = prev.filter((t) => t.id !== taskId);
        if (selectedTaskId === taskId) {
          setSelectedTaskId(next[0]?.id ?? null);
        }
        return next;
      });
    } catch {
      setActionError("삭제 요청 중 네트워크 오류가 발생했습니다.");
    } finally {
      setBusyTaskId(null);
    }
  }

  async function handleCopyReport(task: WorkspaceTaskRecord) {
    if (!task.finalReport) return;
    try {
      await navigator.clipboard.writeText(task.finalReport);
      setCopiedId(task.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setActionError("클립보드 복사에 실패했습니다.");
    }
  }

  function formatTime(iso: string): string {
    try {
      return new Intl.DateTimeFormat("ko-KR", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(iso));
    } catch {
      return "";
    }
  }

  const statusCounts: Record<"전체" | TaskStatus, number> = {
    전체: tasks.length,
    "진행 중": tasks.filter((t) => t.status === "진행 중").length,
    "승인 대기": tasks.filter((t) => t.status === "승인 대기").length,
    완료: tasks.filter((t) => t.status === "완료").length,
    오류: tasks.filter((t) => t.status === "오류").length,
  };

  return (
    <div className="min-h-screen bg-[#090a0c] text-zinc-100">
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#090a0c]/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-3">
            <BrandMark />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-white">
                  Hideaway AI Workspace
                </span>
                {isAuthenticated ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                    <ShieldCheck className="h-3 w-3" />
                    CEO AUTHENTICATED
                  </span>
                ) : (
                  <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                    PREVIEW MODE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-500">
                {isAuthenticated
                  ? `${ceoEmail ?? "CEO"} · Gemini AI 협업 엔진 + SQLite 영구 저장`
                  : "공개 UI 미리보기 (실제 AI 실행은 대표자 로그인 후 가능)"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-200"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>로그아웃</span>
                </button>
              </form>
            ) : (
              onExitPreview && (
                <button
                  type="button"
                  onClick={onExitPreview}
                  className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 transition hover:bg-white/10"
                >
                  로그인 화면으로
                </button>
              )
            )}
            <Link
              href="/"
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-400 transition hover:text-white"
            >
              홈으로
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        {isAuthenticated && !hasGeminiApiKey && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-xs leading-relaxed text-amber-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            <div>
              <p className="font-semibold text-amber-100">
                GEMINI_API_KEY가 아직 서버에 설정되지 않았습니다
              </p>
              <p className="mt-1 text-amber-200/80">
                오라클 서버의 <code>~/hideawaylab-web/.env.local</code> 파일에{" "}
                <code>GEMINI_API_KEY=...</code>를 추가하고{" "}
                <code>pm2 restart hideaway-web --update-env</code>를 실행하면
                바로 실제 AI 협업이 시작됩니다.
              </p>
            </div>
          </div>
        )}

        {/* CEO Command Bar */}
        <section className="rounded-2xl border border-emerald-400/25 bg-gradient-to-br from-[#101616] to-[#0e1015] p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-300">
              <Sparkles className="h-4 w-4" />
              <span>CEO COMMAND BAR</span>
            </div>
            <span className="text-[11px] text-zinc-400">
              {collabMode === "fast"
                ? "빠른 협업: 1회 호출 (무료 티어 권장 · 약 5~10초)"
                : "정밀 협업: 5단계 순차 호출 (심층 분석 · 약 25~45초)"}
            </span>
          </div>

          <h1 className="mt-2 text-xl font-bold text-white">
            오늘 AI 팀에게 어떤 업무를 지시할까요?
          </h1>

          <form onSubmit={handleAddDirective} className="mt-4 space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={directive}
                onChange={(e) => setDirective(e.target.value)}
                disabled={isSubmitting}
                placeholder="예: 1인 사업자용 영수증 정리 앱 기획서 작성하고 MVP 기술 스택과 런칭 카피 만들어 줘"
                className="flex-1 rounded-xl border border-white/12 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-400/60 focus:outline-none disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={isSubmitting || !directive.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>AI 협업 중...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>지시 보내기</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
              <div className="inline-flex rounded-xl border border-white/10 bg-black/30 p-1">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setCollabMode("fast")}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition ${
                    collabMode === "fast"
                      ? "bg-emerald-500/20 text-emerald-200"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Zap className="h-3.5 w-3.5" />
                  <span>빠른 협업 (1회)</span>
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setCollabMode("deep")}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition ${
                    collabMode === "deep"
                      ? "bg-emerald-500/20 text-emerald-200"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>정밀 협업 (5단계)</span>
                </button>
              </div>

              <label className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-1.5 text-zinc-400">
                <span>모델</span>
                <select
                  value={model}
                  disabled={isSubmitting}
                  onChange={(e) => setModel(e.target.value as GeminiModelId)}
                  className="bg-transparent font-medium text-zinc-100 focus:outline-none"
                >
                  <option value="gemini-3.5-flash-lite" className="bg-[#101217]">
                    Gemini 3.5 Flash-Lite (초고속·최저비용)
                  </option>
                  <option value="gemini-4-hydrogen" className="bg-[#101217]">
                    Gemini 4 Hydrogen (고품질·균형형)
                  </option>
                </select>
              </label>
            </div>
          </form>

          {isSubmitting && (
            <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-200">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
              <span>
                총괄 PM · 기획 · 개발 · 마케팅 AI가 지시를 분석하고 보고서를
                작성 중입니다. 잠시만 기다려 주세요...
              </span>
            </div>
          )}

          {actionError && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-xs text-red-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
              <span>{actionError}</span>
            </div>
          )}
        </section>

        {/* Status Summary */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(["전체", "승인 대기", "완료", "오류"] as const).map((label) => (
            <div
              key={label}
              className="rounded-2xl border border-white/8 bg-[#101217] p-4"
            >
              <p className="text-xs text-zinc-500">{label}</p>
              <p className="mt-1 text-2xl font-bold text-white">
                {statusCounts[label]}
              </p>
            </div>
          ))}
        </section>

        {/* 2-Column Workspace Board & Detail Report */}
        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.45fr]">
          {/* Left: Task List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">
                업무 목록 ({tasks.length})
              </h2>
              <span className="text-[11px] text-zinc-500">
                클릭하여 보고서 확인
              </span>
            </div>

            {tasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/12 bg-[#101217]/50 p-8 text-center text-xs text-zinc-400">
                <Bot className="mx-auto h-7 w-7 text-zinc-600" />
                <p className="mt-3 font-medium text-zinc-300">
                  아직 지시된 업무가 없습니다
                </p>
                <p className="mt-1 text-zinc-500">
                  위 CEO Command Bar에 첫 업무 지시를 입력해 보세요.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {tasks.map((task) => {
                  const isSelected = selectedTask?.id === task.id;
                  return (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => {
                        setSelectedTaskId(task.id);
                        setActionError(null);
                      }}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        isSelected
                          ? "border-emerald-400/45 bg-emerald-500/[0.07]"
                          : "border-white/8 bg-[#101217] hover:border-white/15"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[11px] text-zinc-500">
                          {task.id} ·{" "}
                          {task.mode === "deep" ? "정밀 5단계" : "빠른 협업"}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            task.status === "완료"
                              ? "bg-emerald-500/15 text-emerald-300"
                              : task.status === "승인 대기"
                                ? "bg-amber-500/15 text-amber-300"
                                : task.status === "오류"
                                  ? "bg-red-500/15 text-red-300"
                                  : "bg-sky-500/15 text-sky-300"
                          }`}
                        >
                          {task.status === "완료" ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : task.status === "오류" ? (
                            <AlertTriangle className="h-3 w-3" />
                          ) : (
                            <Clock className="h-3 w-3" />
                          )}
                          {task.status}
                        </span>
                      </div>

                      <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-white">
                        {task.title}
                      </h3>

                      <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-500">
                        <span className="font-mono">{task.model}</span>
                        <span>{formatTime(task.updatedAt)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Selected Task Detail & Human-in-the-Loop */}
          <div className="rounded-2xl border border-white/10 bg-[#101217] p-6">
            {!selectedTask ? (
              <div className="flex h-64 flex-col items-center justify-center text-center text-xs text-zinc-500">
                <FileText className="h-8 w-8 text-zinc-700" />
                <p className="mt-3">좌측에서 업무를 선택하면 상세 보고서가 표시됩니다.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Task Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/8 pb-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-emerald-400">
                        {selectedTask.id}
                      </span>
                      <span className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
                        {selectedTask.model}
                      </span>
                      <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-zinc-400">
                        {selectedTask.mode === "deep"
                          ? "정밀 5단계 협업"
                          : "빠른 협업"}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-white">
                      {selectedTask.title}
                    </h2>
                    <p className="text-xs leading-relaxed text-zinc-400">
                      <span className="text-zinc-500">대표 지시: </span>
                      {selectedTask.directive}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedTask.finalReport && (
                      <button
                        type="button"
                        onClick={() => handleCopyReport(selectedTask)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 transition hover:bg-white/10"
                      >
                        {copiedId === selectedTask.id ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-emerald-300">복사됨</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>보고서 복사</span>
                          </>
                        )}
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={busyTaskId === selectedTask.id}
                      onClick={() => handleDelete(selectedTask.id)}
                      className="inline-flex items-center justify-center rounded-lg border border-white/10 p-1.5 text-zinc-500 transition hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-300"
                      title="업무 삭제"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Error Banner + Retry */}
                {selectedTask.errorMessage && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-400/25 bg-red-500/10 p-4 text-xs text-red-200">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
                      <p>{selectedTask.errorMessage}</p>
                    </div>
                    {isAuthenticated && (
                      <button
                        type="button"
                        disabled={busyTaskId === selectedTask.id}
                        onClick={() => handleRetry(selectedTask.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/20 px-3 py-1.5 font-medium text-red-100 transition hover:bg-red-500/30"
                      >
                        <RefreshCw
                          className={`h-3.5 w-3.5 ${busyTaskId === selectedTask.id ? "animate-spin" : ""}`}
                        />
                        <span>다시 실행</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Tabs: Final Report vs Agent Logs */}
                <div className="flex items-center gap-2 border-b border-white/8 pb-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab("report")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      activeTab === "report"
                        ? "bg-white/12 text-white"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    총괄 PM 최종 보고서
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("logs")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      activeTab === "logs"
                        ? "bg-white/12 text-white"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    AI 에이전트 협업 로그 ({selectedTask.logs.length})
                  </button>
                </div>

                {/* Content Area */}
                {activeTab === "report" ? (
                  <div className="rounded-xl border border-white/8 bg-black/30 p-5">
                    {selectedTask.finalReport ? (
                      <div className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
                        {selectedTask.finalReport}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500">
                        아직 최종 보고서가 생성되지 않았습니다. 협업 로그 탭에서
                        중간 진행 내용을 확인해 주세요.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedTask.logs.map((log) => (
                      <div
                        key={log.id}
                        className="rounded-xl border border-white/8 bg-black/30 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                                roleBadgeStyles[log.agentRole] ??
                                "border-white/15 bg-white/5 text-zinc-300"
                              }`}
                            >
                              <Bot className="h-3 w-3" />
                              {log.agentRole}
                            </span>
                            <span className="text-xs font-medium text-zinc-200">
                              {log.stepTitle}
                            </span>
                          </div>
                          <span className="text-[11px] text-zinc-500">
                            {formatTime(log.createdAt)}
                          </span>
                        </div>
                        <div className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-zinc-300">
                          {log.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Human-in-the-Loop Approval / Revision Controls */}
                <div className="space-y-3 border-t border-white/8 pt-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <UserCheck className="h-4 w-4 text-emerald-400" />
                      <span>대표자 검수 (Human-in-the-Loop)</span>
                    </div>

                    {selectedTask.status !== "완료" && (
                      <button
                        type="button"
                        disabled={busyTaskId === selectedTask.id}
                        onClick={() => handleApprove(selectedTask.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:opacity-60"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>대표 최종 승인</span>
                      </button>
                    )}
                  </div>

                  <form
                    onSubmit={(e) => handleRevise(e, selectedTask.id)}
                    className="flex flex-col gap-2 sm:flex-row"
                  >
                    <input
                      type="text"
                      value={revisionText}
                      onChange={(e) => setRevisionText(e.target.value)}
                      disabled={busyTaskId === selectedTask.id}
                      placeholder="보완할 점이 있다면 수정 지시를 입력하세요 (예: 월 구독 가격을 3,900원으로 낮춰서 수익성 다시 계산해 줘)"
                      className="flex-1 rounded-xl border border-white/12 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:border-emerald-400/60 focus:outline-none disabled:opacity-60"
                    />
                    <button
                      type="submit"
                      disabled={
                        busyTaskId === selectedTask.id || !revisionText.trim()
                      }
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/8 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {busyTaskId === selectedTask.id ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>반영 중...</span>
                        </>
                      ) : (
                        <>
                          <MessageSquarePlus className="h-3.5 w-3.5" />
                          <span>수정 지시</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
