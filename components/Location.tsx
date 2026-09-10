import { getContent } from "@/lib/content";
import { telHref } from "@/lib/site";
import { KakaoIcon, PhoneIcon } from "./icons";
import styles from "./Location.module.css";

export async function Location() {
  const { location, site } = await getContent();
  return (
    <section id="location" className={styles.section} aria-labelledby="location-title">
      <div className={styles.inner}>
        <div className={styles.head}>
          <p className={styles.kicker}>{location.kicker}</p>
          <h2 id="location-title" className={styles.title}>
            {location.title}
          </h2>
        </div>

        <div className={styles.grid}>
          <div className={styles.map}>
            {location.mapEmbedUrl ? (
              <iframe
                className={styles.mapFrame}
                src={location.mapEmbedUrl}
                title={`${site.name} 위치 지도`}
                loading="lazy"
              />
            ) : (
              <span className={styles.mapCaption}>
                네이버 지도 임베드 영역 – 주소 확정 후 연동
              </span>
            )}
          </div>

          <div className={styles.panel}>
            <div>
              <p className={styles.pLabel}>ADDRESS</p>
              <p className={styles.address}>{location.address}</p>
              <p className={styles.addressNote}>{location.addressNote}</p>
            </div>

            <span className={styles.divider} aria-hidden="true" />

            <div>
              <p className={styles.pLabel}>진료 시간</p>
              <div className={styles.hours}>
                {location.hours.map((h) => (
                  <div key={h.day} className={styles.hourRow}>
                    <span>{h.day}</span>
                    <span>{h.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <span className={styles.divider} aria-hidden="true" />

            <div>
              <p className={styles.pLabel}>{location.place.label}</p>
              <p className={styles.placeText}>{location.place.text}</p>
              <a
                className={styles.placeLink}
                href={location.place.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {location.place.linkLabel} →
              </a>
            </div>

            <div className={styles.buttons}>
              <a
                className={`${styles.btn} ${styles.btnPrimary}`}
                href={site.links.kakao}
                target="_blank"
                rel="noopener noreferrer"
              >
                <KakaoIcon className={styles.btnIcon} />
                카카오톡 채널로 상담 문의
              </a>
              <a className={`${styles.btn} ${styles.btnGhost}`} href={telHref(site.phone)}>
                <PhoneIcon className={styles.btnIcon} />
                전화 문의 {site.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
