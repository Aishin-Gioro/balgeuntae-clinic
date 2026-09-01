"use client";

import { site } from "@/lib/site";
import {
  BlogIcon,
  ChatIcon,
  ChevronUp,
  InstagramIcon,
  KakaoIcon,
  YoutubeIcon,
} from "./icons";
import styles from "./UtilBar.module.css";

export function UtilBar() {
  const scrollTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <aside className={styles.bar} aria-label="빠른 상담">
      <a
        className={`${styles.item} ${styles.kakao}`}
        href={site.links.kakao}
        target="_blank"
        rel="noopener"
      >
        <KakaoIcon className={styles.icon} />
        <span>카톡상담</span>
      </a>
      <a className={styles.item} href={site.links.youtube} target="_blank" rel="noopener">
        <YoutubeIcon className={styles.icon} />
        <span>유튜브</span>
      </a>
      <a className={styles.item} href={site.links.consult} target="_blank" rel="noopener">
        <ChatIcon className={styles.icon} />
        <span>온라인상담</span>
      </a>
      <a className={styles.item} href={site.links.blog} target="_blank" rel="noopener">
        <BlogIcon className={styles.icon} />
        <span>블로그</span>
      </a>
      <a className={styles.item} href={site.links.instagram} target="_blank" rel="noopener">
        <InstagramIcon className={styles.icon} />
        <span>인스타그램</span>
      </a>

      <div className={styles.tel}>
        <span className={styles.telLabel}>전화상담</span>
        <a href={site.phoneHref}>
          010-9813
          <br />
          -0125
        </a>
      </div>

      <button type="button" className={styles.top} aria-label="맨 위로" onClick={scrollTop}>
        <ChevronUp className={styles.topIcon} />
      </button>
    </aside>
  );
}
