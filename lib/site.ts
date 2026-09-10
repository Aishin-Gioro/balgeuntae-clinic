/**
 * 사이트 공통 상수 / 타입 재노출
 * ────────────────────────────────────────────────────────────
 * 콘텐츠(문구·링크·이미지)는 이제 `lib/content/` 에서 관리되고, 원장님이
 * /admin 관리자 페이지에서 직접 수정합니다. 이 파일은 콘텐츠에 의존하지 않는
 * 순수 상수와 타입 재노출만 남깁니다.
 */

export {
  MOBILE_BREAK,
  MOBILE_BREAK_TOKEN,
  type HeroTrackId,
  type HeroVariant,
  type HeroTrack,
  type SiteContent,
} from "./content/schema";

/** 전화번호 문자열("010-1234-5678")을 tel: 링크로 변환 */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^0-9+]/g, "")}`;
}
