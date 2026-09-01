import { trackB } from "@/lib/site";
import styles from "./TrackB.module.css";

export function TrackB() {
  return (
    <section id="track-b" className={styles.section} aria-labelledby="track-b-title">
      <svg className={styles.decor} viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true">
        <path
          vectorEffect="non-scaling-stroke"
          d="M-40 150C240 84 470 120 700 180C905 234 1080 158 1260 198C1360 220 1440 206 1490 186"
        />
        <path
          vectorEffect="non-scaling-stroke"
          style={{ opacity: 0.55 }}
          d="M-40 720C260 652 440 772 690 744C900 720 1050 804 1280 760C1370 743 1450 764 1500 754"
        />
      </svg>

      <div className={styles.inner}>
        <p className={styles.kicker}>{trackB.kicker}</p>
        <h2 id="track-b-title" className={styles.title}>
          {trackB.title}
        </h2>
        <p className={styles.lead}>{trackB.lead}</p>

        <div className={styles.effectsBlock}>
          <h3 className={styles.effectsTitle}>{trackB.effectsTitle}</h3>

          <div className={styles.effectsGrid}>
            <div className={styles.effectsMedia}>
              <div className={styles.effectsPhoto} aria-hidden="true">
                다이어트 이미지
              </div>
            </div>

            <ol className={styles.effectsList}>
              {trackB.effects.map((e, i) => (
                <li key={e.term} className={styles.effectItem}>
                  <span className={styles.effectIndex}>( 작용 0{i + 1} )</span>
                  <h4 className={styles.effectTerm}>{e.term}</h4>
                  <p className={styles.effectDesc}>{e.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className={styles.prescription}>
          <div className={styles.prescriptionBanner}>
            <p className={styles.prescriptionKicker}>{trackB.prescription.kicker}</p>
            <h3 className={styles.prescriptionTitle}>{trackB.prescription.title}</h3>
            <p className={styles.prescriptionBody}>{trackB.prescription.body}</p>
            <p className={styles.prescriptionNote}>{trackB.prescription.note}</p>
          </div>
        </div>

        <div className={styles.proof}>
          <h3 className={styles.proofTitle}>{trackB.proof.title}</h3>
          <p className={styles.proofBody}>{trackB.proof.body}</p>
          <div className={styles.compare}>
            <div className={styles.shot} aria-hidden="true">
              시작 인바디
            </div>
            <div className={styles.shot} aria-hidden="true">
              마무리 인바디
            </div>
          </div>
        </div>

        <p className={styles.disclaimer}>※ {trackB.disclaimer}</p>
      </div>
    </section>
  );
}
