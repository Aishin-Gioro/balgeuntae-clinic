import { getContent } from "@/lib/content";
import styles from "./TrackBFaq.module.css";

/** "텍스트 [자리표시자]" → 대괄호 부분만 강조 */
function renderAnswer(text: string) {
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

export async function TrackBFaq() {
  const { faq } = (await getContent()).trackB;
  return (
    <section data-section-name="diet_faq" className={styles.section} aria-labelledby="track-b-faq-title">
      <div className={styles.inner}>
        <div className={styles.intro}>
          <p className={styles.kicker}>{faq.kicker}</p>
          <h2 id="track-b-faq-title" className={styles.title}>
            {faq.title}
          </h2>
          <p className={styles.body}>{faq.body}</p>
          {faq.notice && <p className={styles.notice}>{faq.notice}</p>}
        </div>

        <div className={styles.list}>
          {faq.items.map((item, i) => (
            // name 이 같은 details 는 하나만 열린다(미지원 브라우저는 각각 독립 동작)
            <details key={item.q + i} className={styles.item} name="track-b-faq" open={i === 0}>
              <summary className={styles.summary}>
                <span className={styles.q} aria-hidden="true">
                  Q
                </span>
                <span className={styles.question}>{item.q}</span>
                <span className={styles.toggle} aria-hidden="true" />
              </summary>
              <p className={styles.answer}>{renderAnswer(item.a)}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
