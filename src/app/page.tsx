import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  Cpu,
  Layers,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CopyEmailButton } from "@/components/CopyEmailButton";
import { siteConfig } from "@/config/site";

const accentStyles = {
  emerald: {
    badge: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
    dot: "bg-emerald-400",
  },
  rose: {
    badge: "border-rose-400/30 bg-rose-500/10 text-rose-300",
    dot: "bg-rose-400",
  },
  cyan: {
    badge: "border-cyan-400/30 bg-cyan-500/10 text-cyan-300",
    dot: "bg-cyan-400",
  },
  sky: {
    badge: "border-sky-400/30 bg-sky-500/10 text-sky-300",
    dot: "bg-sky-400",
  },
  amber: {
    badge: "border-amber-400/30 bg-amber-500/10 text-amber-300",
    dot: "bg-amber-400",
  },
  violet: {
    badge: "border-violet-400/30 bg-violet-500/10 text-violet-300",
    dot: "bg-violet-400",
  },
};

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-[#090a0c] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-studio-grid opacity-60" />
      <div className="pointer-events-none fixed inset-0 radial-glow" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="mx-auto max-w-6xl px-6 pb-20 pt-20 md:pb-28 md:pt-28">
            <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-7">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-medium text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>AI-NATIVE VENTURE STUDIO · HIDEAWAYLAB.KR</span>
                </div>

                <h1 className="break-keep text-4xl font-bold leading-[1.18] tracking-tight text-white sm:text-5xl lg:text-[52px]">
                  아이디어에서 수익까지,
                  <br />
                  <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-sky-300 bg-clip-text text-transparent">
                    AI와 함께 기획하고 실행하는 비즈니스 랩
                  </span>
                </h1>

                <p className="max-w-xl break-keep text-base leading-relaxed text-zinc-400 sm:text-lg">
                  하이드어웨이 랩(Hideaway Lab)은 앱·소프트웨어 개발을 주력으로,
                  다양한 수익화 프로젝트와 디지털 비즈니스를 대표자와 6인의 전문
                  AI 조직이 함께 기획·검증·실행하는 독립 AI 비즈니스 랩입니다.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Link
                    href="#projects"
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
                  >
                    <span>프로젝트 살펴보기</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/workspace"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-medium text-zinc-100 transition hover:border-emerald-400/50 hover:bg-emerald-500/10"
                  >
                    <Lock className="h-4 w-4 text-emerald-400" />
                    <span>대표자 워크스페이스</span>
                  </Link>
                </div>

                <div className="grid max-w-lg grid-cols-3 gap-4 border-t border-white/10 pt-6">
                  <div>
                    <p className="text-xl font-semibold text-white">6 Agents</p>
                    <p className="mt-0.5 text-xs text-zinc-500">리뷰·재무 포함 AI 조직</p>
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-white">1-Person</p>
                    <p className="mt-0.5 text-xs text-zinc-500">신속한 독립 의사결정</p>
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-emerald-300">Phase 2</p>
                    <p className="mt-0.5 text-xs text-zinc-500">AI 협업 엔진 가동 중</p>
                  </div>
                </div>
              </div>

              {/* Studio Workflow Blueprint Card */}
              <div className="rounded-3xl border border-white/10 bg-[#101217]/90 p-6 shadow-2xl shadow-black/60 backdrop-blur">
                <div className="flex items-center justify-between border-b border-white/8 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    <span className="font-mono text-xs text-zinc-300">
                      hideaway-os / workflow.pipeline
                    </span>
                  </div>
                  <span className="rounded-md border border-emerald-400/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-300">
                    HUMAN-IN-THE-LOOP
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    {
                      step: "01",
                      actor: "CEO 지시",
                      desc: "새로운 앱 아이디어 또는 운영 목표 입력",
                      status: "Trigger",
                    },
                    {
                      step: "02",
                      actor: "Chief PM AI",
                      desc: "요구사항을 기획·개발·마케팅 태스크로 분해",
                      status: "Orchestrate",
                    },
                    {
                      step: "03",
                      actor: "Specialist Agents & Reviewer",
                      desc: "기획·개발·마케팅·재무 협업 후 품질 리뷰어 검수 및 재토론",
                      status: "Debate & QA",
                    },
                    {
                      step: "04",
                      actor: "대표 최종 승인 / 긴급 회의",
                      desc: "리뷰 통과 보고서 승인 또는 쟁점 발생 시 긴급 회의 결정",
                      status: "Approve",
                    },
                  ].map((item) => (
                    <div
                      key={item.step}
                      className="flex items-start gap-3.5 rounded-2xl border border-white/6 bg-white/[0.025] p-3.5"
                    >
                      <span className="mt-0.5 font-mono text-xs font-semibold text-emerald-400">
                        {item.step}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-zinc-100">
                            {item.actor}
                          </p>
                          <span className="font-mono text-[10px] text-zinc-500">
                            {item.status}
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between rounded-xl border border-white/8 bg-black/30 px-4 py-3 text-xs text-zinc-400">
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Powered by Gemini API &amp; Next.js</span>
                  </span>
                  <Link
                    href="/workspace"
                    className="font-medium text-emerald-300 hover:text-emerald-200"
                  >
                    미리보기 →
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* About / Philosophy */}
          <section
            id="about"
            className="border-t border-white/8 bg-[#0b0c10]/70 py-20 md:py-24"
          >
            <div className="mx-auto max-w-6xl px-6">
              <div className="max-w-2xl">
                <p className="font-mono text-xs uppercase tracking-widest text-emerald-400">
                  About Hideaway Lab
                </p>
                <h2 className="mt-3 break-keep text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  앱 개발을 넘어, 다양한 수익화 프로젝트를 실행하는 AI 랩
                </h2>
                <p className="mt-3 break-keep text-sm leading-relaxed text-zinc-400 sm:text-base">
                  단순한 외주나 단일 앱 제작에 머무르지 않고, AI 조직의 빠른
                  실행력과 철저한 재무 검증을 결합해 여러 비즈니스 기회를 직접
                  실험하고 사업화합니다.
                </p>
              </div>

              <div className="mt-12 grid gap-5 md:grid-cols-3">
                {[
                  {
                    icon: Workflow,
                    title: "6인 AI 조직 기반 실행",
                    desc: "총괄 PM·품질 리뷰어·재무·기획·개발·마케팅 AI가 서로 토론하고 검증하며 아이디어에서 실행까지의 속도를 극대화합니다.",
                  },
                  {
                    icon: ShieldCheck,
                    title: "재무 검증 & 대표 책임 결재",
                    desc: "모든 프로젝트는 재무 분석가 AI의 비용·손익 시뮬레이션과 품질 리뷰어 검수를 거쳐 대표자가 최종 승인하는 원칙을 지킵니다.",
                  },
                  {
                    icon: Layers,
                    title: "앱 주력 · 다각화된 수익 실험",
                    desc: "실용 소프트웨어와 앱 개발을 중심에 두되, 자동화 도구·마이크로 SaaS·디지털 비즈니스까지 폭넓은 수익 모델을 실행합니다.",
                  },
                ].map((pillar) => {
                  const Icon = pillar.icon;
                  return (
                    <div
                      key={pillar.title}
                      className="rounded-2xl border border-white/8 bg-white/[0.02] p-6 transition hover:border-white/15 hover:bg-white/[0.035]"
                    >
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-500/10 text-emerald-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-5 text-base font-semibold text-white">
                        {pillar.title}
                      </h3>
                      <p className="mt-2.5 text-sm leading-relaxed text-zinc-400">
                        {pillar.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Projects / App Portfolio */}
          <section id="projects" className="border-t border-white/8 py-20 md:py-24">
            <div className="mx-auto max-w-6xl px-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <p className="font-mono text-xs uppercase tracking-widest text-emerald-400">
                    Portfolio &amp; Lab
                  </p>
                  <h2 className="mt-3 break-keep text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    기획하고 실행 중인 프로젝트
                  </h2>
                  <p className="mt-2 break-keep text-sm text-zinc-400">
                    하이드어웨이 랩의 AI 협업 플랫폼과 주력 앱, 그리고 다양한
                    수익화 비즈니스 파이프라인입니다.
                  </p>
                </div>
                <span className="font-mono text-xs text-zinc-500">
                  0{siteConfig.projects.length} PROJECTS IN PIPELINE
                </span>
              </div>

              <div className="mt-10 grid gap-5 md:grid-cols-3">
                {siteConfig.projects.map((project) => (
                  <article
                    key={project.id}
                    className="group flex flex-col justify-between rounded-2xl border border-white/8 bg-[#101217]/80 p-6 transition hover:border-emerald-400/35"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs text-zinc-500">
                          {project.code}
                        </span>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                            project.status === "진행 중"
                              ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                              : project.status === "기획 예정"
                                ? "border-sky-400/30 bg-sky-500/10 text-sky-300"
                                : "border-white/10 bg-white/5 text-zinc-400"
                          }`}
                        >
                          {project.status}
                        </span>
                      </div>

                      <h3 className="mt-5 text-lg font-semibold text-white">
                        {project.name}
                      </h3>
                      <p className="mt-1 text-xs font-medium text-emerald-300/90">
                        {project.tagline}
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                        {project.description}
                      </p>
                    </div>

                    <div className="mt-6 space-y-4 border-t border-white/8 pt-4">
                      <div className="flex flex-wrap gap-1.5">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md bg-white/5 px-2 py-1 font-mono text-[11px] text-zinc-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {project.href ? (
                        <Link
                          href={project.href}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300 transition group-hover:text-emerald-200"
                        >
                          <span>워크스페이스 진입하기</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      ) : (
                        <p className="text-xs text-zinc-500">
                          출시 시 이곳에 서비스 링크가 공개됩니다.
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* AI Agent Team */}
          <section
            id="agents"
            className="border-t border-white/8 bg-[#0b0c10]/70 py-20 md:py-24"
          >
            <div className="mx-auto max-w-6xl px-6">
              <div className="max-w-2xl">
                <p className="font-mono text-xs uppercase tracking-widest text-emerald-400">
                  AI Organization
                </p>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  하이드어웨이 랩의 AI 협업 조직
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
                  고성능 리더·검수층(총괄 PM, 품질 리뷰어)과 4명의 실무 전문
                  AI(재무·기획·개발·마케팅)가 서로 토론하고 검증하며 업무를
                  완성합니다.
                </p>
              </div>

              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {siteConfig.agents.map((agent) => {
                  const style = accentStyles[agent.accent];
                  return (
                    <div
                      key={agent.id}
                      className="rounded-2xl border border-white/8 bg-[#101217]/80 p-5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${style.badge}`}
                        >
                          <Bot className="h-3 w-3" />
                          {agent.koreanName}
                        </span>
                        <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-zinc-400">
                          {agent.tier}
                        </span>
                      </div>
                      <p className="mt-4 font-mono text-xs text-zinc-500">
                        {agent.role}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                        {agent.summary}
                      </p>
                      <ul className="mt-4 space-y-2 border-t border-white/8 pt-4 text-xs text-zinc-400">
                        {agent.responsibilities.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <span
                              className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`}
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Roadmap */}
          <section id="roadmap" className="border-t border-white/8 py-20 md:py-24">
            <div className="mx-auto max-w-6xl px-6">
              <div className="max-w-2xl">
                <p className="font-mono text-xs uppercase tracking-widest text-emerald-400">
                  Roadmap
                </p>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  단계별 구축 로드맵
                </h2>
              </div>

              <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {siteConfig.roadmap.map((step) => {
                  const active = step.status === "진행 중";
                  const completed = step.status === "완료";
                  return (
                    <div
                      key={step.phase}
                      className={`rounded-2xl border p-5 ${
                        active
                          ? "border-emerald-400/40 bg-emerald-500/[0.06]"
                          : completed
                            ? "border-emerald-400/20 bg-white/[0.03]"
                            : "border-white/8 bg-white/[0.02]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-semibold text-emerald-400">
                          {step.phase}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] ${
                            active
                              ? "bg-emerald-400/20 text-emerald-200"
                              : completed
                                ? "bg-emerald-500/15 text-emerald-300"
                                : "bg-white/5 text-zinc-400"
                          }`}
                        >
                          {step.status}
                        </span>
                      </div>
                      <h3 className="mt-4 text-base font-semibold text-white">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                        {step.detail}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Contact CTA */}
          <section
            id="contact"
            className="border-t border-white/8 bg-[#0b0c10]/70 py-20"
          >
            <div className="mx-auto max-w-6xl px-6">
              <div className="flex flex-col items-start justify-between gap-8 rounded-3xl border border-white/10 bg-gradient-to-br from-[#11151c] via-[#0e1116] to-[#0c1412] p-8 md:flex-row md:items-center md:p-12">
                <div className="max-w-xl space-y-3">
                  <div className="inline-flex items-center gap-2 text-xs font-medium text-emerald-300">
                    <Mail className="h-4 w-4" />
                    <span>CONTACT &amp; COLLABORATION</span>
                  </div>
                  <h2 className="break-keep text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    하이드어웨이 랩과 함께할 이야기가 있나요?
                  </h2>
                  <p className="break-keep text-sm leading-relaxed text-zinc-400">
                    비즈니스 제휴, 앱·프로젝트 협업, 또는 서비스 피드백은 언제든
                    이메일로 연락해 주세요.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <CopyEmailButton email={siteConfig.business.email} />
                  <Link
                    href="/workspace"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400"
                  >
                    <Cpu className="h-4 w-4" />
                    <span>워크스페이스</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
