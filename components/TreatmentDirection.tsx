import { getContent } from "@/lib/content";
import { RevealList } from "./RevealList";
import { RevealTitle } from "./RevealTitle";
import styles from "./TreatmentDirection.module.css";

/** 위장 치료 방향(한의원의 차별점) — 왼쪽 제목, 오른쪽 핵심 항목 */
export async function TreatmentDirection() {
  const { direction } = (await getContent()).trackA;
  // 관리자에서 추가만 하고 비워 둔 항목은 보이지 않는다
  const points = direction.points.filter((p) => p.title.trim() || p.desc.trim());
  if (points.length === 0) return null;

  return (
    <section
      id="direction"
      data-section-name="stomach_direction"
      className={styles.section}
      aria-labelledby="direction-title"
    >
      <div className={styles.inner}>
        <div className={styles.columns}>
          <div>
            <p className={styles.kicker}>{direction.kicker}</p>
            <RevealTitle id="direction-title" className={styles.title}>
              {direction.title}
            </RevealTitle>
            <p className={styles.lead}>{direction.lead}</p>
          </div>

          <RevealList className={styles.points}>
            {points.map((p, i) => (
              <li key={i} className={styles.point}>
                <span className={styles.number} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className={styles.pointTitle}>{p.title}</h3>
                  <p className={styles.pointDesc}>{p.desc}</p>
                </div>
              </li>
            ))}
          </RevealList>
        </div>
      </div>
    </section>
  );
}
