import { NextResponse, type NextRequest } from "next/server";

const KAKAO_LOADER_SRC =
  "https://t1.kakaocdn.net/kakaomapweb/roughmap/loader/prod/roughmapLoader.js";

/**
 * 카카오맵 "지도 퍼가기" 스니펫을 실제 렌더링하는 독립 HTML 페이지.
 *
 * 이 페이지 자체를 iframe 의 src(=진짜 HTTP(S) 문서)로 로드해야 한다. `srcDoc`
 * 으로 넣으면 문서의 location.protocol 이 "about:" 가 되는데, 카카오 로더
 * 스크립트는 `location.protocol === "https:"` 로 프로토콜을 판단해 스크립트
 * URL을 만들기 때문에 "about:" 는 항상 http: 로 취급된다. 배포(HTTPS) 환경에서
 * 부모 페이지는 HTTPS인데 이 내부 스크립트만 http:// 로 요청되어 브라우저가
 * "Mixed Content" 로 차단 — 로컬(HTTP)에서만 되고 배포에서는 지도가 하얗게
 * 안 보이던 원인이었다. 실제 HTTPS 라우트로 서빙해 location.protocol 이 정상
 * 적으로 https: 를 반환하도록 한다.
 */
function buildHtml(timestamp: string, key: string) {
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

export function GET(req: NextRequest) {
  const timestamp = req.nextUrl.searchParams.get("timestamp") ?? "";
  const key = req.nextUrl.searchParams.get("key") ?? "";

  // 공개 라우트라 누구나 쿼리 파라미터를 보낼 수 있으므로, HTML/스크립트에
  // 그대로 꽂아 넣기 전에 카카오 스니펫 형식(숫자 timestamp, 영숫자 key)인지
  // 엄격히 검증한다.
  if (!/^\d+$/.test(timestamp) || !/^[a-zA-Z0-9_-]+$/.test(key)) {
    return new NextResponse("Bad Request", { status: 400 });
  }

  return new NextResponse(buildHtml(timestamp, key), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
