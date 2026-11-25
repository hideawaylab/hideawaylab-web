import Link from "next/link";
import { siteConfig } from "@/config/site";
import { BrandMark } from "./Navbar";

export function Footer() {
  const { business, brand } = siteConfig;

  return (
    <footer className="border-t border-white/8 bg-[#07080a]">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <BrandMark />
              <div>
                <p className="text-sm font-semibold text-white">{brand.nameEn}</p>
                <p className="text-xs text-zinc-400">{brand.nameKo}</p>
              </div>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-zinc-400">
              {brand.tagline}
              <br />
              독립적인 의사결정과 AI 에이전트 협업을 결합해 작고 단단한 디지털 제품을 만듭니다.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-zinc-500">
              <Link href="/#about" className="hover:text-zinc-300">
                스튜디오 소개
              </Link>
              <Link href="/#projects" className="hover:text-zinc-300">
                프로젝트
              </Link>
              <Link href="/workspace" className="hover:text-zinc-300">
                대표자 로그인
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 text-xs text-zinc-400">
            <p className="mb-3 font-medium text-zinc-200">사업자 정보</p>
            <dl className="space-y-2">
              <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
                <dt className="text-zinc-500">상호명</dt>
                <dd className="text-right text-zinc-300">{business.companyName}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
                <dt className="text-zinc-500">대표자</dt>
                <dd className="text-right text-zinc-300">{business.ceoName}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
                <dt className="text-zinc-500">사업자등록번호</dt>
                <dd className="text-right font-mono text-zinc-300">
                  {business.registrationNumber}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
                <dt className="text-zinc-500">이메일</dt>
                <dd className="text-right">
                  <a
                    href={`mailto:${business.email}`}
                    className="text-emerald-400/90 hover:text-emerald-300"
                  >
                    {business.email}
                  </a>
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">소재지</dt>
                <dd className="text-right text-zinc-300">{business.address}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/6 pt-6 text-xs text-zinc-500 sm:flex-row sm:items-center">
          <p>
            © {business.foundedYear} {brand.nameEn}. All rights reserved.
          </p>
          <p className="font-mono text-[11px] text-zinc-600">{brand.domain}</p>
        </div>
      </div>
    </footer>
  );
}
