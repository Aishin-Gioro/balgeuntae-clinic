"use client";

import { useState } from "react";
import { nav, site } from "@/lib/site";
import { BrandMark } from "./icons";
import styles from "./Header.module.css";

export function Header() {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <header
      className={[styles.header, navOpen ? styles.navOpen : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.inner}>
        <a className={styles.brand} href="#" aria-label={`${site.name} 홈`}>
          <BrandMark className={styles.brandMark} />
          <span className={styles.brandName}>{site.name}</span>
        </a>

        <nav className={styles.gnb} aria-label="주요 메뉴">
          <ul>
            {nav.map((item) => (
              <li key={item.href}>
                <a href={item.href} onClick={() => setNavOpen(false)}>
                  {item.label}
                </a>
              </li>
            ))}
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
