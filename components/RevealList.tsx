"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/**
 * 자식 <li> 가 화면에 들어올 때마다 data-revealed 를 붙여 순서대로 떠오르게 하는 <ol>.
 * 숨김/등장 스타일은 사용하는 쪽 CSS 가 [data-reveal-ready] / [data-revealed] 로 정한다
 * — JS 가 돌기 전(또는 실패 시)에는 data-reveal-ready 가 없어 항목이 그대로 보인다.
 * 한 번에 여러 개가 들어오면 120ms 간격으로 차례차례 등장시킨다.
 */
export function RevealList({
  className,
  style,
  children,
}: {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const ref = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const list = ref.current;
    if (!list || typeof IntersectionObserver === "undefined") return;

    const items = Array.from(list.children) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        entries
          .filter((e) => e.isIntersecting)
          .forEach((e, i) => {
            const el = e.target as HTMLElement;
            el.style.transitionDelay = `${i * 120}ms`;
            el.dataset.revealed = "";
            observer.unobserve(el);
          });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 },
    );

    items.forEach((el) => observer.observe(el));
    list.dataset.revealReady = "";
    return () => observer.disconnect();
  }, []);

  return (
    <ol ref={ref} className={className} style={style}>
      {children}
    </ol>
  );
}
