"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MOBILE_BREAK,
  MOBILE_BREAK_TOKEN,
  type SiteContent,
} from "@/lib/content/schema";
import {
  Group,
  ImageField,
  Repeater,
  StringListField,
  TextAreaField,
  TextField,
} from "./fields";
import s from "./editor.module.css";

/* U+2028(모바일 전용 줄바꿈) ↔ 편집기에서 보이는 「⏎」 토큰 변환 */
function mapStrings(v: unknown, fn: (s: string) => string): unknown {
  if (typeof v === "string") return fn(v);
  if (Array.isArray(v)) return v.map((x) => mapStrings(x, fn));
  if (v && typeof v === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v)) out[k] = mapStrings(val, fn);
    return out;
  }
  return v;
}
const decode = (c: SiteContent) =>
  mapStrings(c, (t) => t.split(MOBILE_BREAK).join(MOBILE_BREAK_TOKEN)) as SiteContent;
const encode = (c: SiteContent) =>
  mapStrings(c, (t) => t.split(MOBILE_BREAK_TOKEN).join(MOBILE_BREAK)) as SiteContent;

const BREAK_HINT = `줄바꿈은 Enter. 모바일에서만 줄을 나누려면 「${MOBILE_BREAK_TOKEN}」 기호를 넣으세요.`;

const TABS = [
  "기본 정보",
  "히어로",
  "진료과목",
  "위장 상세",
  "다이어트 상세",
  "전후사진 문구",
  "원장 소개",
  "오시는 길",
  "푸터",
] as const;

export function AdminEditor({ initial }: { initial: SiteContent }) {
  const router = useRouter();
  const [draft, setDraft] = useState<SiteContent>(() => decode(initial));
  const [tab, setTab] = useState<(typeof TABS)[number]>("기본 정보");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);

  const patch = useCallback((fn: (d: SiteContent) => void) => {
    setDraft((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
    setDirty(true);
    setToast(null);
  }, []);

  async function save() {
    setSaving(true);
    setToast(null);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(encode(draft)),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setToast({ ok: false, msg: data.error ?? "저장에 실패했습니다." });
        return;
      }
      setDirty(false);
      setToast({ ok: true, msg: "저장했습니다. 홈페이지에 바로 반영됩니다." });
      router.refresh();
    } catch {
      setToast({ ok: false, msg: "네트워크 오류가 발생했습니다." });
    } finally {
      setSaving(false);
    }
  }

  function resetAll() {
    if (!confirm("편집 중인 내용을 모두 되돌릴까요? (마지막 저장 상태로 돌아갑니다)")) {
      return;
    }
    setDraft(decode(initial));
    setDirty(false);
    setToast(null);
  }

  return (
    <div className={s.editor}>
      <nav className={s.tabs}>
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            className={`${s.tab} ${tab === t ? s.tabActive : ""}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </nav>

      {tab === "기본 정보" && <BasicTab draft={draft} patch={patch} />}
      {tab === "히어로" && <HeroTab draft={draft} patch={patch} />}
      {tab === "진료과목" && <TreatmentTab draft={draft} patch={patch} />}
      {tab === "위장 상세" && <TrackATab draft={draft} patch={patch} />}
      {tab === "다이어트 상세" && <TrackBTab draft={draft} patch={patch} />}
      {tab === "전후사진 문구" && <PhotoGateTab draft={draft} patch={patch} />}
      {tab === "원장 소개" && <DoctorTab draft={draft} patch={patch} />}
      {tab === "오시는 길" && <LocationTab draft={draft} patch={patch} />}
      {tab === "푸터" && <FooterTab draft={draft} patch={patch} />}

      <div className={s.saveBar}>
        <span className={s.saveState}>
          {toast ? (
            <span className={toast.ok ? s.toastOk : s.toastErr}>{toast.msg}</span>
          ) : dirty ? (
            "저장하지 않은 변경사항이 있습니다."
          ) : (
            "모든 변경사항이 저장되었습니다."
          )}
        </span>
        <div className={s.saveActions}>
          <button type="button" className={s.resetBtn} onClick={resetAll} disabled={!dirty}>
            되돌리기
          </button>
          <button type="button" className={s.saveBtn} onClick={save} disabled={saving || !dirty}>
            {saving ? "저장 중…" : "저장하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

type TabProps = {
  draft: SiteContent;
  patch: (fn: (d: SiteContent) => void) => void;
};

/* ── 기본 정보 ───────────────────────────────────────── */
function BasicTab({ draft, patch }: TabProps) {
  const { site, nav } = draft;
  return (
    <div className={s.panel}>
      <p className={s.panelIntro}>
        한의원 이름·연락처와 사이트 곳곳에 쓰이는 외부 링크입니다.
      </p>

      <Group title="한의원 정보">
        <TextField
          label="한의원 이름"
          value={site.name}
          onChange={(v) => patch((d) => void (d.site.name = v))}
        />
        <TextField
          label="한 줄 소개(태그라인)"
          value={site.tagline}
          onChange={(v) => patch((d) => void (d.site.tagline = v))}
        />
        <TextField
          label="대표 전화번호"
          hint="예: 010-9813-0125 — 전화 걸기 링크는 자동 생성됩니다."
          value={site.phone}
          onChange={(v) => patch((d) => void (d.site.phone = v))}
        />
      </Group>

      <Group
        title="외부 링크"
        hint="아직 준비되지 않은 링크는 # 로 두면 됩니다."
      >
        <TextField
          label="카카오톡 채널 URL"
          value={site.links.kakao}
          onChange={(v) => patch((d) => void (d.site.links.kakao = v))}
        />
        <TextField
          label="유튜브 채널 URL"
          value={site.links.youtube}
          onChange={(v) => patch((d) => void (d.site.links.youtube = v))}
        />
        <TextField
          label="온라인 상담 URL"
          value={site.links.consult}
          onChange={(v) => patch((d) => void (d.site.links.consult = v))}
        />
        <TextField
          label="네이버 블로그 URL"
          value={site.links.blog}
          onChange={(v) => patch((d) => void (d.site.links.blog = v))}
        />
        <TextField
          label="인스타그램 URL"
          value={site.links.instagram}
          onChange={(v) => patch((d) => void (d.site.links.instagram = v))}
        />
      </Group>

      <Group
        title="상단 메뉴"
        hint="위치(링크)는 페이지 내 구역을 가리킵니다. 특별한 이유가 없으면 그대로 두세요."
      >
        <Repeater
          label="메뉴 항목"
          items={nav}
          min={1}
          makeEmpty={() => ({ label: "", href: "#" })}
          itemLabel={(it) => it.label || "메뉴"}
          onChange={(v) => patch((d) => void (d.nav = v))}
          renderItem={(it, update) => (
            <>
              <TextField
                label="메뉴 이름"
                value={it.label}
                onChange={(v) => update({ label: v })}
              />
              <TextField
                label="위치(링크)"
                value={it.href}
                onChange={(v) => update({ href: v })}
              />
            </>
          )}
        />
      </Group>
    </div>
  );
}

/* ── 히어로 ──────────────────────────────────────────── */
function HeroTab({ draft, patch }: TabProps) {
  const { hero } = draft;
  return (
    <div className={s.panel}>
      <p className={s.panelIntro}>
        홈페이지 첫 화면입니다. 진료과목 버튼을 누르기 전 기본 화면과, 각 버튼을
        눌렀을 때 바뀌는 화면을 따로 설정합니다.
      </p>

      <Group title="기본 화면">
        <TextAreaField
          label="큰 제목"
          hint={BREAK_HINT}
          value={hero.default.title}
          onChange={(v) => patch((d) => void (d.hero.default.title = v))}
        />
        <StringListField
          label="설명 문구(줄별)"
          hint={BREAK_HINT}
          values={hero.default.subtitle}
          multiline
          onChange={(v) => patch((d) => void (d.hero.default.subtitle = v))}
        />
        <ImageField
          label="배경 이미지"
          value={hero.default.image}
          onChange={(v) => patch((d) => void (d.hero.default.image = v))}
        />
        <TextField
          label="버튼 문구"
          value={hero.default.cta?.label ?? ""}
          onChange={(v) =>
            patch((d) => {
              d.hero.default.cta = { ...(d.hero.default.cta ?? { href: "#" }), label: v };
            })
          }
        />
        <TextField
          label="버튼 링크"
          value={hero.default.cta?.href ?? ""}
          onChange={(v) =>
            patch((d) => {
              d.hero.default.cta = { ...(d.hero.default.cta ?? { label: "" }), href: v };
            })
          }
        />
      </Group>

      {(["stomach", "diet"] as const).map((key) => {
        const t = hero.tracks[key];
        const ko = key === "stomach" ? "위장 치료 버튼" : "다이어트 버튼";
        return (
          <Group key={key} title={`${ko} 화면`}>
            <TextField
              label="버튼에 표시할 이름"
              value={t.buttonLabel}
              onChange={(v) => patch((d) => void (d.hero.tracks[key].buttonLabel = v))}
            />
            <TextAreaField
              label="큰 제목"
              hint={BREAK_HINT}
              value={t.title}
              onChange={(v) => patch((d) => void (d.hero.tracks[key].title = v))}
            />
            <StringListField
              label="설명 문구(줄별)"
              hint={BREAK_HINT}
              values={t.subtitle}
              multiline
              onChange={(v) => patch((d) => void (d.hero.tracks[key].subtitle = v))}
            />
            <ImageField
              label="배경 이미지"
              value={t.image}
              onChange={(v) => patch((d) => void (d.hero.tracks[key].image = v))}
            />
            <TextField
              label="버튼 문구"
              value={t.cta?.label ?? ""}
              onChange={(v) =>
                patch((d) => {
                  d.hero.tracks[key].cta = {
                    ...(d.hero.tracks[key].cta ?? { href: "#" }),
                    label: v,
                  };
                })
              }
            />
            <TextField
              label="버튼 링크"
              hint="같은 페이지 내 상세 구역(#track-a / #track-b)을 가리킵니다."
              value={t.cta?.href ?? ""}
              onChange={(v) =>
                patch((d) => {
                  d.hero.tracks[key].cta = {
                    ...(d.hero.tracks[key].cta ?? { label: "" }),
                    href: v,
                  };
                })
              }
            />
          </Group>
        );
      })}
    </div>
  );
}

/* ── 진료과목 개요 ───────────────────────────────────── */
function TreatmentTab({ draft, patch }: TabProps) {
  const { treatment } = draft;
  return (
    <div className={s.panel}>
      <Group title="섹션 제목">
        <TextField
          label="작은 제목(kicker)"
          value={treatment.kicker}
          onChange={(v) => patch((d) => void (d.treatment.kicker = v))}
        />
        <TextField
          label="큰 제목"
          value={treatment.title}
          onChange={(v) => patch((d) => void (d.treatment.title = v))}
        />
      </Group>

      <Group title="진료과목 카드">
        <Repeater
          label="카드"
          items={treatment.tracks}
          min={1}
          makeEmpty={() => ({
            id: "",
            label: "",
            title: "",
            desc: "",
            caption: "",
            image: "",
            href: "#",
            cta: "자세히보기",
          })}
          itemLabel={(it) => it.title || "카드"}
          onChange={(v) => patch((d) => void (d.treatment.tracks = v))}
          renderItem={(it, update) => (
            <>
              <TextField label="작은 라벨" value={it.label} onChange={(v) => update({ label: v })} />
              <TextField label="제목" value={it.title} onChange={(v) => update({ title: v })} />
              <TextAreaField
                label="설명"
                value={it.desc}
                onChange={(v) => update({ desc: v })}
              />
              <TextField
                label="이미지 캡션"
                value={it.caption}
                onChange={(v) => update({ caption: v })}
              />
              <ImageField
                label="카드 이미지"
                value={it.image}
                onChange={(v) => update({ image: v })}
              />
              <TextField
                label="버튼 문구"
                value={it.cta}
                onChange={(v) => update({ cta: v })}
              />
            </>
          )}
        />
      </Group>
    </div>
  );
}

/* ── 위장 상세 ───────────────────────────────────────── */
function TrackATab({ draft, patch }: TabProps) {
  const { trackA } = draft;
  return (
    <div className={s.panel}>
      <Group title="도입부">
        <TextField
          label="작은 제목"
          value={trackA.kicker}
          onChange={(v) => patch((d) => void (d.trackA.kicker = v))}
        />
        <TextAreaField
          label="큰 제목"
          value={trackA.title}
          onChange={(v) => patch((d) => void (d.trackA.title = v))}
        />
        <TextAreaField
          label="소개 문단"
          value={trackA.lead}
          onChange={(v) => patch((d) => void (d.trackA.lead = v))}
        />
      </Group>

      <Group title="원인 설명(문답)">
        <TextField
          label="블록 제목"
          value={trackA.causesTitle}
          onChange={(v) => patch((d) => void (d.trackA.causesTitle = v))}
        />
        <Repeater
          label="문답 항목"
          items={trackA.causes}
          makeEmpty={() => ({ q: "", a: [""] })}
          itemLabel={(it) => it.q || "질문"}
          onChange={(v) => patch((d) => void (d.trackA.causes = v))}
          renderItem={(it, update) => (
            <>
              <TextField label="질문" value={it.q} onChange={(v) => update({ q: v })} />
              <StringListField
                label="답변(줄별)"
                values={it.a}
                multiline
                onChange={(v) => update({ a: v })}
              />
            </>
          )}
        />
      </Group>

      <Group title="전후 확인(내시경)">
        <TextField
          label="제목"
          value={trackA.proof.title}
          onChange={(v) => patch((d) => void (d.trackA.proof.title = v))}
        />
        <TextAreaField
          label="설명"
          value={trackA.proof.body}
          onChange={(v) => patch((d) => void (d.trackA.proof.body = v))}
        />
        <TextField
          label="이미지 캡션"
          value={trackA.proof.caption}
          onChange={(v) => patch((d) => void (d.trackA.proof.caption = v))}
        />
        <Repeater
          label="전후 사진"
          hint="로그인한 방문자에게만 보입니다(의료법). 사진이 없으면 라벨만 표시됩니다."
          items={trackA.proof.shots}
          makeEmpty={() => ({ label: "", src: "" })}
          itemLabel={(it) => it.label || "사진"}
          onChange={(v) => patch((d) => void (d.trackA.proof.shots = v))}
          renderItem={(it, update) => (
            <>
              <TextField label="라벨" value={it.label} onChange={(v) => update({ label: v })} />
              <ImageField label="사진" value={it.src} onChange={(v) => update({ src: v })} />
            </>
          )}
        />
      </Group>

      <Group title="주의 문구">
        <TextAreaField
          label="하단 고지"
          value={trackA.disclaimer}
          onChange={(v) => patch((d) => void (d.trackA.disclaimer = v))}
        />
      </Group>
    </div>
  );
}

/* ── 다이어트 상세 ───────────────────────────────────── */
function TrackBTab({ draft, patch }: TabProps) {
  const { trackB } = draft;
  return (
    <div className={s.panel}>
      <Group title="도입부">
        <TextField
          label="작은 제목"
          value={trackB.kicker}
          onChange={(v) => patch((d) => void (d.trackB.kicker = v))}
        />
        <TextAreaField
          label="큰 제목"
          value={trackB.title}
          onChange={(v) => patch((d) => void (d.trackB.title = v))}
        />
        <TextAreaField
          label="소개 문단"
          hint={BREAK_HINT}
          value={trackB.lead}
          onChange={(v) => patch((d) => void (d.trackB.lead = v))}
        />
      </Group>

      <Group title="한약 작용">
        <TextField
          label="블록 제목"
          value={trackB.effectsTitle}
          onChange={(v) => patch((d) => void (d.trackB.effectsTitle = v))}
        />
        <Repeater
          label="작용 항목"
          items={trackB.effects}
          makeEmpty={() => ({ term: "", desc: "" })}
          itemLabel={(it) => it.term || "작용"}
          onChange={(v) => patch((d) => void (d.trackB.effects = v))}
          renderItem={(it, update) => (
            <>
              <TextField label="이름" value={it.term} onChange={(v) => update({ term: v })} />
              <TextAreaField
                label="설명"
                value={it.desc}
                onChange={(v) => update({ desc: v })}
              />
            </>
          )}
        />
      </Group>

      <Group title="맞춤 처방 배너">
        <TextField
          label="작은 제목"
          value={trackB.prescription.kicker}
          onChange={(v) => patch((d) => void (d.trackB.prescription.kicker = v))}
        />
        <TextAreaField
          label="큰 제목"
          value={trackB.prescription.title}
          onChange={(v) => patch((d) => void (d.trackB.prescription.title = v))}
        />
        <TextAreaField
          label="본문"
          value={trackB.prescription.body}
          onChange={(v) => patch((d) => void (d.trackB.prescription.body = v))}
        />
        <TextField
          label="작은 안내"
          value={trackB.prescription.note}
          onChange={(v) => patch((d) => void (d.trackB.prescription.note = v))}
        />
      </Group>

      <Group title="전후 확인(인바디)">
        <TextField
          label="제목"
          value={trackB.proof.title}
          onChange={(v) => patch((d) => void (d.trackB.proof.title = v))}
        />
        <TextAreaField
          label="설명"
          value={trackB.proof.body}
          onChange={(v) => patch((d) => void (d.trackB.proof.body = v))}
        />
        <TextField
          label="이미지 캡션"
          value={trackB.proof.caption}
          onChange={(v) => patch((d) => void (d.trackB.proof.caption = v))}
        />
        <Repeater
          label="전후 사진"
          hint="로그인한 방문자에게만 보입니다(의료법)."
          items={trackB.proof.shots}
          makeEmpty={() => ({ label: "", src: "" })}
          itemLabel={(it) => it.label || "사진"}
          onChange={(v) => patch((d) => void (d.trackB.proof.shots = v))}
          renderItem={(it, update) => (
            <>
              <TextField label="라벨" value={it.label} onChange={(v) => update({ label: v })} />
              <ImageField label="사진" value={it.src} onChange={(v) => update({ src: v })} />
            </>
          )}
        />
      </Group>

      <Group title="주의 문구">
        <TextAreaField
          label="하단 고지"
          value={trackB.disclaimer}
          onChange={(v) => patch((d) => void (d.trackB.disclaimer = v))}
        />
      </Group>
    </div>
  );
}

/* ── 전후사진 문구 ───────────────────────────────────── */
function PhotoGateTab({ draft, patch }: TabProps) {
  const { photoGate } = draft;
  const f = (key: keyof typeof photoGate, label: string, area = false) =>
    area ? (
      <TextAreaField
        key={key}
        label={label}
        value={photoGate[key]}
        onChange={(v) => patch((d) => void (d.photoGate[key] = v))}
      />
    ) : (
      <TextField
        key={key}
        label={label}
        value={photoGate[key]}
        onChange={(v) => patch((d) => void (d.photoGate[key] = v))}
      />
    );
  return (
    <div className={s.panel}>
      <p className={s.panelIntro}>
        치료 전후 사진 열람 게이트(로그인 안내)에 쓰이는 문구입니다.
      </p>
      <Group title="잠김 상태 문구">
        {f("lockedTitle", "제목")}
        {f("lockedBody", "설명", true)}
        {f("loginLabel", "로그인 버튼 문구")}
        {f("cardLockedText", "카드 위 안내 문구", true)}
      </Group>
      <Group title="열람 상태 문구">
        {f("unlockedNote", "열람 중 표시")}
        {f("logoutLabel", "열람 종료 버튼")}
      </Group>
    </div>
  );
}

/* ── 원장 소개 ───────────────────────────────────────── */
function DoctorTab({ draft, patch }: TabProps) {
  const { doctor } = draft;
  return (
    <div className={s.panel}>
      <Group title="소개 문구">
        <TextField
          label="태그라인"
          value={doctor.tagline}
          onChange={(v) => patch((d) => void (d.doctor.tagline = v))}
        />
        <StringListField
          label="진료 철학(줄별)"
          values={doctor.philosophy}
          onChange={(v) => patch((d) => void (d.doctor.philosophy = v))}
        />
        <TextField
          label="영문 라벨"
          value={doctor.label}
          onChange={(v) => patch((d) => void (d.doctor.label = v))}
        />
        <StringListField
          label="보조 문구(줄별)"
          values={doctor.note}
          onChange={(v) => patch((d) => void (d.doctor.note = v))}
        />
      </Group>

      <Group title="원장 정보">
        <TextField
          label="이름/직함"
          value={doctor.name}
          onChange={(v) => patch((d) => void (d.doctor.name = v))}
        />
        <ImageField
          label="원장 사진"
          value={doctor.photo}
          onChange={(v) => patch((d) => void (d.doctor.photo = v))}
        />
        <StringListField
          label="약력(줄별)"
          values={doctor.career}
          onChange={(v) => patch((d) => void (d.doctor.career = v))}
        />
        <TextAreaField
          label="푸터 문구"
          value={doctor.footer}
          onChange={(v) => patch((d) => void (d.doctor.footer = v))}
        />
      </Group>

      <Group title="외부 채널 버튼">
        <Repeater
          label="채널"
          items={doctor.links}
          makeEmpty={() => ({ label: "", href: "", icon: "" })}
          itemLabel={(it) => it.label || "채널"}
          onChange={(v) => patch((d) => void (d.doctor.links = v))}
          renderItem={(it, update) => (
            <>
              <TextField label="이름" value={it.label} onChange={(v) => update({ label: v })} />
              <TextField label="링크" value={it.href} onChange={(v) => update({ href: v })} />
              <ImageField label="아이콘" value={it.icon} onChange={(v) => update({ icon: v })} />
            </>
          )}
        />
      </Group>
    </div>
  );
}

/* ── 오시는 길 ───────────────────────────────────────── */
function LocationTab({ draft, patch }: TabProps) {
  const { location } = draft;
  return (
    <div className={s.panel}>
      <Group title="섹션 제목 / 주소">
        <TextField
          label="작은 제목"
          value={location.kicker}
          onChange={(v) => patch((d) => void (d.location.kicker = v))}
        />
        <TextField
          label="큰 제목"
          value={location.title}
          onChange={(v) => patch((d) => void (d.location.title = v))}
        />
        <TextAreaField
          label="주소"
          value={location.address}
          onChange={(v) => patch((d) => void (d.location.address = v))}
        />
        <TextField
          label="주소 보조 문구"
          value={location.addressNote}
          onChange={(v) => patch((d) => void (d.location.addressNote = v))}
        />
      </Group>

      <Group title="진료 시간">
        <Repeater
          label="시간 항목"
          items={location.hours}
          makeEmpty={() => ({ day: "", time: "" })}
          itemLabel={(it) => it.day || "요일"}
          onChange={(v) => patch((d) => void (d.location.hours = v))}
          renderItem={(it, update) => (
            <>
              <TextField label="구분" value={it.day} onChange={(v) => update({ day: v })} />
              <TextField label="시간" value={it.time} onChange={(v) => update({ time: v })} />
            </>
          )}
        />
      </Group>

      <Group title="지도">
        <TextAreaField
          label="지도 임베드 코드"
          hint="네이버지도/구글지도는 '지도 퍼가기'의 iframe src 주소만, 카카오맵은 '지도 퍼가기' 코드 전체(스크립트 포함)를 그대로 붙여넣으세요. 비우면 안내 문구가 표시됩니다."
          value={location.mapEmbedCode}
          onChange={(v) => patch((d) => void (d.location.mapEmbedCode = v))}
        />
      </Group>
    </div>
  );
}

/* ── 푸터 ────────────────────────────────────────────── */
function FooterTab({ draft, patch }: TabProps) {
  const { footer } = draft;
  return (
    <div className={s.panel}>
      <p className={s.panelIntro}>
        상호명·주소·대표번호는 "기본 정보"·"오시는 길" 탭 값을 그대로 가져다 씁니다.
      </p>

      <Group title="사업자 정보">
        <TextField
          label="진료과목"
          value={footer.bizDept}
          onChange={(v) => patch((d) => void (d.footer.bizDept = v))}
        />
        <TextField
          label="대표자"
          value={footer.representative}
          onChange={(v) => patch((d) => void (d.footer.representative = v))}
        />
        <TextField
          label="사업자등록번호"
          value={footer.bizNumber}
          onChange={(v) => patch((d) => void (d.footer.bizNumber = v))}
        />
      </Group>

      <Group title="하단 링크" hint="약관·비급여 항목 등 안내 페이지가 준비되면 링크만 채워주세요.">
        <Repeater
          label="링크 목록"
          items={footer.links}
          makeEmpty={() => ({ label: "", href: "#" })}
          itemLabel={(it) => it.label || "링크"}
          onChange={(v) => patch((d) => void (d.footer.links = v))}
          renderItem={(it, update) => (
            <>
              <TextField label="문구" value={it.label} onChange={(v) => update({ label: v })} />
              <TextField label="URL" value={it.href} onChange={(v) => update({ href: v })} />
            </>
          )}
        />
      </Group>

      <Group title="하단 안내 문구">
        <StringListField
          label="법적 고지 문구"
          hint="치료 전후 사진·효과에 대한 안내 문구입니다. 줄 단위로 추가/삭제할 수 있습니다."
          values={footer.disclaimer}
          onChange={(v) => patch((d) => void (d.footer.disclaimer = v))}
          multiline
        />
        <TextField
          label="저작권 표시 이름"
          hint="© 연도(자동) + 이 이름 + . All rights reserved. 형태로 표시됩니다."
          value={footer.copyrightName}
          onChange={(v) => patch((d) => void (d.footer.copyrightName = v))}
        />
      </Group>
    </div>
  );
}
