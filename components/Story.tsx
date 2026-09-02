import { MOBILE_BREAK, story } from "@/lib/site";
import styles from "./Story.module.css";

function withMobileBreak(text: string) {
  return text.split(MOBILE_BREAK).map((part, pi, arr) => (
    <span key={pi}>
      {part}
      {pi < arr.length - 1 && <br className={styles.mobileBreak} />}
    </span>
  ));
}

export function Story() {
  return (
    <section id="story" className={styles.section} aria-labelledby="story-title">
      <div className={styles.inner}>
        <p className={styles.kicker}>{story.kicker}</p>
        <h2 id="story-title" className={styles.title}>
          {story.title}
        </h2>

        <blockquote className={styles.quote}>{story.quote}</blockquote>

        {story.body.map((para, i) => (
          <p key={i} className={styles.body}>
            {withMobileBreak(para)}
          </p>
        ))}

        <ol className={styles.steps}>
          {story.steps.map((step) => (
            <li key={step.term} className={styles.step}>
              <span className={styles.stepTerm}>{step.term}</span>
              <p className={styles.stepDesc}>{withMobileBreak(step.desc)}</p>
            </li>
          ))}
        </ol>

        <p className={styles.closing}>{story.closing}</p>
      </div>
    </section>
  );
}
