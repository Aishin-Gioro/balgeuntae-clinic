"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { HeroTrackId } from "@/lib/site";

const TRACK_IDS: readonly HeroTrackId[] = ["stomach", "diet"];

function isHeroTrackId(value: string | null): value is HeroTrackId {
  return value !== null && (TRACK_IDS as readonly string[]).includes(value);
}

/** 히어로에서 선택한 진료과목을 ?track= 쿼리 파라미터로 관리 — 새로고침·뒤로가기에도 선택이 유지됨 */
export function useHeroTrack() {
  const router = useRouter();
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
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return { track, setTrack };
}
