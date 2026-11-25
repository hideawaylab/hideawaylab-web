export interface ProjectItem {
  id: string;
  code: string;
  name: string;
  tagline: string;
  description: string;
  status: "진행 중" | "기획 예정" | "로드맵";
  tags: string[];
  href?: string;
}

export interface AgentRole {
  id: string;
  role: string;
  koreanName: string;
  summary: string;
  responsibilities: string[];
  accent: "emerald" | "sky" | "amber" | "violet";
}

export const siteConfig = {
  brand: {
    nameKo: "하이드어웨이 랩",
    nameEn: "Hideaway Lab",
    domain: "hideawaylab.kr",
    url: "https://hideawaylab.kr",
    tagline: "AI와 함께 일상을 바꾸는 실용적인 소프트웨어를 만듭니다.",
  },
  business: {
    companyName: "하이드어웨이 랩 (Hideaway Lab)",
    ceoName: "신정우",
    registrationNumber: "662-08-01900",
    email: "k072810@gmail.com",
    address: "",
    foundedYear: 2026,
  },
  projects: [
    {
      id: "ai-workspace",
      code: "CORE · 00",
      name: "Hideaway AI Workspace",
      tagline: "AI 1인 기업 멀티 에이전트 협업 플랫폼",
      description:
        "대표의 지시를 총괄 PM AI가 업무 단위로 분해하고, 기획·개발·마케팅 에이전트가 협업해 결과물을 보고하면 대표가 최종 승인하는 전용 운영 시스템입니다.",
      status: "진행 중",
      tags: ["Next.js", "FastAPI", "Gemini API", "Human-in-the-Loop"],
      href: "/workspace",
    },
    {
      id: "app-01",
      code: "APP · 01",
      name: "First Utility App",
      tagline: "첫 번째 자체 출시 실용 앱 (준비 중)",
      description:
        "하이드어웨이 랩의 AI 협업 파이프라인을 실전 투입해 기획부터 개발, 마케팅까지 완주하는 첫 번째 독립 소프트웨어 프로젝트입니다.",
      status: "기획 예정",
      tags: ["Web / Mobile", "AI Assistant", "Coming Soon"],
    },
    {
      id: "app-02",
      code: "LAB · 02",
      name: "Micro-SaaS Experiments",
      tagline: "1인 사업자와 창작자를 위한 작은 도구들",
      description:
        "현장의 반복적인 비효율을 빠르게 해결하는 경량 웹 서비스와 자동화 도구를 지속적으로 실험하고 공개할 예정입니다.",
      status: "로드맵",
      tags: ["Automation", "Productivity", "SaaS"],
    },
  ] as ProjectItem[],
  agents: [
    {
      id: "pm",
      role: "Chief PM Agent",
      koreanName: "총괄 PM AI",
      summary: "대표의 목표를 실행 가능한 태스크로 분해하고 최종 품질을 검수합니다.",
      responsibilities: ["요구사항 분석 및 작업 분배", "일정 및 진행 상태 추적", "산출물 통합 및 최종 보고"],
      accent: "emerald",
    },
    {
      id: "research",
      role: "Research & Product Agent",
      koreanName: "기획 · 리서치 AI",
      summary: "시장과 사용자 문제를 조사하고 명확한 서비스 기획서(PRD)를 작성합니다.",
      responsibilities: ["경쟁 서비스 및 트렌드 조사", "핵심 기능 정의 및 UX 설계", "수익화 모델 가설 수립"],
      accent: "sky",
    },
    {
      id: "engineering",
      role: "Engineering Agent",
      koreanName: "개발 AI",
      summary: "웹·앱 프론트엔드와 백엔드 아키텍처를 구현하고 자동화 배포를 지원합니다.",
      responsibilities: ["UI/UX 및 API 코드 구현", "오류 디버깅 및 리팩토링", "GitHub · Vercel 배포 파이프라인"],
      accent: "amber",
    },
    {
      id: "growth",
      role: "Growth & Copy Agent",
      koreanName: "마케팅 · 카피 AI",
      summary: "제품의 가치를 명확한 언어로 다듬고 고객과 만나는 접점을 설계합니다.",
      responsibilities: ["브랜드 메시지 및 랜딩 카피", "출시 콘텐츠 및 SEO 최적화", "고객 피드백 정리 및 개선안 도출"],
      accent: "violet",
    },
  ] as AgentRole[],
  roadmap: [
    {
      phase: "Phase 1",
      title: "브랜드 기반 & 공식 웹페이지",
      status: "진행 중",
      detail: "hideawaylab.kr 도메인 연결, 공식 홈페이지 오픈, 대표자 전용 로그인(Supabase Auth) 구축",
    },
    {
      phase: "Phase 2",
      title: "AI 1인 기업 협업 엔진 MVP",
      status: "다음 단계",
      detail: "FastAPI + Gemini API 기반 멀티 에이전트 파이프라인 및 실시간 협업 대시보드 구현",
    },
    {
      phase: "Phase 3",
      title: "실무 도구 연동 & 승인 자동화",
      status: "예정",
      detail: "웹 검색, 문서 생성, GitHub, 이메일 연동 및 대표자 승인(Human-in-the-loop) 프로세스 고도화",
    },
    {
      phase: "Phase 4",
      title: "자체 수익화 앱 출시 & 확장",
      status: "예정",
      detail: "첫 자체 앱 개발 실전 투입, 지속적인 프로덕트 론칭 및 플랫폼 SaaS 확장 검토",
    },
  ],
};
