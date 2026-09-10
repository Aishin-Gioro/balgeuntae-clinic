"use client";

import { MOBILE_BREAK, type HeroTrackId, type HeroVariant } from "@/lib/site";
import { useContent } from "./ContentProvider";
import { useHeroTrack } from "./HeroTrackContext";
import { ChatIcon, ChevronDown, ChevronRight } from "./icons";
import styles from "./Hero.module.css";

const TRACK_IDS: HeroTrackId[] = ["stomach", "diet"];

type VariantId = "default" | HeroTrackId;

function withMobileBreak(text: string) {
  return text.split(MOBILE_BREAK).map((part, pi, arr) => (
    <span key={pi}>
      {part}
      {pi < arr.length - 1 && <br className={styles.mobileBreak} />}
    </span>
  ));
}

export function Hero() {
  const { hero } = useContent();
  const { track, setTrack } = useHeroTrack();
  const activeId: VariantId = track ?? "default";

  const variants: { id: VariantId; content: HeroVariant }[] = [
    { id: "default", content: hero.default },
    ...TRACK_IDS.map((id) => ({ id, content: hero.tracks[id] })),
  ];

  return (
    <section id="hero" className={styles.hero} aria-label="주요 진료 안내">
      {variants.map(({ id, content }) => (
        <div
          key={id}
          className={`${styles.bg} ${id === activeId ? styles.bgActive : ""}`}
          style={{ backgroundImage: `url(${content.image}), ${content.gradient}` }}
          aria-hidden="true"
        />
      ))}
      <div className={styles.scrim} />

      <div className={styles.content}>
        <div className={styles.copyLayers}>
          {variants.map(({ id, content }) => {
            const active = id === activeId;
            return (
              <div
                key={id}
                className={`${styles.copy} ${active ? styles.copyActive : ""}`}
                aria-hidden={!active}
              >
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
            );
          })}
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
              {hero.tracks[id].buttonLabel}
            </button>
          ))}
        </div>

        <div className={styles.ctaLayers}>
          {variants.map(({ id, content }) => {
            if (!content.cta) return null;
            const active = id === activeId;
            const isChat = content.cta.icon === "chat";
            return (
              <a
                key={id}
                className={`${styles.cta} ${active ? styles.ctaActive : ""}`}
                href={content.cta.href}
                tabIndex={active ? 0 : -1}
                aria-hidden={!active}
              >
                {isChat && <ChatIcon className={styles.ctaIcon} />}
                {content.cta.label}
                {!isChat && <ChevronRight className={styles.ctaIcon} />}
              </a>
            );
          })}
        </div>
      </div>

      {track && (
        <a className={styles.scrollHint} href="#treatment" aria-label="아래로 스크롤">
          <span className={styles.scrollHintText}>SCROLL</span>
          <ChevronDown className={styles.scrollHintIcon} />
        </a>
      )}
    </section>
  );
}
