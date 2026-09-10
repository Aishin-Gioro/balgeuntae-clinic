/**
 * 콘텐츠 접근 진입점
 * ────────────────────────────────────────────────────────────
 * getContent()  — 화면 렌더링에 쓰는 "완성된" 콘텐츠 (기본값 + 저장된 수정본 병합)
 * saveContent() — 관리자 편집기가 저장할 때 호출
 *
 * 캐시: getContent 는 요청 단위로 React cache() 로 메모이즈하고,
 *       추가로 unstable_cache 로 태그("site-content") 캐시에 담는다.
 *       saveContent 후 revalidateTag("site-content") 로 갱신한다.
 */

import { cache } from "react";
import { unstable_cache, revalidateTag } from "next/cache";
import { defaultContent, type SiteContent } from "./schema";
import { getStorage } from "./storage";

export const CONTENT_TAG = "site-content";

export { defaultContent };
export * from "./schema";

type Json = Record<string, unknown>;

function isPlainObject(v: unknown): v is Json {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** base(기본값) 위에 patch(저장본)를 깊은 병합. 배열은 통째로 교체. */
export function deepMerge<T>(base: T, patch: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(patch)) {
    return (patch === undefined ? base : (patch as T));
  }
  const out: Json = { ...base };
  for (const key of Object.keys(patch)) {
    const b = (base as Json)[key];
    const p = patch[key];
    if (p === undefined) continue;
    out[key] = isPlainObject(b) && isPlainObject(p) ? deepMerge(b, p) : p;
  }
  return out as T;
}

async function loadMerged(): Promise<SiteContent> {
  let stored: unknown = null;
  try {
    stored = await getStorage().readContent();
  } catch (err) {
    console.error("[content] 저장된 콘텐츠를 읽지 못했습니다. 기본값 사용:", err);
  }
  return stored ? deepMerge(defaultContent, stored) : defaultContent;
}

const loadCached = unstable_cache(loadMerged, [CONTENT_TAG], {
  tags: [CONTENT_TAG],
  // 저장 시 revalidateTag 로 즉시 갱신하지만, 만일을 대비한 안전장치로 5분 TTL.
  revalidate: 300,
});

/** 서버 컴포넌트/라우트에서 콘텐츠를 읽는다. */
export const getContent = cache(async (): Promise<SiteContent> => {
  return loadCached();
});

/** 관리자 편집기 저장 처리. 저장 후 캐시 무효화. */
export async function saveContent(next: SiteContent): Promise<void> {
  await getStorage().writeContent(next);
  revalidateTag(CONTENT_TAG);
}
