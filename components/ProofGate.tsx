import { isGateUnlocked } from "@/lib/auth";
import { getContent } from "@/lib/content";
import { KakaoIcon, LockIcon } from "./icons";
import styles from "./ProofGate.module.css";

/**
 * 치료 전후 비교 사진 열람 게이트 (의료법 제56조 제2항).
 *
 * 실제 사진(경로 포함)은 이 컴포넌트가 내부에서만 참조한다. 잠김 상태에서는
 * 사진을 만드는 코드 경로 자체를 타지 않으므로, 비로그인 응답(HTML·RSC 페이로드)
 * 어디에도 이미지 URL이나 라벨이 노출되지 않는다.
 */

export async function ProofGate({
  variant,
  returnTo,
}: {
  variant: "endoscopy" | "inbody";
  /** 로그인/로그아웃 후 복귀할 내부 경로 (예: "/#track-a-proof") */
  returnTo: string;
}) {
  const content = await getContent();
  const photoGate = content.photoGate;

  if (!(await isGateUnlocked())) {
    return (
      <div className={`${styles.locked} ${styles.narrow}`}>
        <div className={styles.blurLayer} aria-hidden="true">
          <div className={styles.blurShot} />
        </div>
        <div className={styles.panel}>
          <LockIcon className={styles.lockIcon} />
          <p className={styles.lockedTitle}>{photoGate.lockedTitle}</p>
          <a
            className={styles.loginBtn}
            href={`/api/auth/kakao/login?returnTo=${encodeURIComponent(returnTo)}`}
          >
            <KakaoIcon className={styles.kakaoIcon} />
            {photoGate.loginLabel}
          </a>
        </div>
      </div>
    );
  }

  const proof = variant === "endoscopy" ? content.trackA.proof : content.trackB.proof;

  return (
    <div>
      <div className={`${styles.compare} ${styles.narrow}`}>
        <div className={styles.shot}>
          {proof.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={styles.shotImg} src={proof.photo} alt={proof.caption} />
          ) : (
            proof.caption
          )}
        </div>
      </div>
      <p className={styles.status}>
        <span className={styles.dot} aria-hidden="true" />
        {photoGate.unlockedNote}
        <a
          className={styles.logout}
          href={`/api/auth/logout?returnTo=${encodeURIComponent(returnTo)}`}
        >
          {photoGate.logoutLabel}
        </a>
      </p>
    </div>
  );
}
