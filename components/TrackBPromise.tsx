import { getContent } from "@/lib/content";
import { ConsultCta } from "./ConsultCta";
import styles from "./TrackBPromise.module.css";

/** 카드 순서대로 쓰는 선 아이콘 (24x24 viewBox) */
const ICONS = [
  // 사람(원장)
  <>
    <circle cx="12" cy="8" r="3.4" />
    <path d="M5 20c.8-3.6 3.5-5.6 7-5.6s6.2 2 7 5.6" />
  </>,
  // 달력 체크(매주)
  <>
    <rect x="4" y="5.5" width="16" height="14.5" rx="2" />
    <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4M9 15l2.2 2.2L15.5 13" />
  </>,
  // 조절(슬라이더)
  <>
    <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
    <circle cx="15" cy="7" r="2" />
    <circle cx="9" cy="17" r="2" />
  </>,
  // 순환(유지)
  <>
    <path d="M19 12a7 7 0 0 1-12 4.9M5 12a7 7 0 0 1 12-4.9" />
    <path d="M17 3.5v4h-4M7 20.5v-4h4" />
  </>,
];

function renderTitle(title: string, highlight: string) {
  const at = highlight ? title.indexOf(highlight) : -1;
  if (at < 0) return title;
  return (
    <>
      {title.slice(0, at)}
      <span className={styles.accent}>{highlight}</span>
      {title.slice(at + highlight.length)}
    </>
  );
}

export async function TrackBPromise() {
  const { promise } = (await getContent()).trackB;
  return (
    <section className={styles.section} aria-labelledby="track-b-promise-title">
      <div className={styles.inner}>
        <p className={styles.kicker}>{promise.kicker}</p>
        <h2 id="track-b-promise-title" className={styles.title}>
          {promise.title}
        </h2>

        <ol className={styles.grid}>
          {promise.cards.map((card, i) => (
            <li key={card.label + i} className={`${styles.card} ${styles[`tone${i % 4}`]}`}>
              <svg
                className={styles.icon}
                viewBox="0 0 24 24"
                width="26"
                height="26"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {ICONS[i % ICONS.length]}
              </svg>
              <span className={styles.label}>{card.label}</span>
              <h3 className={styles.cardTitle}>{renderTitle(card.title, card.highlight)}</h3>
              <p className={styles.desc}>{card.desc}</p>
            </li>
          ))}
        </ol>

        <div className={styles.banner}>
          {promise.banner.heading && (
            <h3 className={styles.bannerHeading}>{promise.banner.heading}</h3>
          )}
          {promise.banner.body && <p className={styles.bannerBody}>{promise.banner.body}</p>}
          <p className={styles.bannerBar}>{promise.banner.title}</p>
          {promise.banner.note && <p className={styles.bannerNote}>{promise.banner.note}</p>}
        </div>

        <ConsultCta
          title={promise.cta.title}
          phoneLabel={promise.cta.phoneLabel}
          kakaoLabel={promise.cta.kakaoLabel}
        />
      </div>
    </section>
  );
}
