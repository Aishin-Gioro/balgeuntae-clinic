"use client";

import { heroDefault, heroTracks, MOBILE_BREAK, type HeroTrackId } from "@/lib/site";
import { useHeroTrack } from "./HeroTrackContext";
import { ChatIcon } from "./icons";
import styles from "./Hero.module.css";

const TRACK_IDS = Object.keys(heroTracks) as HeroTrackId[];

function withMobileBreak(text: string) {
  return text.split(MOBILE_BREAK).map((part, pi, arr) => (
    <span key={pi}>
      {part}
      {pi < arr.length - 1 && <br className={styles.mobileBreak} />}
    </span>
  ));
}

export function Hero() {
  const { track, setTrack } = useHeroTrack();
  const content = track ? heroTracks[track] : heroDefault;

  return (
    <section id="hero" className={styles.hero} aria-label="주요 진료 안내">
      <div
        className={styles.bg}
        style={{ backgroundImage: `url(${content.image}), ${content.gradient}` }}
      />
      <div className={styles.scrim} />

      <div className={styles.copy}>
        <h2 className={styles.title}>{withMobileBreak(content.title)}</h2>
        {content.subtitle.length > 0 && (
          <p className={styles.sub}>
            {content.subtitle.map((line, li) => (
              <span key={li}>
                {withMobileBreak(line)}
                {li < content.subtitle.length - 1 && <br />}
              </span>
            ))}
          </p>
        )}
      </div>

      <div className={styles.selector} role="group" aria-label="진료과목 선택">
        {TRACK_IDS.map((id) => (
          <button
            key={id}
            type="button"
            className={`${styles.selectorBtn} ${track === id ? styles.selectorBtnActive : ""}`}
            aria-pressed={track === id}
            onClick={() => setTrack(track === id ? null : id)}
          >
            {heroTracks[id].buttonLabel}
          </button>
        ))}
      </div>

      {content.cta && (
        <a className={styles.cta} href={content.cta.href}>
          <ChatIcon className={styles.ctaIcon} />
          {content.cta.label}
        </a>
      )}
    </section>
  );
}
