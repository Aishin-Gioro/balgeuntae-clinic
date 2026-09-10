import { NextResponse, type NextRequest } from "next/server";
import { GATE_COOKIE, safeReturnPath } from "@/lib/auth";

/** 게이트 쿠키를 지운다. 링크(GET)/폼(POST) 모두 허용. */
function handle(req: NextRequest) {
  const returnTo = safeReturnPath(req.nextUrl.searchParams.get("returnTo"));
  const res = NextResponse.redirect(new URL(returnTo, req.nextUrl.origin));
  res.cookies.delete(GATE_COOKIE);
  return res;
}

export const GET = handle;
export const POST = handle;
