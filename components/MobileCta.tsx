"use client";

import { useContent, usePhoneHref } from "./ContentProvider";
import { KakaoIcon, PhoneIcon } from "./icons";
import styles from "./MobileCta.module.css";

/** 모바일 전용 하단 고정 상담 바 (데스크톱 세로 유틸바 대체) */
export function MobileCta() {
  const { site } = useContent();
  const phoneHref = usePhoneHref();

  return (
    <nav className={styles.cta} aria-label="빠른 상담">
      <a
        className={`${styles.item} ${styles.kakao}`}
        href={site.links.kakao}
        target="_blank"
        rel="noopener"
      >
        <KakaoIcon className={styles.icon} />
        <span>카카오톡 상담</span>
      </a>
      <a className={styles.item} href={phoneHref}>
        <PhoneIcon className={styles.icon} />
        <span>전화상담</span>
      </a>
    </nav>
  );
}
