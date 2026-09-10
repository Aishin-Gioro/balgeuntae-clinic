import { Suspense } from "react";
import { isGateUnlocked } from "@/lib/auth";
import { getContent } from "@/lib/content";
import { ContentProvider } from "@/components/ContentProvider";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { GateProvider } from "@/components/GateProvider";
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

export default async function HomePage() {
  const [content, gateUnlocked] = await Promise.all([
    getContent(),
    isGateUnlocked(),
  ]);

  return (
    <Suspense fallback={null}>
      <ContentProvider value={content}>
        <Header gateUnlocked={gateUnlocked} />
        <main>
          <Hero />
          <HeroTrackGate>
            <GateProvider unlocked={gateUnlocked}>
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
            </GateProvider>
          </HeroTrackGate>
        </main>
        <UtilBar />
        <MobileCta />
      </ContentProvider>
    </Suspense>
  );
}
