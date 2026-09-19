"use client";

import { useEffect, useRef, useState } from "react";
import { useContent } from "./ContentProvider";
import { useHeroTrack } from "./HeroTrackContext";
import { BrandMark, UnlockIcon } from "./icons";
import styles from "./Header.module.css";

/** 진료과목에 따라 "전후 사진" 메뉴가 가리키는 위치가 달라짐 (장상피화생 → 내시경, 다이어트 → 인바디) */
const RESULTS_PLACEHOLDER_HREF = "#results";

/** 히어로에서 진료과목을 아직 고르지 않았을 때 메뉴 클릭 시 기본으로 여는 트랙 */
const DEFAULT_TRACK = "stomach" as const;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function resolveResultsHref(track: string | null) {
  return track === "diet" ? "#track-b-proof" : "#track-a-proof";
}

export function Header({ gateUnlocked = false }: { gateUnlocked?: boolean }) {
  const [navOpen, setNavOpen] = useState(false);
  const { site, nav, photoGate } = useContent();
  const { track, setTrack } = useHeroTrack();

  /** 트랙을 방금 선택해서 섹션이 마운트되면 스크롤할 대상(#id) */
  const pendingHash = useRef<string | null>(null);

  useEffect(() => {
    if (!track || !pendingHash.current) return;
    const id = pendingHash.current;
    pendingHash.current = null;
    // 섹션이 실제로 DOM 에 붙고 레이아웃이 잡힌 뒤 스크롤
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.querySelector(id)?.scrollIntoView({
          behavior: prefersReducedMotion() ? "auto" : "smooth",
          block: "start",
        });
      });
    });
  }, [track]);

  function handleNavClick(
    e: React.MouseEvent<HTMLAnchorElement>,
    rawHref: string,
  ) {
    setNavOpen(false);
    if (!rawHref.startsWith("#")) return; // 외부 링크는 기본 동작

    const target =
      rawHref === RESULTS_PLACEHOLDER_HREF
        ? resolveResultsHref(track ?? DEFAULT_TRACK)
        : rawHref;

    if (!track) {
      // 아직 진료과목 미선택 → 섹션이 없으므로, 선택 후 스크롤 예약
      e.preventDefault();
      pendingHash.current = target;
      setTrack(DEFAULT_TRACK);
      return;
    }

    // 이미 섹션이 있으면 부드럽게 스크롤 (스크롤 오프셋은 CSS scroll-margin-top)
    const el = document.querySelector(target);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "start",
      });
    }
  }

  return (
    <header
      className={[styles.header, navOpen ? styles.navOpen : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.inner}>
        <a className={styles.brand} href="/" aria-label={`${site.name} 홈`}>
          <BrandMark className={styles.brandMark} />
          <span className={styles.brandName}>{site.name}</span>
        </a>

        <nav className={styles.gnb} aria-label="주요 메뉴">
          <ul>
            {nav.map((item) => {
              const href =
                item.href === RESULTS_PLACEHOLDER_HREF
                  ? resolveResultsHref(track)
                  : item.href;
              return (
                <li key={item.href}>
                  <a href={href} onClick={(e) => handleNavClick(e, item.href)}>
                    {item.label}
                  </a>
                </li>
              );
            })}
            {gateUnlocked && (
              <li className={styles.gateRow}>
                <a
                  className={styles.gateRowLink}
                  href="/api/auth/logout?returnTo=/"
                  onClick={() => setNavOpen(false)}
                >
                  <UnlockIcon className={styles.gateRowIcon} />
                  로그아웃
                </a>
              </li>
            )}
          </ul>
        </nav>

        {gateUnlocked && (
          <a
            className={styles.gate}
            href="/api/auth/logout?returnTo=/"
            aria-label={`로그아웃 (${photoGate.unlockedNote})`}
          >
            <UnlockIcon className={styles.gateIcon} />
            <span className={styles.gateText}>로그아웃</span>
          </a>
        )}

        <a
          className={styles.cta}
          href={site.links.kakao}
          target="_blank"
          rel="noopener"
        >
          문의하기
        </a>

        <button
          type="button"
          className={styles.toggle}
          aria-label={navOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={navOpen}
          onClick={() => setNavOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
