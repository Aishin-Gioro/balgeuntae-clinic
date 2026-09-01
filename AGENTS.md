# AGENTS.md

밝은태 한의원 랜딩페이지. 코딩 에이전트(Codex 등)를 위한 컨텍스트.

## 콘텐츠 / 카피 기준
- **`docs/brand-copy.md`** — "태(胎)"의 의미 브랜드 철학 원고 전문. 모든 카피는 이 원고의 어휘·톤을 따를 것 (태 → 고착 → 환골탈태, 씨앗 은유).
- **`docs/landing-brief.md`** — 클라이언트 요구사항, 페이지 구성안, 구현 현황, 원장님 확인 대기 항목.
- 이 두 문서는 `.gitignore`에 있어 원격에는 안 올라감(저장소 공개). 로컬 참고용.

## 기술 스택
- Next.js 15 (App Router) + React 19 + TypeScript
- CSS Modules, `next/font` (Noto Sans KR = `--font-sans`, Noto Serif KR = `--font-serif`)
- `npm run dev` (localhost:3000)

## 저장소 구조
- `app/` — layout.tsx(메타·폰트), page.tsx, globals.css
- `components/` — Header, Hero, Story, Treatment, UtilBar, MobileCta (+ 각 `.module.css`), icons.tsx
- `lib/site.ts` — **콘텐츠 단일 관리처**: 연락처·외부링크·히어로 슬라이드·`story`·`treatment` 상수. 문구 수정은 여기서.
- `public/images/` — 배경/트랙 이미지. 없으면 그라데이션/네이비 플레이스홀더. 파일명 규칙은 `public/images/README.md` 참고.

## 컨벤션
- 섹션 제목은 세리프(`var(--font-serif)`), 소제목 kicker는 `#6b5b3e`.
- 고정 헤더(84px) 대응: 앵커 대상 섹션에 `scroll-margin-top: 84px`.
- 한글 줄바꿈 제어는 `\n` + CSS `white-space: pre-line`. `max-width`는 `ch` 대신 `em` 사용(한글 1자 ≈ 1em).
- 히어로/진료과목 전환은 겹쳐두고 opacity 크로스페이드 + `.slideActive` 셀렉터로 애니메이션 재시작.
- `prefers-reduced-motion` 대응 필수.

## 진행 상태
`docs/landing-brief.md`의 "구현 현황" 참고.
