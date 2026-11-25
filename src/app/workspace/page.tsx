"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  Clock,
  Eye,
  KeyRound,
  Lock,
  Send,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { BrandMark } from "@/components/Navbar";
import { siteConfig } from "@/config/site";

type TaskStatus = "대기" | "진행 중" | "승인 대기" | "완료";

interface DemoTask {
  id: string;
  title: string;
  agent: string;
  status: TaskStatus;
  summary: string;
}

const initialTasks: DemoTask[] = [
  {
    id: "TASK-01",
    title: "hideawaylab.kr 공식 랜딩 페이지 제작 및 배포",
    agent: "개발 AI",
    status: "완료",
    summary: "Next.js + Tailwind CSS 기반 공식 홈페이지 및 사업자 정보 구성 완료",
  },
  {
    id: "TASK-02",
    title: "Supabase Auth 대표자 전용 로그인 연동 설계",
    agent: "개발 AI",
    status: "승인 대기",
    summary: "대표자 이메일 화이트리스트 기반 인증 플로우 초안 작성 완료 — 승인 대기 중",
  },
  {
    id: "TASK-03",
    title: "첫 번째 자체 수익화 앱 시장 리서치 및 PRD 초안",
    agent: "기획 · 리서치 AI",
    status: "진행 중",
    summary: "1인 사업자·생산성 분야 상위 5개 니즈 분석 진행 중",
  },
  {
    id: "TASK-04",
    title: "브랜드 소개 카피 및 검색엔진(SEO) 메타데이터 최적화",
    agent: "마케팅 · 카피 AI",
    status: "대기",
    summary: "공식 도메인 오픈 직후 네이버·구글 서치콘솔 등록 준비",
  },
];

export default function WorkspacePage() {
  const [email, setEmail] = useState(siteConfig.business.email);
  const [password, setPassword] = useState("");
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [directive, setDirective] = useState("");
  const [tasks, setTasks] = useState<DemoTask[]>(initialTasks);

  function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAuthNotice(
      "Supabase Auth가 아직 연결되지 않았습니다. Phase 1 다음 단계에서 Supabase 프로젝트를 연결하면 실제 대표자 전용 로그인이 활성화됩니다. 아래 '대시보드 미리보기'로 화면을 먼저 확인해 보세요."
    );
  }

  function handleAddDirective(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = directive.trim();
    if (!trimmed) return;

    const newTask: DemoTask = {
      id: `TASK-0${tasks.length + 1}`,
      title: trimmed,
      agent: "총괄 PM AI",
      status: "진행 중",
      summary: "대표자 지시 접수됨 — 담당 AI 에이전트 배정 및 작업 계획 수립 중 (미리보기)",
    };

    setTasks([newTask, ...tasks]);
    setDirective("");
  }

  function handleApprove(id: string) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, status: "완료", summary: "대표자 최종 승인 완료" }
          : task
      )
    );
  }

  if (previewMode) {
    return (
      <div className="min-h-screen bg-[#090a0c] text-zinc-100">
        <header className="sticky top-0 z-40 border-b border-white/8 bg-[#090a0c]/85 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <BrandMark />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">
                    Hideaway AI Workspace
                  </span>
                  <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                    PREVIEW MODE
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Phase 2 AI 1인 기업 협업 대시보드 미리보기
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewMode(false)}
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 transition hover:bg-white/10"
              >
                로그인 화면으로
              </button>
              <Link
                href="/"
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-400 transition hover:text-white"
              >
                홈으로
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
          {/* CEO Command Bar */}
          <section className="rounded-2xl border border-emerald-400/25 bg-gradient-to-br from-[#101616] to-[#0e1015] p-6">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-300">
              <Sparkles className="h-4 w-4" />
              <span>CEO COMMAND BAR</span>
            </div>
            <h1 className="mt-2 text-xl font-bold text-white">
              오늘 AI 팀에게 어떤 업무를 지시할까요?
            </h1>
            <form
              onSubmit={handleAddDirective}
              className="mt-4 flex flex-col gap-3 sm:flex-row"
            >
              <input
                type="text"
                value={directive}
                onChange={(e) => setDirective(e.target.value)}
                placeholder="예: 1인 사업자용 영수증 정리 앱 기획서 작성하고 경쟁 서비스 3곳 조사해 줘"
                className="flex-1 rounded-xl border border-white/12 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-400/60 focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400"
              >
                <Send className="h-4 w-4" />
                <span>지시 보내기</span>
              </button>
            </form>
          </section>

          {/* Status Summary */}
          <section className="grid gap-4 sm:grid-cols-4">
            {(["대기", "진행 중", "승인 대기", "완료"] as TaskStatus[]).map(
              (status) => {
                const count = tasks.filter((t) => t.status === status).length;
                return (
                  <div
                    key={status}
                    className="rounded-2xl border border-white/8 bg-[#101217] p-4"
                  >
                    <p className="text-xs text-zinc-500">{status}</p>
                    <p className="mt-1 text-2xl font-bold text-white">{count}</p>
                  </div>
                );
              }
            )}
          </section>

          {/* Task Board */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">
                AI 협업 업무 보드
              </h2>
              <span className="text-xs text-zinc-500">
                실제 Gemini API 연동은 Phase 2에서 활성화됩니다
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col justify-between rounded-2xl border border-white/8 bg-[#101217] p-5"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-zinc-500">
                        {task.id}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                          task.status === "완료"
                            ? "bg-emerald-500/15 text-emerald-300"
                            : task.status === "승인 대기"
                              ? "bg-amber-500/15 text-amber-300"
                              : task.status === "진행 중"
                                ? "bg-sky-500/15 text-sky-300"
                                : "bg-white/8 text-zinc-400"
                        }`}
                      >
                        {task.status === "완료" ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        {task.status}
                      </span>
                    </div>

                    <h3 className="mt-3 text-sm font-semibold text-white">
                      {task.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
                      {task.summary}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-3">
                    <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400">
                      <Bot className="h-3.5 w-3.5 text-emerald-400" />
                      {task.agent}
                    </span>

                    {task.status === "승인 대기" && (
                      <button
                        type="button"
                        onClick={() => handleApprove(task.id)}
                        className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-semibold text-zinc-950 transition hover:bg-emerald-400"
                      >
                        대표 승인
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#090a0c] px-6 py-12 text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-studio-grid opacity-50" />
      <div className="pointer-events-none fixed inset-0 radial-glow" />

      <div className="relative z-10 w-full max-w-md">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-xs text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>하이드어웨이 랩 홈으로 돌아가기</span>
        </Link>

        <div className="rounded-3xl border border-white/10 bg-[#101217]/95 p-7 shadow-2xl shadow-black/70 backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <BrandMark />
              <div>
                <p className="text-sm font-semibold text-white">
                  {siteConfig.brand.nameEn}
                </p>
                <p className="text-[11px] text-zinc-400">CEO Private Workspace</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-300">
              <Lock className="h-3 w-3" />
              CEO ONLY
            </span>
          </div>

          <div className="mt-6">
            <h1 className="text-xl font-bold text-white">대표자 전용 로그인</h1>
            <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
              허가된 관리자 계정으로 로그인하여 AI 1인 기업 협업 워크스페이스에
              접속합니다.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-medium text-zinc-300"
              >
                관리자 이메일
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/12 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-400/60 focus:outline-none"
                placeholder="ceo@hideawaylab.kr"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-medium text-zinc-300"
              >
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/12 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-400/60 focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
            >
              <KeyRound className="h-4 w-4" />
              <span>워크스페이스 로그인</span>
            </button>
          </form>

          {authNotice && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-400/25 bg-amber-500/10 p-3.5 text-xs leading-relaxed text-amber-200">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
              <p>{authNotice}</p>
            </div>
          )}

          <div className="mt-6 border-t border-white/8 pt-5">
            <button
              type="button"
              onClick={() => setPreviewMode(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 py-2.5 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/20"
            >
              <Eye className="h-4 w-4" />
              <span>Phase 2 AI 협업 대시보드 미리보기</span>
            </button>
            <p className="mt-2.5 text-center text-[11px] text-zinc-500">
              Supabase Auth 연동 전 UI 확인용 데모 모드입니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
