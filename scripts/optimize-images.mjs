/**
 * 이미지 최적화 — image-src/ 의 원본을 public/images/*.webp 로 변환
 * 사용: npm run optimize:images
 *
 * - 가로 최대 1920px (확대 안 함)
 * - WebP 품질 80
 * - image-src/ 는 gitignore (로컬 원본 보관용)
 */
import sharp from "sharp";
import { readdir, stat, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(fileURLToPath(import.meta.url), "../..");
const SRC_DIR = path.join(ROOT, "image-src");
const OUT_DIR = path.join(ROOT, "public/images");
const MAX_WIDTH = 1920;
const QUALITY = 80;

const fmtKB = (n) => (n / 1024).toFixed(0) + " KB";

let srcFiles;
try {
  srcFiles = (await readdir(SRC_DIR)).filter((f) => /\.(png|jpe?g)$/i.test(f));
} catch {
  console.error(`image-src/ 폴더가 없습니다. 원본 이미지를 ${SRC_DIR} 에 넣어주세요.`);
  process.exit(1);
}
if (srcFiles.length === 0) {
  console.log("image-src/ 에 변환할 이미지가 없습니다.");
  process.exit(0);
}

await mkdir(OUT_DIR, { recursive: true });

let before = 0;
let after = 0;
for (const file of srcFiles) {
  const src = path.join(SRC_DIR, file);
  const outName = file.replace(/\.(png|jpe?g)$/i, ".webp");
  const out = path.join(OUT_DIR, outName);
  const { size: origSize } = await stat(src);

  const img = sharp(src).rotate();
  const meta = await img.metadata();
  if (meta.width > MAX_WIDTH) img.resize({ width: MAX_WIDTH });
  await img.webp({ quality: QUALITY, effort: 6 }).toFile(out);

  const { size: newSize } = await stat(out);
  before += origSize;
  after += newSize;
  console.log(
    `${file.padEnd(20)} ${fmtKB(origSize).padStart(9)}  ->  ${outName.padEnd(21)} ${fmtKB(newSize).padStart(9)}`,
  );
}
console.log("-".repeat(64));
console.log(
  `TOTAL  ${fmtKB(before)}  ->  ${fmtKB(after)}  (${(100 - (after / before) * 100).toFixed(1)}% 감소)`,
);
