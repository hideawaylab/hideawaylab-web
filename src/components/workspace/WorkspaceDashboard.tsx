"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bot,
  CheckCircle2,
  Clock,
  LogOut,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { BrandMark } from "@/components/Navbar";
import { logoutAction } from "@/app/workspace/actions";

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
    title: "대표자 전용 워크스페이스 자체 로그인 인증 구축",
    agent: "개발 AI",
    status: "승인 대기",
    summary: "오라클 서버 환경변수 + HttpOnly 세션 쿠키 인증 적용 — 최종 확인 대기 중",
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

interface WorkspaceDashboardProps {
  mode: "authenticated" | "preview";
  ceoEmail?: string;
  onExitPreview?: () => void;
}

export function WorkspaceDashboard({
  mode,
  ceoEmail,
  onExitPreview,
}: WorkspaceDashboardProps) {
  const [directive, setDirective] = useState("");
  const [tasks, setTasks] = useState<DemoTask[]>(initialTasks);
  const isAuthenticated = mode === "authenticated";

  function handleAddDirective(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = directive.trim();
    if (!trimmed) return;

    const newTask: DemoTask = {
      id: `TASK-0${tasks.length + 1}`,
      title: trimmed,
      agent: "총괄 PM AI",
      status: "진행 중",
      summary: isAuthenticated
        ? "대표자 지시 접수됨 — Phase 2 Gemini API 연동 후 자동 실행 예정"
        : "대표자 지시 접수됨 — 담당 AI 에이전트 배정 및 작업 계획 수립 중 (미리보기)",
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
                  ? `${ceoEmail ?? "CEO"} 계정으로 로그인됨`
                  : "Phase 2 AI 1인 기업 협업 대시보드 미리보기"}
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
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-white">
              AI 협업 업무 보드
            </h2>
            <span className="text-xs text-zinc-500">
              실제 Gemini API 연동 및 DB 영구 저장은 Phase 2에서 활성화됩니다
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
