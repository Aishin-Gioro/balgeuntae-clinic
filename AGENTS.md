# AGENTS.md

밝은태 한의원 랜딩페이지. 코딩 에이전트(Codex 등)를 위한 컨텍스트.

## 콘텐츠 / 카피 기준
- **`docs/brand-copy.md`** — "태(胎)"의 의미 브랜드 철학 원고 전문. 모든 카피는 이 원고의 어휘·톤을 따를 것 (태 → 고착 → 환골탈태, 씨앗 은유).
- **`docs/landing-brief.md`** — 클라이언트 요구사항, 페이지 구성안, 구현 현황, 원장님 확인 대기 항목.
- **`docs/admin-guide.md`** — 원장님용 `/admin` 사용 안내(비개발자 대상).
- 이 문서들은 `.gitignore`에 있어 원격에는 안 올라감(저장소 공개). 로컬 참고용.

## 기술 스택
- Next.js 15 (App Router) + React 19 + TypeScript
- CSS Modules, `next/font` (Noto Sans KR = `--font-sans`, Noto Serif KR = `--font-serif`)
- `npm run dev` (localhost:3000)

## 저장소 구조
- `app/` — layout.tsx(메타·폰트), page.tsx, globals.css
- `app/admin/` — 관리자(원장님) 콘텐츠 편집 페이지. `/admin/login` 비밀번호 로그인 → `/admin` 대시보드.
- `components/` — Header, Hero, Story, Treatment, UtilBar, MobileCta (+ 각 `.module.css`), icons.tsx
- `components/ContentProvider.tsx` — 서버에서 읽은 콘텐츠를 클라이언트 컴포넌트로 전달(`useContent()`).
- `components/admin/` — 관리자 편집기(`AdminEditor.tsx`) + 입력 필드 컴포넌트.
- `lib/content/` — **콘텐츠 관리처**. `schema.ts`(타입 + 기본 원고), `storage.ts`(Vercel Blob / 로컬 파일 드라이버), `index.ts`(`getContent()` / `saveContent()`).
  - 서버 컴포넌트: `await getContent()`. 클라이언트 컴포넌트: `useContent()`.
  - 새 콘텐츠 필드는 반드시 `schema.ts`의 `defaultContent`에 기본값을 넣을 것.
- `lib/site.ts` — 콘텐츠에 의존하지 않는 상수/타입 재노출(`MOBILE_BREAK`, `telHref` 등)만 남음.
- `lib/admin/auth.ts` — 관리자 비밀번호(`ADMIN_PASSWORD`) + HMAC 서명 세션 쿠키.
- `public/images/` — 기본 배경/트랙 이미지. 관리자가 올린 이미지는 Vercel Blob(배포) 또는 `public/uploads/`(로컬).

## 콘텐츠 저장 / 배포
- 저장소 드라이버는 `BLOB_READ_WRITE_TOKEN` 존재 여부로 자동 선택.
  - 있음(Vercel): `content.json` + 업로드 이미지를 Vercel Blob에 저장. 저장 즉시 `revalidateTag("site-content")`로 반영.
  - 없음(로컬): `.data/content.json` + `public/uploads/`. 둘 다 `.gitignore`.
- 필요한 환경변수: `SESSION_SECRET`(기존), `ADMIN_PASSWORD`, (배포 시) `BLOB_READ_WRITE_TOKEN`. `.env.local.example` 참고.
- Vercel 설정: 프로젝트에 Blob 스토어를 생성·연결하면 `BLOB_READ_WRITE_TOKEN`이 자동 주입됨.

## 컨벤션
- 섹션 제목은 세리프(`var(--font-serif)`), 소제목 kicker는 `#6b5b3e`.
- 고정 헤더(84px) 대응: 앵커 대상 섹션에 `scroll-margin-top: 84px`.
- 한글 줄바꿈 제어는 `\n` + CSS `white-space: pre-line`. `max-width`는 `ch` 대신 `em` 사용(한글 1자 ≈ 1em).
- 히어로/진료과목 전환은 겹쳐두고 opacity 크로스페이드 + `.slideActive` 셀렉터로 애니메이션 재시작.
- `prefers-reduced-motion` 대응 필수.

## 진행 상태
`docs/landing-brief.md`의 "구현 현황" 참고.
