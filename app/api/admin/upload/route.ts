import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { getStorage } from "@/lib/content/storage";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "파일 업로드 형식이 아닙니다." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "이미지 파일만 업로드할 수 있습니다 (jpg, png, webp, gif, avif)." },
      { status: 415 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "파일이 너무 큽니다 (최대 8MB)." },
      { status: 413 },
    );
  }

  try {
    const data = Buffer.from(await file.arrayBuffer());
    const url = await getStorage().uploadImage({
      filename: file.name || "image",
      contentType: file.type,
      data,
    });
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[admin] 이미지 업로드 실패:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "업로드에 실패했습니다." },
      { status: 500 },
    );
  }
}
