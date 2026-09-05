"use client";

import { treatment, type HeroTrackId } from "@/lib/site";
import { useHeroTrack } from "./HeroTrackContext";
import styles from "./Treatment.module.css";

const TRACK_TO_TREATMENT_ID: Record<HeroTrackId, string> = {
  stomach: "track-a",
  diet: "track-b",
};

export function Treatment() {
  const { track } = useHeroTrack();
  if (!track) return null;

  const activeTrack = treatment.tracks.find((t) => t.id === TRACK_TO_TREATMENT_ID[track]);
  if (!activeTrack) return null;

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

      <div className={styles.inner}>
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

        <div className={styles.media}>
          <figure
            className={`${styles.card} ${styles.cardActive}`}
            style={{ backgroundImage: `url(${activeTrack.image})` }}
          >
            <figcaption className={styles.caption}>{activeTrack.caption}</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
