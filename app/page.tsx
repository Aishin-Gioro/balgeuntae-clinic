import { Suspense } from "react";
import { isGateUnlocked } from "@/lib/auth";
import { getContent, redactGatedContent } from "@/lib/content";
import { ContentProvider } from "@/components/ContentProvider";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { GateProvider } from "@/components/GateProvider";
import { HeroTrackGate } from "@/components/HeroTrackGate";
import { ShowForTrack } from "@/components/ShowForTrack";
import { PrescriptionBanner } from "@/components/PrescriptionBanner";
import { Reviews } from "@/components/Reviews";
import { Treatment } from "@/components/Treatment";
import { TrackA } from "@/components/TrackA";
import { TrackB } from "@/components/TrackB";
import { TrackBFit } from "@/components/TrackBFit";
import { TrackBPhases } from "@/components/TrackBPhases";
import { TrackBPromise } from "@/components/TrackBPromise";
import { TrackBBasis } from "@/components/TrackBBasis";
import { TrackBClosing } from "@/components/TrackBClosing";
import { TrackBFaq } from "@/components/TrackBFaq";
import { Doctor } from "@/components/Doctor";
import { Location } from "@/components/Location";
import { Footer } from "@/components/Footer";
import { UtilBar } from "@/components/UtilBar";
import { MobileCta } from "@/components/MobileCta";
import { Analytics } from "@/components/Analytics";

export default async function HomePage() {
  const [content, gateUnlocked] = await Promise.all([getContent(), isGateUnlocked()]);

  // ContentProvider 는 클라이언트 컴포넌트라 여기 넘기는 값이 로그인 여부와
  // 무관하게 페이지 응답에 그대로 담긴다. 전후 사진·후기 사진은 반드시
  // 걸러낸 뒤 전달한다(실제 렌더링은 ProofGate/Reviews 가 서버에서 따로 처리).
  const clientContent = gateUnlocked ? content : redactGatedContent(content);

  return (
    <Suspense fallback={null}>
      <ContentProvider value={clientContent}>
        <Header gateUnlocked={gateUnlocked} />
        <main>
          <Hero />
          <HeroTrackGate>
            <GateProvider unlocked={gateUnlocked}>
              {/* 진료과목별 후기 — 둘 다 서버에서 그려두고 선택된 쪽만 보여 탭 전환이 즉시 반영된다 */}
              <ShowForTrack id="stomach">
                <Reviews track="stomach" />
              </ShowForTrack>
              <ShowForTrack id="diet">
                <Reviews track="diet" />
              </ShowForTrack>
              <Treatment />
              <ShowForTrack id="stomach">
                <TrackA />
              </ShowForTrack>
              <ShowForTrack id="diet">
                <TrackB />
                <TrackBFit />
                <TrackBPhases />
                <TrackBPromise />
              </ShowForTrack>
              <PrescriptionBanner />
              <ShowForTrack id="diet">
                <TrackBBasis />
              </ShowForTrack>
              <Doctor />
              <ShowForTrack id="diet">
                <TrackBClosing />
                <TrackBFaq />
              </ShowForTrack>
              <Location />
              {/* 이후 섹션(CTA 배너) 예정 */}
            </GateProvider>
          </HeroTrackGate>
        </main>
        <Footer />
        <UtilBar />
        <MobileCta />
        <Analytics />
      </ContentProvider>
    </Suspense>
  );
}
