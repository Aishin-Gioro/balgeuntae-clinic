"use client";

import { useState } from "react";
import { treatment } from "@/lib/site";
import { ChevronLeft, ChevronRight } from "./icons";
import styles from "./Treatment.module.css";

const COUNT = treatment.tracks.length;

export function Treatment() {
  const [index, setIndex] = useState(0);
  const move = (next: number) => setIndex(((next % COUNT) + COUNT) % COUNT);

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

          <div className={styles.nav}>
            <button
              type="button"
              className={styles.arrow}
              aria-label="이전 진료과목"
              onClick={() => move(index - 1)}
            >
              <ChevronLeft className={styles.arrowIcon} />
            </button>
            <button
              type="button"
              className={styles.arrow}
              aria-label="다음 진료과목"
              onClick={() => move(index + 1)}
            >
              <ChevronRight className={styles.arrowIcon} />
            </button>
          </div>

          <span className={styles.divider} aria-hidden="true" />

          <div className={styles.slides}>
            {treatment.tracks.map((track, i) => (
              <div
                key={track.id}
                className={`${styles.slide} ${i === index ? styles.slideActive : ""}`}
                aria-hidden={i !== index}
              >
                <p className={styles.slideLabel}>{track.label}</p>
                <h3 className={styles.slideTitle}>{track.title}</h3>
                <p className={styles.slideDesc}>{track.desc}</p>
                <a
                  className={styles.cta}
                  href={track.href}
                  tabIndex={i === index ? 0 : -1}
                >
                  {track.cta}
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.media}>
          {treatment.tracks.map((track, i) => (
            <figure
              key={track.id}
              className={`${styles.card} ${i === index ? styles.cardActive : ""}`}
              style={{ backgroundImage: `url(${track.image})` }}
              aria-hidden={i !== index}
            >
              <figcaption className={styles.caption}>{track.caption}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
