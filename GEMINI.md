# Project Context & Guidelines — Hideaway Lab (`AI One man company`)

> 이 문서는 **하이드어웨이 랩(Hideaway Lab)** 프로젝트(`D:\Projects\AI One man company`)의 모든 작업(설계, 구현, 리뷰, 테스트, 문서화)에서 최우선으로 참고하는 기준 컨텍스트입니다.

---

## 1. 프로젝트 개요 (Project Overview)

- **프로젝트명**: 하이드어웨이 랩 (Hideaway Lab) — 공식 웹사이트 & AI 워크스페이스 (`hideawaylab-web`)
- **도메인**: `https://hideawaylab.kr`
- **한 줄 요약**: 하이드어웨이 랩의 공식 소개·포트폴리오 웹사이트 및 대표자 전용 AI 워크스페이스(`/workspace`) 웹 애플리케이션
- **핵심 목표**:
  - 깔끔하고 신뢰감 있는 브랜드/포트폴리오 웹사이트 운영
  - 대표자 전용 AI 워크스페이스(`/workspace`)를 단계적으로 확장할 수 있는 유지보수 친화적 구조 유지
- **주요 사용자**: 외부 방문자·잠재 고객(공식 웹사이트), 대표자(전용 `/workspace`)
- **현재 단계**: Phase 1 (공식 웹사이트 및 기본 `/workspace` 페이지 구성, Supabase Auth 연동 예정)

### 핵심 도메인 용어 (Glossary)
| 용어 | 의미 | 비고 |
| :--- | :--- | :--- |
| `Hideaway Lab` | 하이드어웨이 랩 브랜드 및 1인 AI 회사 | 공식 도메인 `hideawaylab.kr` |
| `/workspace` | 대표자 전용 AI 워크스페이스 영역 | 추후 Supabase Auth 기반 접근 제어 예정 |
| `site config` | 사업자 정보·연락처·포트폴리오 중앙 설정 | `src/config/site.ts`에서 단일 관리 |

---

## 2. 기술 스택 및 환경 (Tech Stack & Environment)

- **언어 / 런타임**: TypeScript (`strict: true`), React, Node.js
- **프레임워크 / 라이브러리**:
  - Frontend / Fullstack: Next.js (App Router), React, React DOM
  - Styling: Tailwind CSS v4 (`@tailwindcss/postcss`)
  - Icons: `lucide-react`
- **인증 / DB (예정)**: Supabase Auth (대표자 전용 `/workspace` 접근 제어 예정 — 세부 스키마 확인 필요)
- **패키지 매니저**: `npm` (`package-lock.json` 사용, Windows PowerShell 환경에서는 `npm.cmd` 사용 가능) *(다른 패키지 매니저 혼용 금지)*
- **배포 / 호스팅**: Vercel (Hobby)
- **주요 설정**:
  - Path Alias: `@/*` → `./src/*` (`tsconfig.json`)
  - Next.js 이미지 최적화 비활성화: `images.unoptimized: true` (`next.config.ts`)
- **필수 환경 변수 (값 기재 금지)**:
  - 현재 Phase 1 기준 필수 환경 변수 없음 (추후 Supabase 연동 시 키 이름과 용도만 추가 기재 — 확인 필요)

---

## 3. 디렉토리 구조 및 아키텍처 (Architecture)

```text
.
├── src/
│   ├── app/                  # Next.js App Router 라우팅, 레이아웃, 전역 스타일
│   │   ├── layout.tsx        # 루트 레이아웃
│   │   ├── page.tsx          # 메인 랜딩 페이지
│   │   ├── globals.css       # 전역 CSS (Tailwind v4)
│   │   └── workspace/
│   │       └── page.tsx      # 대표자 전용 AI 워크스페이스 페이지
│   ├── components/           # 공통 UI 컴포넌트 (Navbar, Footer, CopyEmailButton 등)
│   └── config/
│       └── site.ts           # 사업자 정보, 연락처, 포트폴리오 목록 단일 관리 파일
├── next.config.ts            # Next.js 설정
├── postcss.config.mjs        # PostCSS / Tailwind 설정
├── tsconfig.json             # TypeScript 설정
└── package.json              # 의존성 및 스크립트
```

### 아키텍처 원칙
- **단일 설정 원칙**: 대표자명, 사업자등록번호, 소재지, 이메일, 프로젝트/포트폴리오 목록은 컴포넌트에 하드코딩하지 않고 `src/config/site.ts`에서 중앙 관리한다.
- **관심사 분리**: 비즈니스 로직·데이터 접근 로직이 늘어나면 UI 컴포넌트에 직접 작성하지 않고 별도 모듈(`src/lib/`, `src/features/` 등)로 분리한다.
- **공통 모듈 우선**: 새로운 유틸리티나 컴포넌트를 만들기 전에 `src/components/`, `src/config/`의 기존 코드를 재사용할 수 있는지 먼저 확인한다.

---

## 4. 주요 실행 명령어 (Key Commands)

| 작업 | 명령어 (PowerShell 기준 `npm.cmd` 가능) | 비고 |
| :--- | :--- | :--- |
| 의존성 설치 | `npm install` | `package-lock.json` 기준 |
| 로컬 개발 서버 | `npm run dev` | 기본 주소: `http://localhost:3000` |
| 프로덕션 빌드 | `npm run build` | 배포 전 빌드 검증 |
| 프로덕션 서버 실행 | `npm run start` | 빌드 결과 실행 |
| 린트 검사 | `npm run lint` | Next.js ESLint 검사 |
| 타입 체크 | `npx tsc --noEmit` | TypeScript 정적 타입 검증 |
| 자동화 테스트 | *(현재 미구성 — 확인 필요)* | 테스트 프레임워크 도입 시 업데이트 |

---

## 5. 코딩 컨벤션 및 품질 기준 (Coding Standards)

### 네이밍 및 스타일
- **파일/폴더명**: React 컴포넌트는 `PascalCase` (`Navbar.tsx`, `CopyEmailButton.tsx`), App Router 규약 파일은 소문자(`page.tsx`, `layout.tsx`), 설정/유틸리티는 `camelCase` 또는 `kebab-case`를 사용한다.
- **타입 안전성**: `strict: true` 기준을 유지하고 `any` 사용을 지양한다. 외부 입력이나 API 응답은 명시적 타입 및 검증 로직을 거친다.
- **에러 처리**: 빈 `catch` 블록을 금지하며, 사용자에게 노출할 메시지와 내부 디버깅 로그를 구분한다.
- **주석**: 코드가 *무엇을* 하는지가 아니라 *왜* 그렇게 구현했는지(제약, 의도, 트레이드오프) 위주로 작성한다.

### 금지 패턴 (Anti-Patterns)
- 시크릿, API 키, 비밀번호, 민감 정보 하드코딩 금지
- 사업자 정보·포트폴리오 등 설정 데이터를 여러 컴포넌트에 중복 하드코딩하는 행위 금지 (`src/config/site.ts` 사용)
- 사용하지 않는 `import`, 죽은 코드, 디버그용 `console.log` 방치 금지

---

## 6. 작업 방식 및 AI 에이전트 수칙 (Workflow & Agent Rules)

### 응답 방식
- **한국어 존댓말**로 답한다. (코드 식별자·기술 용어는 원문 유지 가능)
- 확인하지 못한 내용은 **"확인 필요"**라고 명시한다.
- 요구사항이 모호하면 추측하지 말고 질문한다. (설계 선택지가 여러 개일 때는 장단점과 추천안을 함께 정리해 질문한다.)

### 작업 방식
- **계획 우선 및 승인**: 여러 파일에 걸친 큰 변경이나 구조 변경은 구현 전에 계획을 먼저 제시하고 **승인을 받는다**.
- **최소 변경 (Minimal Diff)**: 요청받은 작업 범위에 집중한다. 관련 없는 파일의 포맷팅이나 대규모 리팩토링을 임의로 섞지 않는다.
- **기존 패턴 존중**: 새 코드를 작성하기 전, 유사한 기존 파일의 스타일과 패턴을 먼저 확인해 일관성을 유지한다.
- **테스트 실행 및 보고**: 코드를 수정한 뒤에는 타입 체크(`npx tsc --noEmit`), 린트(`npm run lint`), 빌드(`npm run build`) 및 관련 테스트를 실행하고 결과를 보고한다.
- **작업 완료 요약**: 작업이 끝나면 아래 항목을 정리해 요약한다.
  1. 변경한 파일
  2. 실행한 테스트 (명령어 포함)
  3. 실행 결과
  4. 남은 문제 또는 후속 과제

### 비용 및 대량 토큰 작업 사전 승인 (필수)
- **적용 대상**:
  - **비용이 발생하는 작업**: 유료 API 호출(외부 LLM, 이미지·영상·음성 생성 등), 클라우드 리소스 생성·확장(Vercel 유료 플랜/애드온, Supabase 유료 리소스 등), 유료 서비스 연동 등 과금이 발생할 수 있는 모든 작업
  - **대량 토큰이 소요되는 작업**: 대규모 코드베이스 전체 탐색·일괄 수정, 다수의 서브에이전트/병렬 워크플로우 실행, 대용량 파일·로그 일괄 분석 등 많은 토큰이 소모되는 작업
- **사전 승인 절차**: 위 작업은 실행 전 반드시 아래 항목을 먼저 설명하고 **사용자의 명시적 승인**을 받은 뒤에 진행한다.
  1. 수행할 작업 내용과 범위
  2. 예상 비용 또는 예상 토큰 소모 규모(및 소모 원인)
  3. 더 적은 비용·토큰으로 처리할 수 있는 대안(해당 시)

### Git & 커밋 컨벤션
- **브랜치 규칙**: `[확인 필요 — 예: feat/<name>, fix/<name>, refactor/<name>]`
- **커밋 메시지**: `[확인 필요 — 예: Conventional Commits — feat:, fix:, docs:, refactor:, test:, chore:]`

---

## 7. 하지 말아야 할 것 (보안 및 절대 금지 사항)

- `.env`, 인증 정보, 비밀번호, API 키, 토큰이 담긴 파일을 **읽어서 출력하거나**, 코드·문서에 하드코딩하거나 커밋하지 않는다.
- `<수정 금지 폴더, 예: vendor/, migrations/>` 및 자동 생성 파일(`.next/`, `node_modules/`, `next-env.d.ts`, `tsconfig.tsbuildinfo`, `package-lock.json` 임의 수동 편집)은 수정하지 않는다.
- 사용자가 요청하지 않은 `git push`, 배포, 데이터 삭제는 하지 않는다.
- 프로덕션 DB·인프라·도메인 설정 변경 등 되돌리기 어려운 작업은 반드시 사전 승인을 받는다.
- **사전 승인 없이** 비용이 발생하는 작업이나 대량의 토큰이 소요되는 작업을 임의로 실행하지 않는다.

---

## 8. 주요 참고 문서 (References)

- **프로젝트 안내**: [`README.md`](./README.md)
- **사이트·사업자·포트폴리오 설정**: [`src/config/site.ts`](./src/config/site.ts)
- **기획 / API / 디자인 문서**: `[추후 문서 추가 시 경로 기재]`
