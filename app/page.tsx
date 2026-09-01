import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Story } from "@/components/Story";
import { Treatment } from "@/components/Treatment";
import { TrackA } from "@/components/TrackA";
import { TrackB } from "@/components/TrackB";
import { Doctor } from "@/components/Doctor";
import { Location } from "@/components/Location";
import { UtilBar } from "@/components/UtilBar";
import { MobileCta } from "@/components/MobileCta";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Story />
        <Treatment />
        <TrackA />
        <TrackB />
        <Doctor />
        <Location />
        {/* 이후 섹션(CTA 배너 / 푸터) 예정 */}
      </main>
      <UtilBar />
      <MobileCta />
    </>
  );
}
