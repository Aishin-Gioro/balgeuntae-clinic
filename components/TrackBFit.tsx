import { getContent } from "@/lib/content";
import styles from "./TrackBFit.module.css";

export async function TrackBFit() {
  const { fit } = (await getContent()).trackB;
  const [titleHead, ...titleRest] = fit.title.split("\n");
  const [closingHead, ...closingRest] = fit.closing.split("\n");

  return (
    <section className={styles.section} aria-labelledby="track-b-fit-title">
      <div className={styles.inner}>
        <h2 id="track-b-fit-title" className={styles.title}>
          <span className={styles.titleHead}>{titleHead}</span>
          {titleRest.length > 0 && (
            <span className={styles.titleStrong}>{titleRest.join("\n")}</span>
          )}
        </h2>

        <ul className={styles.list}>
          {fit.items.map((item) => (
            <li key={item} className={styles.item}>
              <span className={styles.check} aria-hidden="true">
                <svg viewBox="0 0 16 16" width="22" height="22" fill="none">
                  <path
                    d="M3.5 8.4 6.7 11.5 12.5 4.9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <span className={styles.rule} aria-hidden="true" />
        <p className={styles.closing}>
          <strong className={styles.closingStrong}>{closingHead}</strong>
          {closingRest.length > 0 && (
            <span className={styles.closingSoft}>{closingRest.join("\n")}</span>
          )}
        </p>
      </div>
    </section>
  );
}
