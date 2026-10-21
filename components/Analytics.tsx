"use client";

import { useEffect } from "react";
import { LOGIN_COMPLETE_COOKIE, pushEvent } from "@/lib/analytics";
import { useHeroTrack } from "./HeroTrackContext";

/**
 * 분석 이벤트 수집 — 각 컴포넌트에 코드를 흩뿌리지 않고 여기서 한꺼번에 처리한다.
 * ─ 클릭: document 위임으로 링크 종류(tel / 카카오 채널 / SNS / 로그인)를 판별
 * ─ 위치: 가장 가까운 [data-track-location] 또는 [data-section-name] 값을 button_location 으로
 * ─ 노출·스크롤: section_view / proof_gate_view / scroll_depth — 진료과목이 바뀌면 1회 기록 초기화
 * track_select 는 Hero 버튼에서 직접 보낸다.
 */

const SCROLL_MARKS = [25, 50, 75, 90];
const VISIBILITY_STEPS = Array.from({ length: 51 }, (_, i) => i / 50);

function locationOf(el: Element): string {
  const host = el.closest<HTMLElement>("[data-track-location], [data-section-name]");
  return host?.dataset.trackLocation ?? host?.dataset.sectionName ?? "etc";
}

function snsChannel(url: URL): string | null {
  const host = url.hostname.replace(/^(www|m)\./, "");
  if (host === "youtube.com" || host === "youtu.be") return "youtube";
  if (host === "instagram.com") return "instagram";
  if (host === "blog.naver.com") return "blog";
  return null;
}

/** 로그인/로그아웃 후 복귀 주소(returnTo)에 지금 주소의 utm_* 를 이어 붙인다 — 유입 경로 유지 */
function carryUtm(a: HTMLAnchorElement, url: URL) {
  const utm = [...new URLSearchParams(window.location.search)].filter(([k]) => k.startsWith("utm_"));
  if (utm.length === 0) return;
  const returnTo = new URL(url.searchParams.get("returnTo") || "/", window.location.origin);
  for (const [k, v] of utm) {
    if (!returnTo.searchParams.has(k)) returnTo.searchParams.set(k, v);
  }
  url.searchParams.set("returnTo", `${returnTo.pathname}${returnTo.search}${returnTo.hash}`);
  a.href = url.toString();
}

function onClick(e: MouseEvent) {
  const a = (e.target as Element | null)?.closest?.("a[href]");
  if (!(a instanceof HTMLAnchorElement)) return;

  const button_location = locationOf(a);
  if (a.getAttribute("href")!.startsWith("tel:")) {
    pushEvent("call_click", { button_location });
    return;
  }

  let url: URL;
  try {
    url = new URL(a.href);
  } catch {
    return;
  }

  if (url.origin === window.location.origin) {
    if (url.pathname === "/api/auth/kakao/login") {
      carryUtm(a, url);
      pushEvent("login_click", { login_method: "kakao", button_location });
    } else if (url.pathname === "/api/auth/logout") {
      carryUtm(a, url);
    }
    return;
  }

  if (url.hostname === "pf.kakao.com") {
    pushEvent("kakao_click", { button_location });
    return;
  }

  const channel = snsChannel(url);
  if (channel) pushEvent("sns_click", { channel, button_location });
}

function readLoginComplete(): string | null {
  const m = document.cookie.match(new RegExp(`(?:^|; )${LOGIN_COMPLETE_COOKIE}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export function Analytics() {
  const { track } = useHeroTrack();

  useEffect(() => {
    // 캡처 단계에서 받아야 로그인 링크의 href 를 이동 전에 바꿀 수 있다.
    document.addEventListener("click", onClick, true);

    const method = readLoginComplete();
    if (method) {
      document.cookie = `${LOGIN_COMPLETE_COOKIE}=; Max-Age=0; path=/`;
      pushEvent("login_complete", { login_method: method });
    }

    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // track 이 바뀔 때마다 새로 걸어 1회 기록을 초기화한다.
  useEffect(() => {
    const seenSections = new Set<string>();
    let proofSeen = false;

    // 화면보다 긴 섹션은 50%가 한 번에 보일 수 없으므로, 섹션 높이와 화면 높이 중 작은 쪽의 50%를 기준으로 한다.
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const viewport = entry.rootBounds?.height ?? window.innerHeight;
          if (entry.intersectionRect.height < 0.5 * Math.min(entry.boundingClientRect.height, viewport)) {
            continue;
          }

          const el = entry.target as HTMLElement;
          io.unobserve(el);
          if (el.dataset.proofGate !== undefined) {
            if (!proofSeen) {
              proofSeen = true;
              pushEvent("proof_gate_view");
            }
          } else {
            const section_name = el.dataset.sectionName!;
            if (!seenSections.has(section_name)) {
              seenSections.add(section_name);
              pushEvent("section_view", { section_name });
            }
          }
        }
      },
      { threshold: VISIBILITY_STEPS },
    );
    document.querySelectorAll("[data-section-name], [data-proof-gate]").forEach((el) => io.observe(el));

    const reached = new Set<number>();
    let frame = 0;
    const checkScroll = () => {
      frame = 0;
      const doc = document.documentElement;
      const percent = ((window.scrollY + window.innerHeight) / doc.scrollHeight) * 100;
      for (const mark of SCROLL_MARKS) {
        if (percent >= mark && !reached.has(mark)) {
          reached.add(mark);
          pushEvent("scroll_depth", { percent: mark });
        }
      }
    };
    // 로드 직후가 아니라 실제로 스크롤했을 때만 잰다(짧은 첫 화면에서 25%가 바로 찍히는 것 방지).
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(checkScroll);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [track]);

  return null;
}
