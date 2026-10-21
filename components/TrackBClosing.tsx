import { getContent } from "@/lib/content";
import { ConsultCta } from "./ConsultCta";
import styles from "./TrackBClosing.module.css";

export async function TrackBClosing() {
  const { closing } = (await getContent()).trackB;
  return (
    <section data-section-name="diet_closing" className={styles.section} aria-labelledby="track-b-closing-title">
      <div className={styles.inner}>
        <h2 id="track-b-closing-title" className={styles.title}>
          {closing.title}
        </h2>
        <p className={styles.subtitle}>{closing.subtitle}</p>
        <ConsultCta
          flush
          phoneLabel={closing.phoneLabel}
          kakaoLabel={closing.kakaoLabel}
        />
      </div>
    </section>
  );
}
