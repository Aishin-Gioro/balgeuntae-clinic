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

const blobStorage: ContentStorage = {
  async readContent() {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: CONTENT_KEY, limit: 1 });
    const hit = blobs.find((b) => b.pathname === CONTENT_KEY);
    if (!hit) return null;
    const res = await fetch(hit.url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as unknown;
  },

  async writeContent(value) {
    const { put } = await import("@vercel/blob");
    await put(CONTENT_KEY, JSON.stringify(value, null, 2), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 0,
    });
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
