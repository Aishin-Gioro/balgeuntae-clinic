"use client";

import { createContext, useContext, type ReactNode } from "react";

/**
 * 전후 사진 열람 권한(카카오 인증 세션)을 클라이언트 컴포넌트에서 읽기 위한 컨텍스트.
 * 값은 서버에서 `isGateUnlocked()`로 계산해 주입한다. (page.tsx)
 */
const GateContext = createContext(false);

export function GateProvider({
  unlocked,
  children,
}: {
  unlocked: boolean;
  children: ReactNode;
}) {
  return <GateContext.Provider value={unlocked}>{children}</GateContext.Provider>;
}

export function useGateUnlocked() {
  return useContext(GateContext);
}
