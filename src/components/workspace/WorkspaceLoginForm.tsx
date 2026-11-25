"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  KeyRound,
  Lock,
  ShieldAlert,
} from "lucide-react";
import { BrandMark } from "@/components/Navbar";
import { siteConfig } from "@/config/site";
import { loginAction, type LoginActionState } from "@/app/workspace/actions";
import { WorkspaceDashboard } from "./WorkspaceDashboard";

const initialLoginState: LoginActionState = { error: null };

interface WorkspaceLoginFormProps {
  isAuthConfigured: boolean;
  defaultEmail: string;
}

export function WorkspaceLoginForm({
  isAuthConfigured,
  defaultEmail,
}: WorkspaceLoginFormProps) {
  const [previewMode, setPreviewMode] = useState(false);
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialLoginState
  );

  if (previewMode) {
    return (
      <WorkspaceDashboard
        mode="preview"
        onExitPreview={() => setPreviewMode(false)}
      />
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

          <form action={formAction} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-medium text-zinc-300"
              >
                관리자 이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="username"
                defaultValue={defaultEmail}
                className="w-full rounded-xl border border-white/12 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-400/60 focus:outline-none"
                placeholder={defaultEmail}
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
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-white/12 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-400/60 focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <KeyRound className="h-4 w-4" />
              <span>{isPending ? "로그인 확인 중..." : "워크스페이스 로그인"}</span>
            </button>
          </form>

          {state.error && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-400/25 bg-red-500/10 p-3.5 text-xs leading-relaxed text-red-200">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
              <p>{state.error}</p>
            </div>
          )}

          {!isAuthConfigured && !state.error && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-400/25 bg-amber-500/10 p-3.5 text-xs leading-relaxed text-amber-200">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
              <p>
                서버에 로그인 환경 변수(<code>.env.local</code>)가 아직 설정되지
                않았습니다. 설정 후 바로 로그인할 수 있습니다.
              </p>
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
              로그인 전에도 UI를 체험해 볼 수 있는 공개 미리보기 모드입니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
