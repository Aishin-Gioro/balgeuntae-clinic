import { getContent } from "@/lib/content";
import { kakaoChatHref, telHref } from "@/lib/site";
import { KakaoIcon, PhoneIcon } from "./icons";
import styles from "./ConsultCta.module.css";

/**
 * 섹션 하단 상담 CTA — 제목 + 전화·카카오톡 버튼.
 * 전화번호·카카오 링크는 사이트 공통 값(site.phone / site.links.kakao)을 쓴다.
 * tone="onDark" 는 어두운/채도 있는 배경 위에서 쓰는 버전(구분선 없음, 밝은 제목).
 * title 을 생략하면 버튼만 그린다. flush 는 위쪽 바깥 여백을 없앤다(제목·부제를 직접 그리는 섹션용).
 */
export async function ConsultCta({
  title,
  phoneLabel,
  kakaoLabel,
  tone = "light",
  flush = false,
}: {
  title?: string;
  phoneLabel: string;
  kakaoLabel: string;
  tone?: "light" | "onDark";
  flush?: boolean;
}) {
  const { site } = await getContent();
  return (
    <div
      className={`${styles.cta} ${tone === "onDark" ? styles.onDark : ""} ${flush ? styles.flush : ""}`}
    >
      {title && <p className={styles.title}>{title}</p>}
      <div className={styles.buttons}>
        <a className={`${styles.button} ${styles.phone}`} href={telHref(site.phone)}>
          <PhoneIcon className={styles.icon} />
          {phoneLabel}
        </a>
        <a
          className={`${styles.button} ${styles.kakao}`}
          href={kakaoChatHref(site.links.kakao)}
          target="_blank"
          rel="noopener"
        >
          <KakaoIcon className={styles.icon} />
          {kakaoLabel}
        </a>
      </div>
    </div>
  );
}
