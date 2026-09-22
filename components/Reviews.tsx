import { isGateUnlocked } from "@/lib/auth";
import { getContent } from "@/lib/content";
import { KakaoIcon } from "./icons";
import styles from "./Reviews.module.css";

/**
 * 후기(REAL REVIEW) 섹션. 히어로에서 진료과목을 선택한 화면에서만 보인다
 * (page.tsx 에서 <HeroTrackGate> 로 감싸 렌더링).
 *
 * 전후 사진(ProofGate)과 달리, 후기는 로그인 전에도 실제 사진·이름·글이
 * 화면에 "블러 처리"되어 보인다(호기심을 유도하는 마케팅 패턴). 즉 비로그인
 * 상태에서도 실제 데이터가 페이지 응답에 포함되며, CSS 블러로만 가려진다
 * — 이름은 반드시 이니셜(예: "김*희님")로만 입력해 실명이 노출되지 않게 한다.
 */

type ReviewItem = { name: string; photo: string; quote: string[] };

function ReviewCard({ item }: { item: ReviewItem }) {
  return (
    <div className={styles.card}>
      <div
        className={styles.photo}
        style={item.photo ? { backgroundImage: `url(${item.photo})` } : undefined}
      >
        {item.photo ? "" : "후기 사진"}
      </div>
      <div className={styles.body}>
        <p className={styles.name}>{item.name || "익명"}</p>
        <p className={styles.quote}>
          {item.quote.map((line, li) => (
            <span key={li}>{line}</span>
          ))}
        </p>
      </div>
    </div>
  );
}

export async function Reviews({ track }: { track?: string }) {
  const [content, unlocked] = await Promise.all([getContent(), isGateUnlocked()]);
  const { reviews } = content;

  const returnTo =
    track === "stomach" || track === "diet" ? `/?track=${track}#reviews` : "/#reviews";

  // 후기가 4개 이상이면 3열 그리드 대신 옆으로 천천히 흐르는 마퀴로 전환한다.
  const many = reviews.items.length >= 4;
  const lockClass = unlocked ? "" : ` ${styles.gridLocked}`;
  const marqueeDuration = Math.max(20, reviews.items.length * 6);

  return (
    <section id="reviews" className={styles.section} aria-labelledby="reviews-title">
      {/* 장식 곡선 — 진료과목 섹션과 같은 톤, 한 줄만 */}
      <svg className={styles.decor} viewBox="0 0 1440 760" preserveAspectRatio="none" aria-hidden="true">
        <path
          vectorEffect="non-scaling-stroke"
          d="M-40 438C240 372 470 408 700 468C905 522 1080 446 1260 486C1360 508 1440 494 1490 474"
        />
      </svg>

      <div className={styles.inner}>
        <span className={styles.kicker}>{reviews.kicker}</span>
        <h2 id="reviews-title" className={styles.title}>
          {reviews.title}
        </h2>
        <p className={styles.subtitle}>{reviews.subtitle}</p>

        <div
          className={many ? styles.marqueeOuter : `${styles.grid}${lockClass}`}
          aria-hidden={!unlocked}
        >
          {many ? (
            <div
              className={`${styles.marqueeTrack}${lockClass}`}
              style={{ animationDuration: `${marqueeDuration}s` }}
            >
              {[...reviews.items, ...reviews.items].map((item, i) => (
                <ReviewCard item={item} key={i} />
              ))}
            </div>
          ) : (
            reviews.items.map((item, i) => <ReviewCard item={item} key={i} />)
          )}
        </div>

        {unlocked ? (
          <p className={styles.status}>
            <span className={styles.dot} aria-hidden="true" />
            {reviews.unlockedNote}
            <a
              className={styles.logout}
              href={`/api/auth/logout?returnTo=${encodeURIComponent(returnTo)}`}
            >
              {reviews.logoutLabel}
            </a>
          </p>
        ) : (
          <div className={styles.ctaRow}>
            <a
              className={styles.loginBtn}
              href={`/api/auth/kakao/login?returnTo=${encodeURIComponent(returnTo)}`}
            >
              <KakaoIcon className={styles.kakaoIcon} />
              {reviews.loginLabel}
            </a>
          </div>
        )}

        <p className={styles.disclaimer}>{reviews.disclaimer}</p>
      </div>
    </section>
  );
}
