/**
 * 관리자(원장님) 인증 — 비밀번호 1개 + HMAC 서명 세션 쿠키
 * ────────────────────────────────────────────────────────────
 * - 비밀번호는 환경변수 ADMIN_PASSWORD 하나. DB·계정 없음.
 * - 로그인 성공 시 "관리자임"을 뜻하는 서명 토큰을 쿠키로 발급.
 * - 서명키는 기존 게이트와 동일하게 SESSION_SECRET 사용.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "bt_admin";

/** 세션 유효기간 (12시간) */
const MAX_AGE_SECONDS = 60 * 60 * 12;

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error("SESSION_SECRET 환경변수가 없거나 너무 짧습니다 (16자 이상).");
  }
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/** 입력한 비밀번호가 ADMIN_PASSWORD 와 일치하는지 */
export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || expected.length < 4) {
    throw new Error("ADMIN_PASSWORD 환경변수가 설정되지 않았습니다 (4자 이상).");
  }
  return safeEqual(input, expected);
}

export function createAdminToken(now = Date.now()): string {
  const exp = Math.floor(now / 1000) + MAX_AGE_SECONDS;
  const payload = String(exp);
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return false;

  const payload = token.slice(0, dot);
  const providedSig = token.slice(dot + 1);
  if (!safeEqual(providedSig, sign(payload))) return false;

  const exp = Number(payload);
  if (!Number.isFinite(exp)) return false;
  return exp * 1000 > Date.now();
}

/** 현재 요청이 관리자 세션인지 (서버 컴포넌트/라우트 전용) */
export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifyAdminToken(store.get(ADMIN_COOKIE)?.value);
}

export const adminCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE_SECONDS,
};
