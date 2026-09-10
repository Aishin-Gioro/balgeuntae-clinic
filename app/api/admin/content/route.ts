import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { defaultContent, deepMerge, getContent, saveContent } from "@/lib/content";
import type { SiteContent } from "@/lib/content/schema";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });
  }
  return NextResponse.json(await getContent());
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 JSON 입니다." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "콘텐츠 형식이 올바르지 않습니다." }, { status: 400 });
  }

  // 기본값 위에 병합해 스키마 모양을 보장한 뒤 저장
  const merged = deepMerge<SiteContent>(defaultContent, body);

  try {
    await saveContent(merged);
  } catch (err) {
    console.error("[admin] 콘텐츠 저장 실패:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "저장에 실패했습니다." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
