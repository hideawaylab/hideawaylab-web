# 하이드어웨이 랩 (Hideaway Lab) — 공식 웹사이트 & AI 워크스페이스

도메인: `https://hideawaylab.kr`

## 기술 스택 (Phase 1 ~ Phase 2)
- **Framework**: Next.js 16 (App Router + TypeScript)
- **Styling**: Tailwind CSS v4
- **AI Engine**: Google Gemini API (`@google/genai` Interactions API — `gemini-3.5-flash-lite` / `gemini-4-hydrogen`)
- **Database**: Node.js 내장 SQLite (`node:sqlite`, `data/workspace.db` 영구 저장)
- **Hosting**: Oracle Cloud Infrastructure (Ubuntu + PM2 + Caddy 자동 HTTPS)
- **Auth**: 서버 자체 대표자 전용 인증 (`scrypt` 해시 + `HttpOnly` HMAC 세션 쿠키)

## 로컬 실행 방법 (Windows PowerShell)
```powershell
npm.cmd install
npm.cmd run dev
```
브라우저에서 `http://localhost:3000`으로 접속합니다.

## 환경 변수 설정 (`.env.local`)
`.env.example`을 참고해 서버의 프로젝트 루트에 `.env.local`을 생성합니다. *(실제 `.env.local` 파일은 Git에 커밋하지 않습니다.)*

- `CEO_EMAIL`: 대표자 로그인 이메일
- `CEO_PASSWORD_HASH`: `scrypt`로 해시된 비밀번호 (`salt:hexHash`)
- `AUTH_SECRET`: 세션 서명용 랜덤 비밀키 (`openssl rand -hex 32`)
- `GEMINI_API_KEY`: Google AI Studio에서 발급한 Gemini API 키 (Phase 2 AI 협업 엔진용)

오라클 서버에서 비밀번호 해시 생성 예시:
```bash
node -e 'const c=require("crypto"),s=c.randomBytes(16).toString("hex");console.log(s+":"+c.scryptSync(process.argv[1],s,64).toString("hex"))' "여기에_원하는_비밀번호"
```

## 사업자 정보 및 포트폴리오 수정
[`src/config/site.ts`](./src/config/site.ts) 파일에서 대표자명, 사업자등록번호, 소재지, 이메일, 프로젝트 목록을 한 곳에서 쉽게 수정할 수 있습니다.
