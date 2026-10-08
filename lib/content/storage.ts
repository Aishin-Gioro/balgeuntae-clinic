/**
 * 콘텐츠 저장소 드라이버
 * ────────────────────────────────────────────────────────────
 * - Vercel 배포 환경(BLOB_READ_WRITE_TOKEN 존재): Vercel Blob 사용
 * - 그 외(로컬 개발): 프로젝트 루트 `.data/` 폴더 + `public/uploads/` 사용
 *
 * 저장 단위는 JSON 파일 1개(content.json)와 업로드 이미지들.
 */

import { promises as fs } from "node:fs";
import path from "node:path";

const CONTENT_KEY = "content.json";

export type ImageUpload = {
  /** 원본 파일명 (확장자 추출용) */
  filename: string;
  contentType: string;
  data: Buffer;
};

export interface ContentStorage {
  /** 저장된 수정본(부분 JSON)을 반환. 없으면 null */
  readContent(): Promise<unknown | null>;
  /** 수정본 전체를 저장 */
  writeContent(value: unknown): Promise<void>;
  /** 이미지를 저장하고 공개 URL(또는 사이트 내 경로)을 반환 */
  uploadImage(file: ImageUpload): Promise<string>;
}

function useBlob(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/* ── Vercel Blob 드라이버 ─────────────────────────────────── */

/**
 * content.json 원문을 읽는다. 없으면 null, 그 밖의 오류는 던진다.
 *
 * 목록(list) 조회 결과의 갱신 시점이나 Blob CDN 캐시(같은 경로로 덮어써도 최소 60초
 * 옛 파일을 줄 수 있음)에 기대지 않도록, 파일 이름으로 주소만 구하고(head) 내용은
 * 매번 다른 쿼리를 붙여 CDN 캐시를 건너뛴 채 읽는다.
 */
async function readBlobText(): Promise<string | null> {
  const { head, BlobNotFoundError } = await import("@vercel/blob");
  let url: string;
  try {
    url = (await head(CONTENT_KEY)).url;
  } catch (err) {
    if (err instanceof BlobNotFoundError) return null;
    throw err;
  }
  const res = await fetch(`${url}?t=${Date.now()}`, {
    cache: "no-store",
    headers: { "cache-control": "no-cache" },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`content.json 읽기 실패 (${res.status})`);
  return res.text();
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const blobStorage: ContentStorage = {
  async readContent() {
    const text = await readBlobText();
    return text === null ? null : (JSON.parse(text) as unknown);
  },

  async writeContent(value) {
    const { put } = await import("@vercel/blob");
    const body = JSON.stringify(value, null, 2);
    await put(CONTENT_KEY, body, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 0,
    });

    // 저장 직후에는 읽기 경로가 잠깐 옛 파일을 줄 수 있다. 이때 캐시를 비우면 관리자 화면의
    // 새로고침이 옛 내용을 읽어 5분간 캐시에 박아 버리므로, 방금 쓴 내용이 실제로 읽힐
    // 때까지 확인한 뒤(최대 약 6초) 반환한다. 확인에 실패해도 저장 자체는 성공이다.
    for (let i = 0; i < 12; i++) {
      try {
        if ((await readBlobText()) === body) return;
      } catch {
        /* 일시 오류는 다음 시도에서 재확인 */
      }
      await sleep(500);
    }
  },

  async uploadImage(file) {
    const { put } = await import("@vercel/blob");
    const ext = extOf(file.filename, file.contentType);
    const key = `uploads/${Date.now()}-${randomSlug()}${ext}`;
    const { url } = await put(key, file.data, {
      access: "public",
      contentType: file.contentType,
      addRandomSuffix: false,
    });
    return url;
  },
};

/* ── 로컬 파일 드라이버 ───────────────────────────────────── */

const DATA_DIR = path.join(process.cwd(), ".data");
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const fsStorage: ContentStorage = {
  async readContent() {
    try {
      const raw = await fs.readFile(path.join(DATA_DIR, CONTENT_KEY), "utf8");
      return JSON.parse(raw) as unknown;
    } catch {
      return null;
    }
  },

  async writeContent(value) {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(
      path.join(DATA_DIR, CONTENT_KEY),
      JSON.stringify(value, null, 2),
      "utf8",
    );
  },

  async uploadImage(file) {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const ext = extOf(file.filename, file.contentType);
    const name = `${Date.now()}-${randomSlug()}${ext}`;
    await fs.writeFile(path.join(UPLOAD_DIR, name), file.data);
    return `/uploads/${name}`;
  },
};

/* ── 공통 유틸 ────────────────────────────────────────────── */

function randomSlug(): string {
  return Math.random().toString(36).slice(2, 8);
}

function extOf(filename: string, contentType: string): string {
  const fromName = path.extname(filename).toLowerCase();
  if (fromName) return fromName;
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/avif": ".avif",
  };
  return map[contentType] ?? "";
}

export function getStorage(): ContentStorage {
  return useBlob() ? blobStorage : fsStorage;
}
