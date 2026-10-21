import { getContent } from "@/lib/content";
import { ConsultCta } from "./ConsultCta";
import styles from "./TrackBBasis.module.css";

/** "텍스트 [자리표시자]" → 대괄호 부분만 강조 */
function renderBullet(text: string) {
  return text.split(/(\[[^\]]*\])/g).map((part, i) =>
    part.startsWith("[") && part.endsWith("]") ? (
      <strong key={i} className={styles.mark}>
        {part}
      </strong>
    ) : (
      part
    ),
  );
}

export async function TrackBBasis() {
  const { basis } = (await getContent()).trackB;
  return (
    <section data-section-name="diet_basis" className={styles.section} aria-label="맞춤 처방 기준">
      <div className={styles.inner}>
        <ol className={styles.grid}>
          {basis.cards.map((card, i) => (
            <li key={card.title + i} className={styles.card}>
              <div className={styles.head}>
                <span className={styles.label}>{card.label}</span>
                <span className={styles.num} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>

              {card.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img className={styles.image} src={card.image} alt="" />
              )}

              <h3 className={styles.title}>{card.title}</h3>
              <p className={styles.intro}>{card.intro}</p>

              <ul className={styles.bullets}>
                {card.bullets.map((b, bi) => (
                  <li key={b + bi}>{renderBullet(b)}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>

        <ConsultCta
          tone="onDark"
          title={basis.cta.title}
          phoneLabel={basis.cta.phoneLabel}
          kakaoLabel={basis.cta.kakaoLabel}
        />
      </div>
    </section>
  );
}
