import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { getStorage } from "@/lib/content/storage";

// Vercel 서버리스 함수의 요청 본문 하드 제한(4.5MB)보다 작게 잡는다.
// 클라이언트(ImageField)에서 업로드 전 이 이하로 압축하지만, 압축이
// 불가능한 브라우저를 대비해 서버에서도 동일 기준으로 다시 검증한다.
const MAX_BYTES = 4 * 1024 * 1024; // 4MB
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
      { error: "파일이 너무 큽니다 (최대 4MB)." },
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
