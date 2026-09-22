import styles from "./Location.module.css";

function extractField(code: string, name: string): string | null {
  const match = code.match(new RegExp(`"${name}"\\s*:\\s*"([^"]+)"`));
  return match ? match[1] : null;
}

/** 카카오맵 "지도 퍼가기" 스니펫에서 rendering 에 필요한 값만 뽑아낸다 */
function parseKakaoRoughmap(code: string): { timestamp: string; key: string } | null {
  const timestamp = extractField(code, "timestamp");
  const key = extractField(code, "key");
  if (!timestamp || !key) return null;
  return { timestamp, key };
}

/**
 * 카카오맵 로더 스크립트는 `location.protocol === "https:"` 로 자기 자신을 https/http
 * 중 뭘로 불러올지 정하는데, `srcDoc` 문서의 location.protocol 은 "about:" 라서 항상
 * http: 로 취급된다 — HTTPS로 배포된 페이지에서는 이게 "Mixed Content" 로 차단되어
 * 지도가 안 보인다(로컬 HTTP 환경에서는 프로토콜 다운그레이드가 없어 우연히 동작함).
 * 그래서 srcDoc 대신 실제 같은 도메인의 HTTPS 라우트(/api/kakao-roughmap)를
 * iframe 의 src 로 로드해 location.protocol 이 진짜 https: 가 되도록 한다.
 */
function KakaoRoughmap({
  timestamp,
  mapKey,
  title,
}: {
  timestamp: string;
  mapKey: string;
  title: string;
}) {
  const src = `/api/kakao-roughmap?timestamp=${encodeURIComponent(timestamp)}&key=${encodeURIComponent(mapKey)}`;
  return (
    <iframe className={styles.mapFrame} title={title} src={src} style={{ border: 0 }} />
  );
}

/**
 * 관리자가 붙여넣은 값이 iframe src URL 인지, 카카오맵 "지도 퍼가기" 스니펫인지
 * 판별해서 알맞게 렌더링한다.
 */
export function MapEmbed({ code, title }: { code: string; title: string }) {
  const trimmed = code.trim();
  if (!trimmed) return null;

  const roughmap = parseKakaoRoughmap(trimmed);
  if (roughmap) {
    return (
      <KakaoRoughmap timestamp={roughmap.timestamp} mapKey={roughmap.key} title={title} />
    );
  }

  return <iframe className={styles.mapFrame} src={trimmed} title={title} loading="lazy" />;
}
