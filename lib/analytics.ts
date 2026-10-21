/**
 * GTM dataLayer 이벤트 전송 (GA4·Clarity는 GTM이 받아서 전달한다).
 * ─ 모든 이벤트에 현재 진료과목 track(none / stomach / diet)을 붙인다.
 * ─ 이름·연락처·로그인 계정 등 개인을 식별할 수 있는 값은 절대 넣지 않는다.
 */

import type { HeroTrackId } from "./site";

export type AnalyticsTrack = HeroTrackId | "none";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/** 로그인 성공 직후 콜백이 심는 1회용 쿠키 — 클라이언트가 읽고 login_complete 를 보낸 뒤 지운다. */
export const LOGIN_COMPLETE_COOKIE = "bt_login_complete";

export function currentTrack(): AnalyticsTrack {
  const raw = new URLSearchParams(window.location.search).get("track");
  return raw === "stomach" || raw === "diet" ? raw : "none";
}

export function pushEvent(event: string, params: Record<string, string | number> = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, track: currentTrack(), ...params });
}
