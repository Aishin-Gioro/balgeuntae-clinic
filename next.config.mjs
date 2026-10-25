/**
 * 채널별 짧은 주소 → UTM이 붙은 랜딩 주소.
 * 302(임시)로 보낸다 — 301은 브라우저가 기억해서 UTM 값을 바꿔도 예전 주소로 가는 사람이 생긴다.
 * 인스타그램 값은 클라이언트가 원래 쓰던 프로필 링크 형태 그대로다.
 */
const shortLinks = [
  { path: "/yt", source: "youtube", medium: "channel" },
  { path: "/ig", source: "instagram", medium: "bio" },
  { path: "/place", source: "naver", medium: "place" },
  { path: "/tt", source: "tiktok", medium: "bio" },
  { path: "/th", source: "threads", medium: "bio" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return shortLinks.map(({ path, source, medium }) => ({
      source: path,
      destination: `/?utm_source=${source}&utm_medium=${medium}&utm_campaign=landing`,
      permanent: false,
    }));
  },
};

export default nextConfig;
