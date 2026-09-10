import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin/auth";

function handle(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/admin/login", req.nextUrl.origin));
  res.cookies.delete(ADMIN_COOKIE);
  return res;
}

export const GET = handle;
export const POST = handle;
