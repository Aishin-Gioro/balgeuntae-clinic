import { getContent } from "@/lib/content";
import { BrandMark } from "./icons";
import styles from "./Doctor.module.css";

export async function Doctor() {
  const { doctor } = await getContent();
  return (
    <section id="doctor" data-section-name="doctor" className={styles.section} aria-labelledby="doctor-name">
      <div className={styles.inner}>
        <div className={styles.top}>
          <span className={styles.brand}>
            <BrandMark className={styles.brandMark} />
            <span className={styles.brandName}>원장 소개</span>
          </span>
          <h2 className={styles.tagline}>{doctor.tagline}</h2>
          <p className={styles.philosophy}>
            {doctor.philosophy.map((line, i) => (
              <span key={i}>{line}</span>
            ))}
          </p>
        </div>

        <div className={styles.body}>
          <div className={styles.aside}>
            <p className={styles.asideLabel}>{doctor.label}</p>
            <span className={styles.asideRule} aria-hidden="true" />
            <p className={styles.asideNote}>
              {doctor.note.map((line, i) => (
                <span key={i}>{line}</span>
              ))}
            </p>
          </div>

          <div
            className={styles.photo}
            aria-hidden="true"
            style={
              doctor.photo ? { backgroundImage: `url(${doctor.photo})` } : undefined
            }
          >
            {doctor.photo ? "" : "원장 사진"}
          </div>

          <div className={styles.info}>
            <p className={styles.kicker}>{doctor.label}</p>
            <h3 id="doctor-name" className={styles.name}>
              {doctor.name}
            </h3>

            <ul className={styles.career}>
              {doctor.career.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>

            <div className={styles.links}>
              {doctor.links.map((l) => (
                <a
                  key={l.label}
                  className={styles.link}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img className={styles.linkIcon} src={l.icon} alt="" aria-hidden="true" />
                  {l.label}
                </a>
              ))}
            </div>

            <p className={styles.footer}>{doctor.footer}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
