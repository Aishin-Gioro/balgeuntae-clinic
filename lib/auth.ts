/**
 * 전후 사진 열람 게이트 — 카카오 인증 세션
 * ─ 의료법 제56조 제2항: 치료 전후 비교 사진은 로그인(연령·환자 확인) 후에만 노출
 * ─ 사용자 프로필은 저장하지 않는다. "카카오 인증을 통과했다"는 사실만
 *   HMAC 서명 쿠키로 들고 다닌다. DB 없음.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const GATE_COOKIE = "bt_gate";

/** 카카오 OAuth CSRF 방지용 nonce 쿠키 */
export const OAUTH_STATE_COOKIE = "bt_oauth_state";

/** 세션 유효기간 (7일) */
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error("SESSION_SECRET 환경변수가 없거나 너무 짧습니다 (16자 이상).");
  }
  return s;
}

/**
 * 용도 구분값("gate:")을 함께 서명한다. 관리자 토큰(lib/admin/auth.ts)과 같은
 * SESSION_SECRET·같은 형식을 쓰므로, 구분값이 없으면 게이트 쿠키를 관리자 쿠키로
 * 바꿔 넣는 것만으로 관리자 권한을 얻을 수 있다.
 */
function sign(payload: string): string {
  return createHmac("sha256", secret()).update(`gate:${payload}`).digest("base64url");
}

/** `<만료 epoch초>.<서명>` 형태의 토큰 생성 */
export function createGateToken(now = Date.now()): string {
  const exp = Math.floor(now / 1000) + MAX_AGE_SECONDS;
  const payload = String(exp);
  return `${payload}.${sign(payload)}`;
}

export function verifyGateToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return false;

  const payload = token.slice(0, dot);
  const providedSig = token.slice(dot + 1);
  const expectedSig = sign(payload);

  const a = Buffer.from(providedSig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  const exp = Number(payload);
  if (!Number.isFinite(exp)) return false;
  return exp * 1000 > Date.now();
}

/** 서버 컴포넌트/라우트에서 현재 요청이 전후 사진 열람 권한을 가졌는지 */
export async function isGateUnlocked(): Promise<boolean> {
  const store = await cookies();
  return verifyGateToken(store.get(GATE_COOKIE)?.value);
}

/**
 * 콜백 후 복귀할 경로. 오픈 리다이렉트 방지를 위해 사이트 내부 경로(+앵커)만 허용.
 * 허용되지 않으면 전후 사진 위치로 보낸다.
 */
export function safeReturnPath(raw: string | null | undefined): string {
  const fallback = "/";
  if (!raw || !raw.startsWith("/")) return fallback;
  // 문자열 검사만으로는 "/\t/evil.com"처럼 URL 파서가 탭·개행을 지운 뒤
  // "//evil.com"이 되는 경우를 막을 수 없다. 실제로 해석해서 출처가 바뀌지 않는지 확인한다.
  const base = "http://internal.invalid";
  try {
    const url = new URL(raw, base);
    if (url.origin !== base) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export const gateCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE_SECONDS,
};
