import Link from "next/link";
import { Lock } from "lucide-react";
import { siteConfig } from "@/config/site";

export function BrandMark() {
  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-500/10 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M4 5.5V18.5M20 5.5V18.5M4 12H13.5M13.5 12L17.5 8M13.5 12L17.5 16"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[#090a0c]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="group flex items-center gap-2.5 text-sm font-semibold tracking-tight text-white"
        >
          <BrandMark />
          <div className="flex flex-col leading-none">
            <span className="text-[15px] font-semibold tracking-tight text-white">
              {siteConfig.brand.nameEn}
            </span>
            <span className="mt-0.5 text-[11px] font-normal text-zinc-400">
              {siteConfig.brand.nameKo}
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-zinc-400 md:flex">
          <Link href="/#about" className="transition-colors hover:text-white">
            스튜디오 소개
          </Link>
          <Link href="/#projects" className="transition-colors hover:text-white">
            프로젝트
          </Link>
          <Link href="/#agents" className="transition-colors hover:text-white">
            AI 협업 조직
          </Link>
          <Link href="/#roadmap" className="transition-colors hover:text-white">
            로드맵
          </Link>
          <Link href="/#contact" className="transition-colors hover:text-white">
            문의
          </Link>
        </nav>

        <Link
          href="/workspace"
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-zinc-100 transition hover:border-emerald-400/50 hover:bg-emerald-500/10 hover:text-emerald-200"
        >
          <Lock className="h-3.5 w-3.5 text-emerald-400" />
          <span>CEO 워크스페이스</span>
        </Link>
      </div>
    </header>
  );
}
