import { NextResponse, type NextRequest } from "next/server";
import {
  GATE_COOKIE,
  OAUTH_STATE_COOKIE,
  createGateToken,
  gateCookieOptions,
  safeReturnPath,
} from "@/lib/auth";
import { LOGIN_COMPLETE_COOKIE } from "@/lib/analytics";

/**
 * 카카오 콜백.
 * ─ code를 토큰으로 교환해 "인증됨"만 확인하고, 사용자 정보는 조회/저장하지 않는다.
 * ─ 성공 시 게이트 쿠키를 심고 원래 보던 위치(#results 등)로 복귀시킨다.
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const origin = req.nextUrl.origin;

  const code = params.get("code");
  const state = params.get("state") ?? "";
  const [nonce, ...rest] = state.split(":");
  const returnTo = safeReturnPath(rest.join(":"));

  // 실패해도 원래 주소(진료과목·utm_* 포함)로 돌려보낸다 — 유입 경로 유지
  const fail = (reason: "cancelled" | "error") => {
    const url = new URL(returnTo, origin);
    url.searchParams.set("gate", reason);
    return NextResponse.redirect(url);
  };

  if (params.get("error")) return fail("cancelled");

  const expectedNonce = req.cookies.get(OAUTH_STATE_COOKIE)?.value;
  if (!code || !nonce || !expectedNonce || nonce !== expectedNonce) {
    return fail("error");
  }

  const clientId = process.env.KAKAO_REST_API_KEY;
  const redirectUri = process.env.KAKAO_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return fail("error");
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    redirect_uri: redirectUri,
    code,
  });
  if (process.env.KAKAO_CLIENT_SECRET) {
    body.set("client_secret", process.env.KAKAO_CLIENT_SECRET);
  }

  let ok = false;
  try {
    const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
      body,
      cache: "no-store",
    });
    ok = tokenRes.ok && typeof (await tokenRes.json()).access_token === "string";
  } catch {
    ok = false;
  }

  if (!ok) {
    return fail("error");
  }

  const res = NextResponse.redirect(new URL(`${returnTo}`, origin));
  res.cookies.set(GATE_COOKIE, createGateToken(), gateCookieOptions);
  res.cookies.delete(OAUTH_STATE_COOKIE);
  // 분석용 1회 표시 — 클라이언트(Analytics)가 읽어 login_complete 를 보내고 지운다. 계정 정보는 담지 않는다.
  res.cookies.set(LOGIN_COMPLETE_COOKIE, "kakao", { path: "/", maxAge: 60, sameSite: "lax" });
  return res;
}
