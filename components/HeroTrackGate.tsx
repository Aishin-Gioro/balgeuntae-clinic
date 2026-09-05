"use client";

import type { ReactNode } from "react";
import { useHeroTrack } from "./HeroTrackContext";

/** 히어로에서 진료과목을 선택하기 전에는 하위 섹션을 렌더링하지 않음 */
export function HeroTrackGate({ children }: { children: ReactNode }) {
  const { track } = useHeroTrack();
  if (!track) return null;
  return <>{children}</>;
}
