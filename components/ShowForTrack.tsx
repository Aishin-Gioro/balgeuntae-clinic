"use client";

import type { ReactNode } from "react";
import type { HeroTrackId } from "@/lib/site";
import { useHeroTrack } from "./HeroTrackContext";

/** 히어로에서 선택된 진료과목이 id와 일치할 때만 자식을 렌더링 */
export function ShowForTrack({ id, children }: { id: HeroTrackId; children: ReactNode }) {
  const { track } = useHeroTrack();
  if (track !== id) return null;
  return <>{children}</>;
}
