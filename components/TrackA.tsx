import { getContent } from "@/lib/content";
import { ProofGate } from "./ProofGate";
import styles from "./TrackA.module.css";

export async function TrackA() {
  const { trackA } = await getContent();
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

        <div id="track-a-proof" className={styles.proof}>
          <h3 className={styles.proofTitle}>{trackA.proof.title}</h3>
          <p className={styles.proofBody}>{trackA.proof.body}</p>
          <ProofGate variant="endoscopy" returnTo="/?track=stomach#track-a-proof" />
        </div>

        <p className={styles.disclaimer}>※ {trackA.disclaimer}</p>
      </div>
    </section>
  );
}
