/**
 * 짧은 주소 리다이렉트.
 * 302(임시)로 보낸다 — 301은 브라우저가 기억해서 값을 바꿔도 예전 주소로 가는 사람이 생긴다.
 *
 * 채널별 주소: UTM을 붙인다. track 이 있으면 그 진료과가 선택된 상태로 열린다.
 * 인스타그램 UTM 값은 클라이언트가 원래 쓰던 프로필 링크 형태 그대로다.
 */
const channelLinks = [
  { path: "/yt", source: "youtube", medium: "channel" },
  { path: "/ig", source: "instagram", medium: "bio", track: "diet" },
  { path: "/place", source: "naver", medium: "place" },
  { path: "/tt", source: "tiktok", medium: "bio" },
  { path: "/th", source: "threads", medium: "bio" },
  { path: "/x", source: "x", medium: "bio" },
];

/** 진료과 바로가기: 특정 채널용이 아니므로 UTM 없이 진료과만 고른다(유입 경로가 잘못 기록되지 않게). */
const trackLinks = [
  { path: "/diet", track: "diet" },
  { path: "/we", track: "stomach" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      ...channelLinks.map(({ path, source, medium, track }) => ({
        source: path,
        destination: `/?${track ? `track=${track}&` : ""}utm_source=${source}&utm_medium=${medium}&utm_campaign=landing`,
        permanent: false,
      })),
      ...trackLinks.map(({ path, track }) => ({
        source: path,
        destination: `/?track=${track}`,
        permanent: false,
      })),
    ];
  },
};

export default nextConfig;
