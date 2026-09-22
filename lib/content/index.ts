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

/**
 * 로그인 게이트(전후 사진)로 보호되는 필드를 비운 콘텐츠를 반환한다.
 *
 * `<ContentProvider>`는 클라이언트 컴포넌트라서, 여기에 넘기는 값은 로그인
 * 여부와 무관하게 페이지의 RSC 페이로드에 그대로 직렬화되어 담긴다. 전후
 * 사진처럼 의료법상 비로그인 방문자에게 절대 노출되면 안 되는 값은 반드시
 * 이 함수로 걸러낸 뒤 ContentProvider 에 전달해야 한다.
 * (실제 화면에 쓰이는 값은 ProofGate 가 서버에서 별도로 isGateUnlocked() 를
 * 확인해 직접 렌더링하므로 이 함수와 무관하게 정상 동작한다.)
 *
 * 후기(reviews.items)는 여기서 걸러내지 않는다 — 비로그인 방문자에게도
 * 실제 사진·글이 화면에 표시되고, CSS 블러로만 가려지는 의도된 동작이다
 * (components/Reviews.tsx 참고).
 */
export function redactGatedContent(content: SiteContent): SiteContent {
  return {
    ...content,
    trackA: { ...content.trackA, proof: { ...content.trackA.proof, photo: "" } },
    trackB: { ...content.trackB, proof: { ...content.trackB.proof, photo: "" } },
  };
}
