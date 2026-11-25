# 하이드어웨이 랩 (Hideaway Lab) — 공식 웹사이트 & AI 워크스페이스

도메인: `https://hideawaylab.kr`

## 기술 스택 (Phase 1)
- **Framework**: Next.js (App Router + TypeScript)
- **Styling**: Tailwind CSS v4
- **Hosting**: Vercel (Hobby)
- **Auth (예정)**: Supabase Auth (대표자 전용 `/workspace` 접근 제어)

## 로컬 실행 방법 (Windows PowerShell)
```powershell
npm.cmd install
npm.cmd run dev
```
브라우저에서 `http://localhost:3000`으로 접속합니다.

## 사업자 정보 및 포트폴리오 수정
[`src/config/site.ts`](./src/config/site.ts) 파일에서 대표자명, 사업자등록번호, 소재지, 이메일, 프로젝트 목록을 한 곳에서 쉽게 수정할 수 있습니다.
