import { NextResponse, type NextRequest } from "next/server";
import {
  GATE_COOKIE,
  OAUTH_STATE_COOKIE,
  createGateToken,
  gateCookieOptions,
  safeReturnPath,
} from "@/lib/auth";

/**
 * 카카오 콜백.
 * ─ code를 토큰으로 교환해 "인증됨"만 확인하고, 사용자 정보는 조회/저장하지 않는다.
 * ─ 성공 시 게이트 쿠키를 심고 원래 보던 위치(#results 등)로 복귀시킨다.
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const origin = req.nextUrl.origin;

  const denied = params.get("error");
  if (denied) {
    return NextResponse.redirect(new URL("/?gate=cancelled", origin));
  }

  const code = params.get("code");
  const state = params.get("state") ?? "";
  const [nonce, ...rest] = state.split(":");
  const returnTo = safeReturnPath(rest.join(":"));

  const expectedNonce = req.cookies.get(OAUTH_STATE_COOKIE)?.value;
  if (!code || !nonce || !expectedNonce || nonce !== expectedNonce) {
    return NextResponse.redirect(new URL("/?gate=error", origin));
  }

  const clientId = process.env.KAKAO_REST_API_KEY;
  const redirectUri = process.env.KAKAO_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return NextResponse.redirect(new URL("/?gate=error", origin));
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
    return NextResponse.redirect(new URL("/?gate=error", origin));
  }

  const res = NextResponse.redirect(new URL(`${returnTo}`, origin));
  res.cookies.set(GATE_COOKIE, createGateToken(), gateCookieOptions);
  res.cookies.delete(OAUTH_STATE_COOKIE);
  return res;
}
