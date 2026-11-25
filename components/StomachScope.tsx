import { getContent } from "@/lib/content";
import { RevealList } from "./RevealList";
import { RevealTitle } from "./RevealTitle";
import styles from "./StomachScope.module.css";

/** 위장 진료과목 카드 목록. 카드는 관리자에서 추가·삭제하며, 하나도 없으면 섹션을 숨긴다 */
export async function StomachScope() {
  const { scope } = (await getContent()).trackA;
  // 관리자에서 추가만 하고 비워 둔 카드는 보이지 않는다
  const items = scope.items.filter((it) => it.name.trim() || it.desc.trim());
  if (items.length === 0) return null;

  return (
    <section id="scope" data-section-name="stomach_scope" className={styles.section} aria-labelledby="scope-title">
      <div className={styles.inner}>
        <p className={styles.kicker}>{scope.kicker}</p>
        <RevealTitle id="scope-title" className={styles.title}>
          {scope.title}
        </RevealTitle>

        <RevealList className={styles.list}>
          {items.map((it, i) => (
            // 이름은 중복·공백일 수 있어 순서를 key 로 쓴다
            <li key={i} className={styles.item}>
              {/* 등장 연출은 li, 호버 연출은 안쪽 카드 — RevealList 가 li 에 거는 지연이 호버에 섞이지 않게 */}
              <div className={styles.card}>
                <span className={styles.number} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className={styles.name}>{it.name}</h3>
                <p className={styles.desc}>{it.desc}</p>
              </div>
            </li>
          ))}
        </RevealList>
      </div>
    </section>
  );
}
