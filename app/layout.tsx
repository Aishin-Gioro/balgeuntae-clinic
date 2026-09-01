import type { Metadata, Viewport } from "next";
import { Noto_Serif_KR } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

// 본문/UI 폰트는 Pretendard — app/globals.css 의 @import (jsDelivr 다이나믹 서브셋)로 로드
// 제목 세리프는 Noto Serif KR. 한자(胎·前·腸) 포함 위해 subsets 미지정 + preload:false
const notoSerifKr = Noto_Serif_KR({
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  preload: false,
  variable: "--font-serif",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://balgeuntae.example.com"), // TODO: 실제 도메인으로 교체
  title: {
    default: `${site.name} | ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description:
    "장상피화생·위축성위염 한약 치료와 밝은태 다이어트. 환골탈태하는 한의원, 밝은태 한의원.",
  openGraph: {
    title: `${site.name} | ${site.tagline}`,
    description:
      "장상피화생·위축성위염 한약 치료와 밝은태 다이어트. 환골탈태하는 한의원, 밝은태 한의원.",
    type: "website",
    locale: "ko_KR",
  },
  icons: {
    icon: [
      {
        url:
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 60'%3E%3Cellipse cx='30' cy='40' rx='20' ry='8.5' fill='%232b2b28'/%3E%3Ccircle cx='30' cy='27' r='17' fill='none' stroke='%232b2b28' stroke-width='3'/%3E%3C/svg%3E",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#f4f2ee",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={notoSerifKr.variable}>
      <body>{children}</body>
    </html>
  );
}
