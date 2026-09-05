import { trackA } from "@/lib/site";
import styles from "./TrackA.module.css";

export function TrackA() {
  return (
    <section id="track-a" className={styles.section} aria-labelledby="track-a-title">
      <div className={styles.inner}>
        <p className={styles.kicker}>{trackA.kicker}</p>
        <h2 id="track-a-title" className={styles.title}>
          {trackA.title}
        </h2>
        <p className={styles.lead}>{trackA.lead}</p>

        <p className={styles.causesTitle}>{trackA.causesTitle}</p>
        <ol className={styles.causes}>
          {trackA.causes.map((c) => (
            <li key={c.q} className={styles.cause}>
              <h3 className={styles.causeQ}>{c.q}</h3>
              <p className={styles.causeA}>
                {c.a.map((line, i) => (
                  <span key={i}>{line}</span>
                ))}
              </p>
            </li>
          ))}
        </ol>

        <div className={styles.proof}>
          <h3 className={styles.proofTitle}>{trackA.proof.title}</h3>
          <p className={styles.proofBody}>{trackA.proof.body}</p>
          <div className={styles.compare}>
            <div className={styles.shot} aria-hidden="true">
              치료 전 내시경
            </div>
            <div className={styles.shot} aria-hidden="true">
              치료 후 내시경
            </div>
          </div>
        </div>

        <p className={styles.disclaimer}>※ {trackA.disclaimer}</p>
      </div>
    </section>
  );
}
