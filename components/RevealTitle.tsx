"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * 화면에 들어올 때 한 번 스르륵 나타나는(fade-in) h2. 사라지는 연출은 없다.
 * 숨김/등장 스타일은 사용하는 쪽 CSS 가 [data-reveal="pending"] / [data-reveal="shown"] 으로 정한다
 * — JS 가 돌기 전(또는 실패 시)에는 속성이 없어 제목이 그대로 보인다.
 * 이미 화면 안에 있거나 prefers-reduced-motion 이면 숨기지 않는다.
 */
export function RevealTitle({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    el.dataset.reveal = "pending";
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.dataset.reveal = "shown";
        io.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <h2 ref={ref} id={id} className={className}>
      {children}
    </h2>
  );
}
