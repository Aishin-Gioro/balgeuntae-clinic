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
import { YOUTUBE_CHANNEL, defaultContent, type SiteContent } from "./schema";
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

function replaceYoutubeSearch(value: unknown): unknown {
  if (typeof value === "string") {
    return /^https?:\/\/(www\.)?youtube\.com\/results\b/.test(value) ? YOUTUBE_CHANNEL : value;
  }
  if (Array.isArray(value)) return value.map(replaceYoutubeSearch);
  if (isPlainObject(value)) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, replaceYoutubeSearch(v)]));
  }
  return value;
}

/**
 * 옛 저장본 형식을 현재 스키마로 옮긴다.
 * - reviews.items(진료과목 공통 후기 1개 목록) → reviews.itemsByTrack.{stomach, diet}
 *   기존 후기는 양쪽에 똑같이 복사해 두고, 원장님이 관리자에서 정리한다.
 * - treatment.tracks[].image(사진 1장) → images(여러 장), showImage 없으면 true
 *   (배열은 deepMerge 에서 통째로 교체되므로 항목 안의 새 필드는 여기서 채워야 한다)
 * - 예전 기본값이던 유튜브 "검색 결과" 링크 → 채널 주소 (원장 소개·유틸바 등 위치 무관)
 */
export function migrateStored(stored: unknown): unknown {
  if (!isPlainObject(stored)) return stored;
  let out = replaceYoutubeSearch(stored) as Json;

  if (isPlainObject(out.reviews)) {
    const { items, ...reviews } = out.reviews;
    if (Array.isArray(items)) {
      if (!isPlainObject(reviews.itemsByTrack)) {
        reviews.itemsByTrack = { stomach: items, diet: items };
      }
      out = { ...out, reviews };
    }
  }

  if (isPlainObject(out.treatment) && Array.isArray(out.treatment.tracks)) {
    const tracks = out.treatment.tracks.map((t: unknown) => {
      if (!isPlainObject(t)) return t;
      const { image, ...rest } = t;
      if (!Array.isArray(rest.images)) {
        rest.images = typeof image === "string" && image ? [image] : [];
      }
      if (typeof rest.showImage !== "boolean") rest.showImage = true;
      return rest;
    });
    out = { ...out, treatment: { ...out.treatment, tracks } };
  }

  return out;
}

/**
 * 저장본을 읽어 기본값과 병합한다. 읽기 오류는 일부러 던진다 — unstable_cache 는 던진 결과를
 * 캐시하지 않으므로, 일시 오류로 기본 문구가 5분간 캐시에 박히는 일을 막는다.
 * (오류 시 기본값으로 대체하는 것은 getContent 에서 한다.)
 */
async function loadMerged(): Promise<SiteContent> {
  const stored = await getStorage().readContent();
  return stored ? deepMerge(defaultContent, migrateStored(stored)) : defaultContent;
}

const loadCached = unstable_cache(loadMerged, [CONTENT_TAG], {
  tags: [CONTENT_TAG],
  // 저장 시 revalidateTag 로 즉시 갱신하지만, 만일을 대비한 안전장치로 5분 TTL.
  revalidate: 300,
});

/** 서버 컴포넌트/라우트에서 콘텐츠를 읽는다. */
export const getContent = cache(async (): Promise<SiteContent> => {
  try {
    // 캐시에 남아 있는 옛 병합본에는 새로 추가한 필드가 없을 수 있어(스키마 변경 직후),
    // 꺼낸 뒤 기본값을 한 번 더 깔아 준다.
    return deepMerge(defaultContent, migrateStored(await loadCached()));
  } catch (err) {
    // 저장본을 못 읽는 일시 오류 — 이 결과는 캐시되지 않으므로 다음 요청에서 다시 시도한다.
    console.error("[content] 저장된 콘텐츠를 읽지 못했습니다. 기본값 사용:", err);
    return defaultContent;
  }
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
 * 후기(reviews.itemsByTrack)는 여기서 걸러내지 않는다 — 비로그인 방문자에게도
 * 실제 사진·글이 화면에 표시되고, CSS 블러로만 가려지는 의도된 동작이다
 * (components/Reviews.tsx 참고).
 */
export function redactGatedContent(content: SiteContent): SiteContent {
  return {
    ...content,
    treatment: {
      ...content.treatment,
      tracks: content.treatment.tracks.map((t) => ({ ...t, images: [] })),
    },
    trackA: { ...content.trackA, proof: { ...content.trackA.proof, photo: "" } },
    trackB: { ...content.trackB, proof: { ...content.trackB.proof, photo: "" } },
  };
}
