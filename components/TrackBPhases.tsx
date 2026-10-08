import { getContent } from "@/lib/content";
import styles from "./TrackBPhases.module.css";

export async function TrackBPhases() {
  const { phases } = (await getContent()).trackB;
  return (
    <section className={styles.section} aria-labelledby="track-b-phases-title">
      <div className={styles.inner}>
        <p className={styles.kicker}>{phases.kicker}</p>
        <h2 id="track-b-phases-title" className={styles.title}>
          {phases.title}
        </h2>

        <ol
          className={styles.steps}
          style={{ gridTemplateColumns: `repeat(${phases.steps.length}, minmax(0, 1fr))` }}
        >
          {phases.steps.map((step, i) => (
            <li key={step.label + i} className={styles.step}>
              <span className={styles.stepLabel}>{step.label}</span>
              <h3 className={styles.name}>{step.name}</h3>

              {/* 단계들을 잇는 가로선 + 단계 사이 화살표 */}
              <div className={styles.rail} aria-hidden="true">
                {i < phases.steps.length - 1 && (
                  <span className={styles.node}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                      <path
                        d="M5 12h13m-5-5 5 5-5 5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                )}
              </div>

              <p className={styles.tagline}>{step.tagline}</p>
              <p className={styles.body}>{step.body}</p>
              <p className={styles.note}>{step.note}</p>

              {step.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img className={styles.image} src={step.image} alt={`${step.name} 이미지`} />
              )}
            </li>
          ))}
        </ol>

        <p className={styles.emphasis}>{phases.emphasis}</p>
      </div>
    </section>
  );
}
