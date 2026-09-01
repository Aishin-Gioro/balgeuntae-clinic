"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AUTOPLAY_MS, heroSlides } from "@/lib/site";
import { ChatIcon, ChevronLeft, ChevronRight } from "./icons";
import styles from "./Hero.module.css";

const COUNT = heroSlides.length;

export function Hero() {
  const [index, setIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchX = useRef<number | null>(null);
  const reduceMotion = useRef(false);

  const stop = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (timer.current || reduceMotion.current || COUNT < 2) return;
    timer.current = setInterval(() => {
      setIndex((i) => (i + 1) % COUNT);
    }, AUTOPLAY_MS);
  }, []);

  // 수동 조작: 이동 + 타이머 리셋
  const move = useCallback(
    (next: number) => {
      setIndex(((next % COUNT) + COUNT) % COUNT);
      stop();
      start();
    },
    [start, stop],
  );

  useEffect(() => {
    reduceMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    start();

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [start, stop]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") move(index - 1);
    else if (e.key === "ArrowRight") move(index + 1);
  };

  return (
    <section
      className={styles.hero}
      aria-roledescription="캐러셀"
      aria-label="주요 진료 안내"
      onMouseEnter={stop}
      onMouseLeave={start}
      onFocus={stop}
      onBlur={start}
      onKeyDown={onKeyDown}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) move(index + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
    >
      <div className={styles.slides}>
        {/* 모든 슬라이드를 겹쳐두고 opacity 로 크로스페이드 — 활성 슬라이드에서만 Ken Burns / fadeUp 재생 */}
        {heroSlides.map((slide, i) => {
          const active = i === index;
          return (
            <article
              key={slide.id}
              className={`${styles.slide} ${active ? styles.slideActive : ""}`}
              aria-roledescription="슬라이드"
              aria-label={`${i + 1} / ${COUNT} · ${slide.label}`}
              aria-hidden={!active}
            >
              <div
                className={`${styles.bg} ${slide.blur ? styles.bgBlur : ""}`}
                style={{ backgroundImage: `url(${slide.image}), ${slide.gradient}` }}
              />
              <div className={`${styles.scrim} ${slide.blur ? styles.scrimStrong : ""}`} />
              <div className={styles.copy}>
                <h2 className={styles.title}>{slide.title}</h2>
                <p className={styles.sub}>
                  {slide.subtitle.map((line, li) => (
                    <span key={li}>
                      {line}
                      {li < slide.subtitle.length - 1 && <br />}
                    </span>
                  ))}
                </p>
                {slide.cta && (
                  <a className={styles.cta} href={slide.cta.href} tabIndex={active ? 0 : -1}>
                    <ChatIcon className={styles.ctaIcon} />
                    {slide.cta.label}
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <button
        type="button"
        className={`${styles.arrow} ${styles.arrowPrev}`}
        aria-label="이전 슬라이드"
        onClick={() => move(index - 1)}
      >
        <ChevronLeft className={styles.arrowIcon} />
      </button>
      <button
        type="button"
        className={`${styles.arrow} ${styles.arrowNext}`}
        aria-label="다음 슬라이드"
        onClick={() => move(index + 1)}
      >
        <ChevronRight className={styles.arrowIcon} />
      </button>

      <div className={styles.dots} role="tablist" aria-label="슬라이드 선택">
        {heroSlides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-label={`${i + 1}번 슬라이드`}
            aria-selected={i === index}
            className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
            onClick={() => move(i)}
          />
        ))}
      </div>
    </section>
  );
}
