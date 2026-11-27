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
  tier: "리더 · 검수 (고성능)" | "실무 팀원";
  summary: string;
  responsibilities: string[];
  accent: "emerald" | "rose" | "sky" | "amber" | "violet" | "cyan";
}

export const siteConfig = {
  brand: {
    nameKo: "하이드어웨이 랩",
    nameEn: "Hideaway Lab",
    domain: "hideawaylab.kr",
    url: "https://hideawaylab.kr",
    tagline:
      "아이디어에서 수익까지, 앱 개발과 다양한 디지털 비즈니스를 AI 조직과 함께 기획하고 실행합니다.",
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
      tagline: "6인 AI 멀티 에이전트 협업 · 리뷰 플랫폼",
      description:
        "대표의 지시를 총괄 PM AI가 분해하고, 기획·개발·마케팅·재무 AI가 협업한 결과를 품질 리뷰어 AI가 검수·재토론시킨 뒤 대표가 최종 승인하는 1인 기업 운영 시스템입니다.",
      status: "진행 중",
      tags: ["Next.js", "Gemini API", "SQLite", "Quality Gate"],
      href: "/workspace",
    },
    {
      id: "app-01",
      code: "APP · 01",
      name: "Flagship Utility App",
      tagline: "주력 자체 소프트웨어 · 앱 프로젝트 (기획 중)",
      description:
        "하이드어웨이 랩의 6인 AI 협업 파이프라인을 실전 투입해 시장 조사·재무 검증·개발·런칭까지 완주하는 첫 번째 주력 앱 프로젝트입니다.",
      status: "기획 예정",
      tags: ["Web / Mobile", "AI Assistant", "Coming Soon"],
    },
    {
      id: "app-02",
      code: "BIZ · 02",
      name: "Revenue & Business Experiments",
      tagline: "마이크로 SaaS · 자동화 · 수익화 비즈니스 실험",
      description:
        "앱 개발을 넘어 현장의 문제를 해결하는 경량 웹 도구, 업무 자동화, 디지털 수익화 프로젝트를 유연하게 기획하고 실행합니다.",
      status: "로드맵",
      tags: ["Business Lab", "Micro-SaaS", "Monetization"],
    },
  ] as ProjectItem[],
  agents: [
    {
      id: "pm",
      role: "Chief PM Agent",
      koreanName: "총괄 PM AI",
      tier: "리더 · 검수 (고성능)",
      summary:
        "대표의 목표를 실행 가능한 태스크로 분해하고 팀 토론을 조율해 최종 보고서를 통합합니다.",
      responsibilities: [
        "요구사항 분석 및 4개 실무팀 분배",
        "재토론 의견 조율 및 보고서 통합",
        "대표자 최종 결재 보고서 작성",
      ],
      accent: "emerald",
    },
    {
      id: "reviewer",
      role: "Quality Reviewer Agent",
      koreanName: "품질 리뷰어 AI",
      tier: "리더 · 검수 (고성능)",
      summary:
        "대표 지시대로 결과가 나왔는지 냉정하게 채점하고, 미달 시 리젝·재토론 또는 긴급 회의를 소집합니다.",
      responsibilities: [
        "대표 지시 충족도 100점 기준 검수",
        "미달 시 리젝 및 AI 팀 재토론 지시",
        "쟁점 미해결 시 긴급 회의 소집 · 대표 호출",
      ],
      accent: "rose",
    },
    {
      id: "finance",
      role: "Finance Analyst Agent",
      koreanName: "재무 분석가 AI",
      tier: "실무 팀원",
      summary:
        "프로젝트에 드는 초기 구축비, 월 운영비, API 비용과 손익분기점을 정밀하게 분석합니다.",
      responsibilities: [
        "초기 투자비 · 월 고정/변동 운영비 산출",
        "무료 티어 vs 유료 전환 시점 비용 시뮬레이션",
        "손익분기점(BEP) 및 3단계 수익 시나리오",
      ],
      accent: "cyan",
    },
    {
      id: "research",
      role: "Research & Product Agent",
      koreanName: "기획 · 리서치 AI",
      summary:
        "시장과 사용자 문제를 조사하고 명확한 서비스 기획서(PRD)와 MVP 범위를 작성합니다.",
      tier: "실무 팀원",
      responsibilities: [
        "경쟁 서비스 및 사용자 페인포인트 조사",
        "핵심 MVP 기능 정의 및 UX 흐름 설계",
        "수익화 모델 및 검증 가설 수립",
      ],
      accent: "sky",
    },
    {
      id: "engineering",
      role: "Engineering Agent",
      koreanName: "개발 AI",
      tier: "실무 팀원",
      summary:
        "1인 기업 환경에 최적화된 풀스택 아키텍처와 구현 단계를 설계하고 배포를 지원합니다.",
      responsibilities: [
        "기술 스택 · DB 스키마 · 화면 구조 설계",
        "구현 난이도 및 기술 리스크 사전 점검",
        "오라클 서버 · CI/CD 배포 파이프라인",
      ],
      accent: "amber",
    },
    {
      id: "growth",
      role: "Growth & Copy Agent",
      koreanName: "마케팅 · 카피 AI",
      tier: "실무 팀원",
      summary:
        "제품의 가치를 명확한 언어로 다듬고 0원으로 시작하는 초기 고객 확보 전략을 설계합니다.",
      responsibilities: [
        "브랜드 네이밍 · 핵심 슬로건 · 랜딩 카피",
        "SEO 및 저비용 초기 유입 채널 설계",
        "고객 피드백 정리 및 전환율 개선안 도출",
      ],
      accent: "violet",
    },
  ] as AgentRole[],
  roadmap: [
    {
      phase: "Phase 1",
      title: "브랜드 기반 & 공식 웹페이지",
      status: "완료",
      detail:
        "hideawaylab.kr 도메인 연결, 오라클 클라우드 자동 HTTPS 배포, 대표자 전용 자체 로그인 구축 완료",
    },
    {
      phase: "Phase 2",
      title: "6인 AI 협업 · 리뷰 엔진",
      status: "진행 중",
      detail:
        "Gemini API + SQLite 기반 6인 AI 협업, 재무 분석, 리뷰어 리젝·재토론 및 긴급 회의 소집 시스템 가동",
    },
    {
      phase: "Phase 3",
      title: "실무 도구 연동 & 자동화",
      status: "예정",
      detail:
        "실시간 웹 검색, 문서 내보내기(MD/PDF), GitHub, 이메일 연동 및 파일 분석 기능 고도화",
    },
    {
      phase: "Phase 4",
      title: "자체 수익화 앱 출시 & 확장",
      status: "예정",
      detail:
        "첫 자체 앱 개발 실전 투입, 지속적인 프로덕트 론칭 및 플랫폼 SaaS 확장 검토",
    },
  ],
};
