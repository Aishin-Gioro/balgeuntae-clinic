"use client";

import { useState } from "react";
import type { HeroTrackId } from "@/lib/site";
import { useContent } from "./ContentProvider";
import { useHeroTrack } from "./HeroTrackContext";
import { useGateUnlocked } from "./GateProvider";
import { ChevronLeft, ChevronRight, KakaoIcon, LockIcon } from "./icons";
import styles from "./Treatment.module.css";

const TRACK_TO_TREATMENT_ID: Record<HeroTrackId, string> = {
  stomach: "track-a",
  diet: "track-b",
};

/** 전후 비교 사진 — 겹쳐두고 opacity 크로스페이드. 2장 이상이면 좌우 화살표 + 점 표시 */
function Gallery({ images, caption }: { images: string[]; caption: string }) {
  const [index, setIndex] = useState(0);
  const count = images.length;
  const many = count > 1;
  const go = (dir: -1 | 1) => setIndex((i) => (i + dir + count) % count);

  return (
    <div
      className={styles.gallery}
      role={many ? "region" : undefined}
      aria-roledescription={many ? "carousel" : undefined}
      aria-label={many ? caption || "전후 비교 사진" : undefined}
    >
      {count === 0 ? (
        <div className={`${styles.card} ${styles.cardActive}`} />
      ) : (
        images.map((src, i) => (
          <figure
            key={i}
            className={`${styles.card} ${i === index ? styles.cardActive : ""}`}
            style={{ backgroundImage: `url(${src})` }}
            aria-hidden={i !== index}
          />
        ))
      )}

      {caption && <span className={styles.caption}>{caption}</span>}

      {many && (
        <>
          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowPrev}`}
            onClick={() => go(-1)}
            aria-label="이전 사진"
          >
            <ChevronLeft className={styles.arrowIcon} />
          </button>
          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowNext}`}
            onClick={() => go(1)}
            aria-label="다음 사진"
          >
            <ChevronRight className={styles.arrowIcon} />
          </button>
          <span className={styles.counter} aria-live="polite">
            {index + 1} / {count}
          </span>
        </>
      )}
    </div>
  );
}

export function Treatment() {
  const { treatment, photoGate } = useContent();
  const { track } = useHeroTrack();
  const gateUnlocked = useGateUnlocked();
  if (!track) return null;

  const activeTrack = treatment.tracks.find((t) => t.id === TRACK_TO_TREATMENT_ID[track]);
  if (!activeTrack) return null;
  const showImage = activeTrack.showImage;

  return (
    <section id="treatment" className={styles.section} aria-labelledby="treatment-title">
      {/* 장식 곡선 — 얇고 살짝 불규칙한 2줄 */}
      <svg className={styles.decor} viewBox="0 0 1440 760" preserveAspectRatio="none" aria-hidden="true">
        <path
          vectorEffect="non-scaling-stroke"
          d="M-40 138C240 72 470 108 700 168C905 222 1080 146 1260 186C1360 208 1440 194 1490 174"
        />
        <path
          vectorEffect="non-scaling-stroke"
          style={{ opacity: 0.55 }}
          d="M-40 548C260 480 440 600 690 572C900 548 1050 632 1280 588C1370 571 1450 592 1500 582"
        />
      </svg>

      <div className={`${styles.inner} ${showImage ? "" : styles.innerSolo}`}>
        <div className={styles.text}>
          <p className={styles.kicker}>{treatment.kicker}</p>
          <h2 id="treatment-title" className={styles.title}>
            {treatment.title}
          </h2>

          <span className={styles.divider} aria-hidden="true" />

          <p className={styles.slideLabel}>{activeTrack.label}</p>
          <h3 className={styles.slideTitle}>{activeTrack.title}</h3>
          <p className={styles.slideDesc}>{activeTrack.desc}</p>
          <a className={styles.cta} href={activeTrack.href}>
            {activeTrack.cta}
          </a>
        </div>

        {showImage && (
          <div className={styles.media}>
            {gateUnlocked ? (
              <Gallery
                key={activeTrack.id}
                images={activeTrack.images.filter(Boolean)}
                caption={activeTrack.caption}
              />
            ) : (
              <div className={styles.cardLocked}>
                <div className={styles.cardLockedBlur} aria-hidden="true" />
                <div className={styles.cardLockedInner}>
                  <LockIcon className={styles.cardLockIcon} />
                  <p className={styles.cardLockedText}>{photoGate.cardLockedText}</p>
                  <a
                    className={styles.cardLoginBtn}
                    href={`/api/auth/kakao/login?returnTo=${encodeURIComponent(`/?track=${track}#treatment`)}`}
                  >
                    <KakaoIcon className={styles.cardKakaoIcon} />
                    {photoGate.loginLabel}
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
