import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { OAUTH_STATE_COOKIE, safeReturnPath } from "@/lib/auth";

/** 카카오 인가 페이지로 리다이렉트한다. 프로필 scope는 요구하지 않는다. */
export function GET(req: NextRequest) {
  const clientId = process.env.KAKAO_REST_API_KEY;
  const redirectUri = process.env.KAKAO_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "카카오 로그인 환경변수(KAKAO_REST_API_KEY, KAKAO_REDIRECT_URI)가 설정되지 않았습니다." },
      { status: 500 },
    );
  }

  const returnTo = safeReturnPath(req.nextUrl.searchParams.get("returnTo"));
  const nonce = randomBytes(16).toString("base64url");
  const state = `${nonce}:${returnTo}`;

  const authUrl = new URL("https://kauth.kakao.com/oauth/authorize");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("state", state);

  const res = NextResponse.redirect(authUrl);
  res.cookies.set(OAUTH_STATE_COOKIE, nonce, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10, // 10분
  });
  return res;
}
