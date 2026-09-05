"use client";

import { useState } from "react";
import { nav, site } from "@/lib/site";
import { useHeroTrack } from "./HeroTrackContext";
import { BrandMark } from "./icons";
import styles from "./Header.module.css";

/** 진료과목에 따라 "전후 사진" 메뉴가 가리키는 위치가 달라짐 (장상피화생 → 내시경, 다이어트 → 인바디) */
const RESULTS_PLACEHOLDER_HREF = "#results";

export function Header() {
  const [navOpen, setNavOpen] = useState(false);
  const { track } = useHeroTrack();
  const resultsHref = track === "diet" ? "#track-b-proof" : "#track-a-proof";

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
              const href = item.href === RESULTS_PLACEHOLDER_HREF ? resultsHref : item.href;
              return (
                <li key={item.href}>
                  <a href={href} onClick={() => setNavOpen(false)}>
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

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
