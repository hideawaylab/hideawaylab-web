"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Award,
  BellRing,
  Bot,
  Calculator,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  FileText,
  FolderKanban,
  Globe,
  Layers,
  Loader2,
  LogOut,
  MessageSquarePlus,
  MessagesSquare,
  Paperclip,
  Printer,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserCheck,
  X,
  Zap,
} from "lucide-react";
import { BrandMark } from "@/components/Navbar";
import { logoutAction } from "@/app/workspace/actions";
import { MarkdownRenderer } from "./MarkdownRenderer";
import type {
  AgentRoleName,
  LeaderModelId,
  TaskCategory,
  TaskMode,
  TaskStatus,
  WorkerModelId,
  WorkspaceTaskRecord,
} from "@/lib/db";

const CATEGORIES: readonly TaskCategory[] = [
  "앱 · 서비스 개발",
  "신규 수익화 · 사업",
  "마케팅 · 콘텐츠",
  "재무 · 운영",
  "기타",
] as const;

const MAX_CLIENT_FILE_BYTES = 5 * 1024 * 1024;

const previewTasks: WorkspaceTaskRecord[] = [
  {
    id: "DEMO-001",
    title: "1인 사업자용 영수증 정리 웹앱 MVP 기획 및 비용 검증",
    category: "앱 · 서비스 개발",
    directive:
      "1인 사업자용 영수증 정리 앱 기획서 작성하고 초기·월 운영 비용과 손익분기점까지 정확히 분석해 줘",
    mode: "fast",
    model: "gemini-4-hydrogen / gemini-3.5-flash-lite",
    leaderModel: "gemini-4-hydrogen",
    workerModel: "gemini-3.5-flash-lite",
    maxReviewRounds: 2,
    reviewRounds: 2,
    reviewScore: 91,
    reviewVerdict: "PASS",
    referenceUrls: [],
    attachmentName: null,
    attachmentMime: null,
    status: "승인 대기",
    finalReport:
      "## 핵심 결론 (리뷰어 91점 통과)\n1인 사업자가 영수증 사진을 올리면 Gemini 멀티모달로 항목·부가세를 자동 분류하고 엑셀로 내보내는 초경량 웹앱을 **2주 MVP**로 출시합니다.\n\n## 핵심 재무 요약\n| 구분 | 예상 금액 | 비고 |\n| :--- | :--- | :--- |\n| 초기 구축비 | **0 ~ 12,650원** | 오라클 무료 서버 + 서브도메인 활용 시 0원 |\n| 월 운영비 (200명 이하) | **0원** | Gemini Free Tier 내 운영 |\n| 손익분기점 (BEP) | **유료 12명** | 월 4,900원 구독 기준 |\n\n## 당장 실행할 다음 액션 3가지\n1. 사진 업로드 → 자동 분류 → CSV 다운로드 3개 핵심 기능만 구현\n2. 세무 신고 시즌 키워드 중심 랜딩 페이지 공개\n3. 1인 사업자 15명 무료 베타 테스트 후 결제 전환율 검증",
    financeSummary:
      "### 1. 초기 및 월 운영 비용 추정\n| 항목 | 초기 비용 | 월 운영비 (초기) | 유료 확장 시 (1,000명) |\n| :--- | :--- | :--- | :--- |\n| 오라클 서버 (ARM) | 0원 | 0원 | 0원 (Always Free) |\n| Gemini API | 0원 | 0원 (무료 티어) | 약 25,000원 |\n| 결제 수수료 (PG 3.3%) | 0원 | 매출 비례 | 매출의 3.3% |\n\n### 2. 수익 시나리오 (월 4,900원 구독 가정)\n- **보수적 (유료 30명)**: 월 순이익 약 11만 원\n- **기본 (유료 120명)**: 월 순이익 약 51만 원\n- **낙관적 (유료 400명)**: 월 순이익 약 178만 원",
    meetingAgenda: null,
    ceoFeedback: null,
    errorMessage: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    logs: [
      {
        id: 1,
        taskId: "DEMO-001",
        agentRole: "재무 분석가 AI",
        stepTitle: "정밀 비용 및 손익 분석 (gemini-3.5-flash-lite)",
        content:
          "오라클 무료 서버와 Gemini Flash-Lite 기준 월 200명까지 **0원 운영** 가능하며, 유료 12명부터 손익분기점을 넘깁니다.",
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        taskId: "DEMO-001",
        agentRole: "품질 리뷰어 AI",
        stepTitle: "검수 라운드 1 · 리젝 (76점) (gemini-4-hydrogen)",
        content:
          "**판정**: ❌ 리젝 (REJECT) · **76 / 100점**\n\n초기 MVP에 네이티브 모바일 앱까지 포함되어 있어 1인 개발 일정과 스토어 비용이 과다합니다. 모바일 웹(PWA) 우선 전략으로 재토론하세요.",
        createdAt: new Date().toISOString(),
      },
      {
        id: 3,
        taskId: "DEMO-001",
        agentRole: "AI 팀 토론",
        stepTitle: "재토론 라운드 1 · 실무 4인 재토론 (gemini-3.5-flash-lite)",
        content:
          "개발 AI와 재무 분석가 AI가 협의하여 네이티브 앱 대신 **모바일 웹(PWA)**으로 전환하기로 합의했고, 초기 비용을 15만 원에서 0~1.2만 원으로 절감했습니다.",
        createdAt: new Date().toISOString(),
      },
      {
        id: 4,
        taskId: "DEMO-001",
        agentRole: "품질 리뷰어 AI",
        stepTitle: "검수 라운드 2 · 통과 (91점) (gemini-4-hydrogen)",
        content:
          "**판정**: ✅ 통과 (PASS) · **91 / 100점**\n\n비용 절감과 2주 MVP 실행력이 모두 충족되었습니다. 대표님 최종 승인을 추천합니다.",
        createdAt: new Date().toISOString(),
      },
    ],
  },
];

const roleBadgeStyles: Record<AgentRoleName, string> = {
  "총괄 PM AI": "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
  "품질 리뷰어 AI": "border-rose-400/30 bg-rose-500/10 text-rose-300",
  "재무 분석가 AI": "border-cyan-400/30 bg-cyan-500/10 text-cyan-300",
  "기획 · 리서치 AI": "border-sky-400/30 bg-sky-500/10 text-sky-300",
  "개발 AI": "border-amber-400/30 bg-amber-500/10 text-amber-300",
  "마케팅 · 카피 AI": "border-violet-400/30 bg-violet-500/10 text-violet-300",
  "AI 팀 토론": "border-orange-400/30 bg-orange-500/10 text-orange-200",
  "실무 도구": "border-teal-400/30 bg-teal-500/10 text-teal-200",
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
  const [activeTab, setActiveTab] = useState<"report" | "finance" | "logs">(
    "report"
  );

  // Command Bar inputs
  const [directive, setDirective] = useState("");
  const [category, setCategory] = useState<TaskCategory>("앱 · 서비스 개발");
  const [collabMode, setCollabMode] = useState<TaskMode>("fast");
  const [leaderModel, setLeaderModel] =
    useState<LeaderModelId>("gemini-4-hydrogen");
  const [workerModel, setWorkerModel] = useState<WorkerModelId>(
    "gemini-3.5-flash-lite"
  );
  const [maxReviewRounds, setMaxReviewRounds] = useState<number>(2);
  const [referenceUrlsInput, setReferenceUrlsInput] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [showToolsRow, setShowToolsRow] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Task list filter
  const [filterCategory, setFilterCategory] = useState<"전체" | TaskCategory>(
    "전체"
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Async states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [revisionText, setRevisionText] = useState("");
  const [meetingGuidance, setMeetingGuidance] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredTasks = tasks.filter((task) => {
    const matchesCategory =
      filterCategory === "전체" || task.category === filterCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      task.title.toLowerCase().includes(q) ||
      task.directive.toLowerCase().includes(q) ||
      task.id.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  const selectedTask =
    tasks.find((t) => t.id === selectedTaskId) ??
    filteredTasks[0] ??
    tasks[0] ??
    null;

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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    if (file.size > MAX_CLIENT_FILE_BYTES) {
      setActionError("첨부 파일은 최대 5MB까지만 업로드할 수 있습니다.");
      e.target.value = "";
      return;
    }
    setActionError(null);
    setAttachedFile(file);
    setShowToolsRow(true);
  }

  function clearAttachedFile() {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleAddDirective(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = directive.trim();
    if (!trimmed) return;
    setActionError(null);

    const parsedUrls = referenceUrlsInput
      .split(/[\n,\s]+/)
      .map((u) => u.trim())
      .filter((u) => u.startsWith("http://") || u.startsWith("https://"))
      .slice(0, 2);

    if (!isAuthenticated) {
      const now = new Date().toISOString();
      const demoTask: WorkspaceTaskRecord = {
        id: `DEMO-00${tasks.length + 1}`,
        title: trimmed.length > 36 ? `${trimmed.slice(0, 36)}…` : trimmed,
        category,
        directive: trimmed,
        mode: collabMode,
        model: `${leaderModel} / ${workerModel}`,
        leaderModel,
        workerModel,
        maxReviewRounds,
        reviewRounds: 1,
        reviewScore: 88,
        reviewVerdict: "PASS",
        referenceUrls: parsedUrls,
        attachmentName: attachedFile?.name ?? null,
        attachmentMime: attachedFile?.type ?? null,
        status: "승인 대기",
        finalReport:
          "## 미리보기 안내\n미리보기 모드에서는 실제 Gemini API와 실무 도구를 호출하지 않습니다.\n대표자 계정으로 로그인하시면 첨부 파일(이미지·PDF·CSV)과 참고 URL까지 6인 AI 팀이 직접 분석해 보고서를 작성합니다.",
        financeSummary:
          "로그인 후 실제 실행 시 재무 분석가 AI가 초기 구축비, 월 운영비, 손익분기점(BEP)을 표로 정밀 계산합니다.",
        meetingAgenda: null,
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
      setReferenceUrlsInput("");
      clearAttachedFile();
      setActiveTab("report");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("directive", trimmed);
      formData.append("category", category);
      formData.append("mode", collabMode);
      formData.append("leaderModel", leaderModel);
      formData.append("workerModel", workerModel);
      formData.append("maxReviewRounds", String(maxReviewRounds));
      if (referenceUrlsInput.trim()) {
        formData.append("referenceUrls", referenceUrlsInput.trim());
      }
      if (attachedFile) {
        formData.append("attachment", attachedFile);
      }

      const res = await fetch("/api/workspace/tasks", {
        method: "POST",
        body: formData,
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
      setReferenceUrlsInput("");
      clearAttachedFile();
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
            ? {
                ...t,
                status: "완료",
                meetingAgenda: null,
                ceoFeedback: "대표자 승인 완료 (미리보기)",
              }
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

  async function handleGuidedDebate(e: React.FormEvent, taskId: string) {
    e.preventDefault();
    const trimmed = meetingGuidance.trim();
    if (!trimmed || !isAuthenticated) return;
    setActionError(null);
    setBusyTaskId(taskId);

    try {
      const res = await fetch(`/api/workspace/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "debate", feedback: trimmed }),
      });
      const data = (await res.json()) as {
        task?: WorkspaceTaskRecord;
        error?: string;
      };
      if (!res.ok || !data.task) {
        setActionError(data.error ?? "추가 토론 실행에 실패했습니다.");
        return;
      }
      upsertTask(data.task);
      setMeetingGuidance("");
      setActiveTab("logs");
    } catch {
      setActionError("추가 토론 요청 중 네트워크 오류가 발생했습니다.");
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
    const contentToCopy =
      activeTab === "finance" && task.financeSummary
        ? task.financeSummary
        : task.finalReport;
    if (!contentToCopy) return;
    try {
      await navigator.clipboard.writeText(contentToCopy);
      setCopiedId(task.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setActionError("클립보드 복사에 실패했습니다.");
    }
  }

  function handleDownloadMarkdown(task: WorkspaceTaskRecord) {
    const sections: string[] = [
      `# ${task.title}`,
      "",
      `- **업무 ID**: ${task.id}`,
      `- **카테고리**: ${task.category}`,
      `- **상태**: ${task.status}`,
      `- **품질 리뷰어 점수**: ${task.reviewScore !== null ? `${task.reviewScore} / 100점 (${task.reviewRounds}라운드)` : "미측정"}`,
      `- **사용 모델**: 리더 \`${task.leaderModel}\` / 실무 \`${task.workerModel}\``,
      `- **작성 일시**: ${task.createdAt}`,
      "",
      "## 대표자 원본 지시",
      task.directive,
    ];

    if (task.referenceUrls.length > 0) {
      sections.push(
        "",
        "## 참고 URL",
        ...task.referenceUrls.map((u) => `- ${u}`)
      );
    }

    if (task.attachmentName) {
      sections.push("", `## 첨부 파일\n- ${task.attachmentName}`);
    }

    if (task.finalReport) {
      sections.push("", "---", "", "# 총괄 PM 최종 보고서", "", task.finalReport);
    }

    if (task.financeSummary) {
      sections.push("", "---", "", "# 재무 분석가 AI 비용 · 손익 보고", "", task.financeSummary);
    }

    if (task.meetingAgenda) {
      sections.push("", "---", "", "# 품질 리뷰어 긴급 회의 안건서", "", task.meetingAgenda);
    }

    const blob = new Blob([sections.join("\n")], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${task.id}-hideaway-report.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
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
    "회의 소집": tasks.filter((t) => t.status === "회의 소집").length,
    "승인 대기": tasks.filter((t) => t.status === "승인 대기").length,
    완료: tasks.filter((t) => t.status === "완료").length,
    오류: tasks.filter((t) => t.status === "오류").length,
  };

  return (
    <div className="min-h-screen bg-[#090a0c] text-zinc-100">
      <header className="no-print sticky top-0 z-40 border-b border-white/8 bg-[#090a0c]/85 backdrop-blur-md">
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
                  ? `${ceoEmail ?? "CEO"} · 6인 AI 조직 + 파일·URL 실무 도구`
                  : "공개 UI 미리보기 (실제 6인 AI 협업은 대표자 로그인 후 가능)"}
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
          <div className="no-print flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-xs leading-relaxed text-amber-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            <div>
              <p className="font-semibold text-amber-100">
                GEMINI_API_KEY가 아직 서버에 설정되지 않았습니다
              </p>
              <p className="mt-1 text-amber-200/80">
                오라클 서버의 <code>~/hideawaylab-web/.env.local</code> 파일에{" "}
                <code>GEMINI_API_KEY=...</code>를 추가하고 재시작하면 실제 AI
                협업이 시작됩니다.
              </p>
            </div>
          </div>
        )}

        {/* CEO Command Bar */}
        <section className="no-print rounded-2xl border border-emerald-400/25 bg-gradient-to-br from-[#101616] to-[#0e1015] p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-300">
              <Sparkles className="h-4 w-4" />
              <span>CEO COMMAND BAR · 6-AGENT + REAL-WORLD TOOLS</span>
            </div>
            <span className="text-[11px] text-zinc-400">
              이미지·PDF·CSV 첨부 &amp; 참고 URL 실시간 분석 지원
            </span>
          </div>

          <h1 className="mt-2 text-xl font-bold text-white">
            오늘 6인 AI 팀에게 어떤 프로젝트를 지시할까요?
          </h1>

          <form onSubmit={handleAddDirective} className="mt-4 space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={directive}
                onChange={(e) => setDirective(e.target.value)}
                disabled={isSubmitting}
                placeholder="예: 첨부한 경쟁 서비스 화면을 분석해 더 나은 수익화 앱을 기획하고 정확한 월 운영비·BEP를 계산해 줘"
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
                    <span>협업·리뷰 중...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>지시 보내기</span>
                  </>
                )}
              </button>
            </div>

            {/* Category, Mode, Tiered Models, Tools Toggle */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <label className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-black/30 px-3 py-1.5 text-zinc-400">
                <FolderKanban className="h-3.5 w-3.5 text-emerald-400" />
                <select
                  value={category}
                  disabled={isSubmitting}
                  onChange={(e) => setCategory(e.target.value as TaskCategory)}
                  className="bg-transparent font-medium text-zinc-100 focus:outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-[#101217]">
                      {cat}
                    </option>
                  ))}
                </select>
              </label>

              <div className="inline-flex rounded-xl border border-white/10 bg-black/30 p-1">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setCollabMode("fast")}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-medium transition ${
                    collabMode === "fast"
                      ? "bg-emerald-500/20 text-emerald-200"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Zap className="h-3 w-3" />
                  <span>빠른 협업</span>
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setCollabMode("deep")}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-medium transition ${
                    collabMode === "deep"
                      ? "bg-emerald-500/20 text-emerald-200"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Layers className="h-3 w-3" />
                  <span>정밀 6인</span>
                </button>
              </div>

              <label className="inline-flex items-center gap-1.5 rounded-xl border border-rose-400/20 bg-rose-500/[0.06] px-2.5 py-1.5 text-zinc-300">
                <span className="text-rose-300">PM·리뷰어</span>
                <select
                  value={leaderModel}
                  disabled={isSubmitting}
                  onChange={(e) =>
                    setLeaderModel(e.target.value as LeaderModelId)
                  }
                  className="bg-transparent font-medium text-white focus:outline-none"
                >
                  <option value="gemini-4-hydrogen" className="bg-[#101217]">
                    Hydrogen (무료 지원)
                  </option>
                  <option value="gemini-4-argon" className="bg-[#101217]">
                    Argon (유료 전용)
                  </option>
                  <option value="gemini-4-neon" className="bg-[#101217]">
                    Neon (유료 전용)
                  </option>
                </select>
              </label>

              <label className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-black/30 px-2.5 py-1.5 text-zinc-400">
                <span>실무 4인</span>
                <select
                  value={workerModel}
                  disabled={isSubmitting}
                  onChange={(e) =>
                    setWorkerModel(e.target.value as WorkerModelId)
                  }
                  className="bg-transparent font-medium text-zinc-100 focus:outline-none"
                >
                  <option value="gemini-3.5-flash-lite" className="bg-[#101217]">
                    Flash-Lite (기본)
                  </option>
                  <option value="gemini-4-hydrogen" className="bg-[#101217]">
                    Hydrogen (상향)
                  </option>
                </select>
              </label>

              <label className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-black/30 px-2.5 py-1.5 text-zinc-400">
                <span>리뷰</span>
                <select
                  value={maxReviewRounds}
                  disabled={isSubmitting}
                  onChange={(e) => setMaxReviewRounds(Number(e.target.value))}
                  className="bg-transparent font-medium text-zinc-100 focus:outline-none"
                >
                  <option value={1} className="bg-[#101217]">
                    1회
                  </option>
                  <option value={2} className="bg-[#101217]">
                    2회 (추천)
                  </option>
                  <option value={3} className="bg-[#101217]">
                    3회
                  </option>
                </select>
              </label>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowToolsRow((v) => !v)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-medium transition ${
                  showToolsRow || attachedFile || referenceUrlsInput.trim()
                    ? "border-teal-400/40 bg-teal-500/15 text-teal-200"
                    : "border-white/12 bg-white/5 text-zinc-300 hover:bg-white/10"
                }`}
              >
                <Paperclip className="h-3.5 w-3.5" />
                <span>파일 · URL 첨부</span>
              </button>
            </div>

            {/* Phase 3 Real-World Tools Inputs (File Upload + Reference URLs) */}
            {(showToolsRow || attachedFile || referenceUrlsInput.trim()) && (
              <div className="grid gap-3 rounded-xl border border-teal-400/20 bg-black/35 p-3.5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[11px] font-medium text-teal-300">
                    <Paperclip className="h-3.5 w-3.5" />
                    <span>첨부 파일 분석 (이미지 · PDF · TXT/CSV/MD, 최대 5MB)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      disabled={isSubmitting}
                      accept="image/png,image/jpeg,image/webp,image/gif,application/pdf,.txt,.md,.csv,.json"
                      onChange={handleFileChange}
                      className="block w-full text-xs text-zinc-400 file:mr-2.5 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-zinc-100 hover:file:bg-white/15"
                    />
                    {attachedFile && (
                      <button
                        type="button"
                        onClick={clearAttachedFile}
                        className="rounded-lg border border-white/10 p-1.5 text-zinc-400 hover:text-white"
                        title="첨부 취소"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  {attachedFile && (
                    <p className="text-[11px] text-emerald-300">
                      선택됨: {attachedFile.name} (
                      {Math.max(1, Math.round(attachedFile.size / 1024))}KB)
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="refUrls"
                    className="flex items-center gap-1.5 text-[11px] font-medium text-teal-300"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    <span>참고 URL 실시간 분석 (최대 2개, 공백·쉼표 구분)</span>
                  </label>
                  <input
                    id="refUrls"
                    type="text"
                    disabled={isSubmitting}
                    value={referenceUrlsInput}
                    onChange={(e) => setReferenceUrlsInput(e.target.value)}
                    placeholder="https://example.com (경쟁사·참고 기사 링크)"
                    className="w-full rounded-lg border border-white/12 bg-black/50 px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:border-teal-400/60 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </form>

          {isSubmitting && (
            <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-200">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
              <span>
                첨부 자료 수집 → 6인 AI 팀 협업 및 재무 분석 → 품질 리뷰어 검수
                (필요 시 재토론)를 실행 중입니다. 잠시만 기다려 주세요...
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
        <section className="no-print grid grid-cols-2 gap-3 sm:grid-cols-5">
          {(["전체", "회의 소집", "승인 대기", "완료", "오류"] as const).map(
            (label) => {
              const isUrgentMeeting =
                label === "회의 소집" && statusCounts["회의 소집"] > 0;
              return (
                <div
                  key={label}
                  className={`rounded-2xl border p-4 ${
                    isUrgentMeeting
                      ? "border-rose-400/45 bg-rose-500/10"
                      : "border-white/8 bg-[#101217]"
                  }`}
                >
                  <p
                    className={`text-xs ${
                      isUrgentMeeting
                        ? "font-semibold text-rose-300"
                        : "text-zinc-500"
                    }`}
                  >
                    {isUrgentMeeting ? "🚨 회의 소집" : label}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {statusCounts[label]}
                  </p>
                </div>
              );
            }
          )}
        </section>

        {/* 2-Column Workspace Board & Detail Report */}
        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.45fr]">
          {/* Left: Task List with Category Filter & Search */}
          <div className="no-print space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">
                프로젝트 목록 ({filteredTasks.length}/{tasks.length})
              </h2>
              <span className="text-[11px] text-zinc-500">
                클릭하여 상세 보고서 확인
              </span>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="업무 제목 · 지시 내용 검색..."
                  className="w-full rounded-xl border border-white/10 bg-[#101217] py-2 pl-8 pr-3 text-xs text-white placeholder:text-zinc-500 focus:border-emerald-400/50 focus:outline-none"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(["전체", ...CATEGORIES] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFilterCategory(cat)}
                    className={`rounded-full border px-2.5 py-1 text-[11px] transition ${
                      filterCategory === cat
                        ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
                        : "border-white/8 bg-white/[0.02] text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {filteredTasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/12 bg-[#101217]/50 p-8 text-center text-xs text-zinc-400">
                <Bot className="mx-auto h-7 w-7 text-zinc-600" />
                <p className="mt-3 font-medium text-zinc-300">
                  조건에 맞는 업무가 없습니다
                </p>
                <p className="mt-1 text-zinc-500">
                  새 지시를 입력하거나 필터를 초기화해 보세요.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredTasks.map((task) => {
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
                          ? task.status === "회의 소집"
                            ? "border-rose-400/60 bg-rose-500/[0.09]"
                            : "border-emerald-400/45 bg-emerald-500/[0.07]"
                          : task.status === "회의 소집"
                            ? "border-rose-400/30 bg-[#141015] hover:border-rose-400/50"
                            : "border-white/8 bg-[#101217] hover:border-white/15"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] text-zinc-500">
                            {task.id}
                          </span>
                          <span className="rounded bg-white/6 px-1.5 py-0.5 text-[10px] text-zinc-400">
                            {task.category}
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            task.status === "완료"
                              ? "bg-emerald-500/15 text-emerald-300"
                              : task.status === "회의 소집"
                                ? "bg-rose-500/20 text-rose-200"
                                : task.status === "승인 대기"
                                  ? "bg-amber-500/15 text-amber-300"
                                  : task.status === "오류"
                                    ? "bg-red-500/15 text-red-300"
                                    : "bg-sky-500/15 text-sky-300"
                          }`}
                        >
                          {task.status === "완료" ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : task.status === "회의 소집" ? (
                            <BellRing className="h-3 w-3" />
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

                      <div className="mt-2.5 flex items-center justify-between gap-2 text-[11px] text-zinc-500">
                        <span className="flex items-center gap-2 truncate">
                          {task.reviewScore !== null && (
                            <span className="text-emerald-300/90">
                              {task.reviewScore}점
                            </span>
                          )}
                          {task.attachmentName && (
                            <span className="inline-flex items-center gap-0.5 text-teal-300">
                              <Paperclip className="h-3 w-3" />
                              파일
                            </span>
                          )}
                          {task.referenceUrls.length > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-teal-300">
                              <Globe className="h-3 w-3" />
                              URL {task.referenceUrls.length}
                            </span>
                          )}
                        </span>
                        <span className="shrink-0">
                          {formatTime(task.updatedAt)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Selected Task Detail & Human-in-the-Loop */}
          <div className="print-report rounded-2xl border border-white/10 bg-[#101217] p-6">
            {!selectedTask ? (
              <div className="flex h-64 flex-col items-center justify-center text-center text-xs text-zinc-500">
                <FileText className="h-8 w-8 text-zinc-700" />
                <p className="mt-3">
                  좌측에서 업무를 선택하면 마크다운 보고서와 재무 분석이
                  표시됩니다.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Task Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/8 pb-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-emerald-400">
                        {selectedTask.id}
                      </span>
                      <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-zinc-300">
                        {selectedTask.category}
                      </span>
                      {selectedTask.reviewScore !== null && (
                        <span
                          className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium ${
                            selectedTask.reviewScore >= 85
                              ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                              : "border-rose-400/30 bg-rose-500/10 text-rose-200"
                          }`}
                        >
                          <Award className="h-3 w-3" />
                          리뷰어 {selectedTask.reviewScore}점 (
                          {selectedTask.reviewRounds}라운드)
                        </span>
                      )}
                    </div>
                    <h2 className="break-keep text-lg font-bold text-white">
                      {selectedTask.title}
                    </h2>
                    <p className="text-xs leading-relaxed text-zinc-400">
                      <span className="text-zinc-500">대표 지시: </span>
                      {selectedTask.directive}
                    </p>

                    {(selectedTask.attachmentName ||
                      selectedTask.referenceUrls.length > 0) && (
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                        {selectedTask.attachmentName && (
                          <span className="inline-flex items-center gap-1 rounded-md border border-teal-400/25 bg-teal-500/10 px-2 py-0.5 text-teal-200">
                            <Paperclip className="h-3 w-3" />
                            {selectedTask.attachmentName}
                          </span>
                        )}
                        {selectedTask.referenceUrls.map((url) => (
                          <a
                            key={url}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-md border border-teal-400/25 bg-teal-500/10 px-2 py-0.5 text-teal-200 hover:bg-teal-500/20"
                          >
                            <Globe className="h-3 w-3" />
                            <span className="max-w-[180px] truncate">{url}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Export & Action Toolbar */}
                  <div className="no-print flex flex-wrap items-center gap-1.5">
                    {(selectedTask.finalReport ||
                      selectedTask.financeSummary) && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleCopyReport(selectedTask)}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/12 bg-white/5 px-2.5 py-1.5 text-xs text-zinc-300 transition hover:bg-white/10"
                          title="현재 탭 복사"
                        >
                          {copiedId === selectedTask.id ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                              <span className="text-emerald-300">복사됨</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>복사</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadMarkdown(selectedTask)}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/12 bg-white/5 px-2.5 py-1.5 text-xs text-zinc-300 transition hover:bg-white/10"
                          title="마크다운(.md) 통합 문서 저장"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>MD</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/12 bg-white/5 px-2.5 py-1.5 text-xs text-zinc-300 transition hover:bg-white/10"
                          title="PDF 저장 또는 인쇄"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          <span>PDF</span>
                        </button>
                      </>
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

                {/* Emergency Meeting Callout Panel */}
                {selectedTask.status === "회의 소집" &&
                  selectedTask.meetingAgenda && (
                    <div className="space-y-4 rounded-2xl border border-rose-400/45 bg-gradient-to-br from-rose-500/15 via-amber-500/[0.07] to-[#121015] p-5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-rose-200">
                          <BellRing className="h-4 w-4 text-rose-300" />
                          <span>
                            품질 리뷰어 긴급 회의 소집 · 대표님 결정 요청
                          </span>
                        </div>
                        <button
                          type="button"
                          disabled={busyTaskId === selectedTask.id}
                          onClick={() => handleApprove(selectedTask.id)}
                          className="no-print inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:opacity-60"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>이 수준으로 승인</span>
                        </button>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                        <MarkdownRenderer
                          content={selectedTask.meetingAgenda}
                          compact
                        />
                      </div>

                      {isAuthenticated && (
                        <form
                          onSubmit={(e) =>
                            handleGuidedDebate(e, selectedTask.id)
                          }
                          className="no-print flex flex-col gap-2 sm:flex-row"
                        >
                          <input
                            type="text"
                            value={meetingGuidance}
                            onChange={(e) => setMeetingGuidance(e.target.value)}
                            disabled={busyTaskId === selectedTask.id}
                            placeholder="대표님 회의 지침 입력 (예: 월 운영비 2만 원 이하 기준으로 기능 줄여서 1라운드 더 토론해 줘)"
                            className="flex-1 rounded-xl border border-rose-300/25 bg-black/50 px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-400 focus:border-rose-400/60 focus:outline-none"
                          />
                          <button
                            type="submit"
                            disabled={
                              busyTaskId === selectedTask.id ||
                              !meetingGuidance.trim()
                            }
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-500 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {busyTaskId === selectedTask.id ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                <span>추가 토론 중...</span>
                              </>
                            ) : (
                              <>
                                <MessagesSquare className="h-3.5 w-3.5" />
                                <span>추가 토론 지시</span>
                              </>
                            )}
                          </button>
                        </form>
                      )}
                    </div>
                  )}

                {/* Error Banner + Retry */}
                {selectedTask.errorMessage && (
                  <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-400/25 bg-red-500/10 p-4 text-xs text-red-200">
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

                {/* 3 Tabs */}
                <div className="no-print flex flex-wrap items-center gap-2 border-b border-white/8 pb-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab("report")}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      activeTab === "report"
                        ? "bg-white/12 text-white"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>총괄 PM 최종 보고서</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("finance")}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      activeTab === "finance"
                        ? "bg-cyan-500/20 text-cyan-200"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Calculator className="h-3.5 w-3.5" />
                    <span>재무 · 비용 분석</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("logs")}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      activeTab === "logs"
                        ? "bg-white/12 text-white"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <MessagesSquare className="h-3.5 w-3.5" />
                    <span>토론 · 리뷰 로그 ({selectedTask.logs.length})</span>
                  </button>
                </div>

                {/* Rendered Markdown Content Area */}
                {activeTab === "report" && (
                  <div className="rounded-xl border border-white/8 bg-black/30 p-5">
                    {selectedTask.finalReport ? (
                      <MarkdownRenderer content={selectedTask.finalReport} />
                    ) : (
                      <p className="text-xs text-zinc-500">
                        아직 최종 보고서가 생성되지 않았습니다. 토론·리뷰 로그
                        탭에서 진행 내역을 확인해 주세요.
                      </p>
                    )}
                  </div>
                )}

                {activeTab === "finance" && (
                  <div className="rounded-xl border border-cyan-400/20 bg-cyan-950/15 p-5">
                    <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-cyan-300">
                      <Calculator className="h-4 w-4" />
                      <span>재무 분석가 AI 정밀 비용 · 손익 보고</span>
                    </div>
                    {selectedTask.financeSummary ? (
                      <MarkdownRenderer content={selectedTask.financeSummary} />
                    ) : (
                      <p className="text-xs text-zinc-400">
                        이 업무에는 저장된 재무 분석 요약이 없습니다.
                      </p>
                    )}
                  </div>
                )}

                {activeTab === "logs" && (
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
                        <div className="mt-3">
                          <MarkdownRenderer content={log.content} compact />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Human-in-the-Loop Approval / Direct Revision Controls */}
                <div className="no-print space-y-3 border-t border-white/8 pt-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <UserCheck className="h-4 w-4 text-emerald-400" />
                      <span>대표자 최종 검수 (Human-in-the-Loop)</span>
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
                      placeholder="직접 수정 지시 입력 (예: 월 구독료를 3,900원으로 낮춰서 손익분기점 다시 계산해 줘)"
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
                          <span>직접 수정 지시</span>
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
