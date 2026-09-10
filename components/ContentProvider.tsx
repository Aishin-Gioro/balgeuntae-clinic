"use client";

import { createContext, useContext, type ReactNode } from "react";
import { telHref } from "@/lib/site";
import type { SiteContent } from "@/lib/content/schema";

/**
 * 서버에서 읽은 사이트 콘텐츠를 클라이언트 컴포넌트로 전달하는 컨텍스트.
 * page.tsx / layout 에서 <ContentProvider value={content}> 로 감싼다.
 */
const ContentContext = createContext<SiteContent | null>(null);

export function ContentProvider({
  value,
  children,
}: {
  value: SiteContent;
  children: ReactNode;
}) {
  return (
    <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
  );
}

export function useContent(): SiteContent {
  const ctx = useContext(ContentContext);
  if (!ctx) {
    throw new Error("useContent 는 <ContentProvider> 안에서만 사용할 수 있습니다.");
  }
  return ctx;
}

/** site.phone 에서 파생되는 tel: 링크 */
export function usePhoneHref(): string {
  return telHref(useContent().site.phone);
}
