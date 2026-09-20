import styles from "./Location.module.css";

const KAKAO_LOADER_SRC =
  "https://t1.kakaocdn.net/kakaomapweb/roughmap/loader/prod/roughmapLoader.js";

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
 * 카카오맵 로더 스크립트는 내부적으로 document.write 로 실제 지도 라이브러리를 불러온다.
 * 이미 로딩이 끝난 페이지에 스크립트를 동적으로 삽입하면 브라우저가 그 document.write 를
 * 무시해버리므로(비동기 스크립트 제약), 독립된 iframe 문서 안에서 원본 스니펫을 그대로
 * "정적 HTML"처럼 파싱시켜 우회한다.
 */
function buildRoughmapSrcDoc(timestamp: string, key: string) {
  // 카카오 스크립트는 mapWidth/mapHeight 뒤에 무조건 "px"를 붙여서 style 에 적용하므로
  // ("100%" 같은 값은 못 씀), iframe 이 실제로 렌더링된 크기를 직접 재서 정수 px 로 넘긴다.
  // 화면 크기가 바뀌면(반응형 레이아웃) iframe 을 새로고침해서 다시 그 크기에 맞게 그린다.
  return `<!DOCTYPE html><html><head><meta charset="utf-8" /><style>html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;}</style></head><body>
<div id="daumRoughmapContainer${timestamp}" class="root_daum_roughmap root_daum_roughmap_landing"></div>
<script charset="UTF-8" src="${KAKAO_LOADER_SRC}"></script>
<script charset="UTF-8">
(function () {
  new daum.roughmap.Lander({
    "timestamp": "${timestamp}",
    "key": "${key}",
    "mapWidth": String(Math.max(1, Math.round(document.documentElement.clientWidth))),
    "mapHeight": String(Math.max(1, Math.round(document.documentElement.clientHeight)))
  }).render();

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { location.reload(); }, 200);
  });
})();
</script>
</body></html>`;
}

function KakaoRoughmap({
  timestamp,
  mapKey,
  title,
}: {
  timestamp: string;
  mapKey: string;
  title: string;
}) {
  return (
    <iframe
      className={styles.mapFrame}
      title={title}
      srcDoc={buildRoughmapSrcDoc(timestamp, mapKey)}
      style={{ border: 0 }}
    />
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
