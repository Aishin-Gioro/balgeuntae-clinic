import { Suspense } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HeroTrackGate } from "@/components/HeroTrackGate";
import { ShowForTrack } from "@/components/ShowForTrack";
import { PrescriptionBanner } from "@/components/PrescriptionBanner";
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
        <Suspense fallback={null}>
          <Hero />
          <HeroTrackGate>
            <Treatment />
            <ShowForTrack id="stomach">
              <TrackA />
            </ShowForTrack>
            <ShowForTrack id="diet">
              <TrackB />
            </ShowForTrack>
            <PrescriptionBanner />
            <Doctor />
            <Location />
            {/* 이후 섹션(CTA 배너 / 푸터) 예정 */}
          </HeroTrackGate>
        </Suspense>
      </main>
      <UtilBar />
      <MobileCta />
    </>
  );
}
