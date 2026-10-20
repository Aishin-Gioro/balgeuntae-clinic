"use client";

import { useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { HeroTrackId } from "@/lib/site";

const TRACK_IDS: readonly HeroTrackId[] = ["stomach", "diet"];

function isHeroTrackId(value: string | null): value is HeroTrackId {
  return value !== null && (TRACK_IDS as readonly string[]).includes(value);
}

/** 히어로에서 선택한 진료과목을 ?track= 쿼리 파라미터로 관리 — 새로고침·뒤로가기에도 선택이 유지됨 */
export function useHeroTrack() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const raw = searchParams.get("track");
  const track: HeroTrackId | null = isHeroTrackId(raw) ? raw : null;

  const setTrack = useCallback(
    (next: HeroTrackId | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next) {
        params.set("track", next);
      } else {
        params.delete("track");
      }
      const query = params.toString();
      // router.push 는 서버에 페이지(RSC)를 다시 요청해 응답이 올 때까지 화면이 멈춘다.
      // 진료과목별 내용은 이미 모두 렌더링돼 있으므로 주소만 바꾼다 — Next.js 가
      // history.pushState 를 감지해 useSearchParams 를 즉시 갱신하고, 뒤로가기도 유지된다.
      window.history.pushState(null, "", `${query ? `${pathname}?${query}` : pathname}${window.location.hash}`);
    },
    [pathname, searchParams],
  );

  return { track, setTrack };
}
