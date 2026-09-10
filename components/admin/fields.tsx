"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import s from "./editor.module.css";

/* ── 그룹 카드 ─────────────────────────────────────────── */
export function Group({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className={s.group}>
      <h3 className={s.groupTitle}>{title}</h3>
      {hint && <p className={s.groupHint}>{hint}</p>}
      {children}
    </section>
  );
}

function FieldShell({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className={s.field}>
      <label className={s.fieldLabel} htmlFor={htmlFor}>
        {label}
      </label>
      {hint && <span className={s.fieldHint}>{hint}</span>}
      {children}
    </div>
  );
}

/* ── 한 줄 텍스트 ─────────────────────────────────────── */
export function TextField({
  label,
  hint,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <FieldShell label={label} hint={hint} htmlFor={id}>
      <input
        id={id}
        className={s.input}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </FieldShell>
  );
}

/* ── 여러 줄 텍스트 (줄바꿈 = Enter) ─────────────────── */
export function TextAreaField({
  label,
  hint,
  value,
  onChange,
  rows,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  const id = useId();
  return (
    <FieldShell label={label} hint={hint} htmlFor={id}>
      <textarea
        id={id}
        className={s.textarea}
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
      />
    </FieldShell>
  );
}

/* ── 문자열 목록 (줄 단위 추가/삭제/이동) ───────────── */
export function StringListField({
  label,
  hint,
  values,
  onChange,
  multiline,
  addLabel = "+ 줄 추가",
}: {
  label: string;
  hint?: string;
  values: string[];
  onChange: (v: string[]) => void;
  multiline?: boolean;
  addLabel?: string;
}) {
  function set(i: number, v: string) {
    const next = values.slice();
    next[i] = v;
    onChange(next);
  }
  function remove(i: number) {
    onChange(values.filter((_, idx) => idx !== i));
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= values.length) return;
    const next = values.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }
  return (
    <FieldShell label={label} hint={hint}>
      <div className={s.rows}>
        {values.map((v, i) => (
          <div className={s.row} key={i}>
            {multiline ? (
              <textarea
                className={s.textarea}
                value={v}
                rows={2}
                onChange={(e) => set(i, e.target.value)}
              />
            ) : (
              <input
                className={s.input}
                value={v}
                onChange={(e) => set(i, e.target.value)}
              />
            )}
            <button
              type="button"
              className={s.iconBtn}
              title="위로"
              onClick={() => move(i, -1)}
            >
              ↑
            </button>
            <button
              type="button"
              className={s.iconBtn}
              title="아래로"
              onClick={() => move(i, 1)}
            >
              ↓
            </button>
            <button
              type="button"
              className={s.iconBtn}
              title="삭제"
              onClick={() => remove(i)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        className={s.addBtn}
        onClick={() => onChange([...values, ""])}
      >
        {addLabel}
      </button>
    </FieldShell>
  );
}

/* ── 반복 항목 (객체 배열) ───────────────────────────── */
export function Repeater<T>({
  label,
  hint,
  items,
  onChange,
  makeEmpty,
  itemLabel,
  renderItem,
  addLabel = "+ 항목 추가",
  min = 0,
}: {
  label: string;
  hint?: string;
  items: T[];
  onChange: (v: T[]) => void;
  makeEmpty: () => T;
  itemLabel: (item: T, i: number) => string;
  renderItem: (item: T, update: (patch: Partial<T>) => void, i: number) => ReactNode;
  addLabel?: string;
  min?: number;
}) {
  function update(i: number, patch: Partial<T>) {
    const next = items.slice();
    next[i] = { ...next[i], ...patch };
    onChange(next);
  }
  function remove(i: number) {
    if (items.length <= min) return;
    onChange(items.filter((_, idx) => idx !== i));
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = items.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }
  return (
    <FieldShell label={label} hint={hint}>
      <div className={s.rows}>
        {items.map((item, i) => (
          <div className={s.repeatItem} key={i}>
            <div className={s.repeatHead}>
              <span className={s.repeatTitle}>{itemLabel(item, i)}</span>
              <span>
                <button
                  type="button"
                  className={s.iconBtn}
                  title="위로"
                  onClick={() => move(i, -1)}
                >
                  ↑
                </button>{" "}
                <button
                  type="button"
                  className={s.iconBtn}
                  title="아래로"
                  onClick={() => move(i, 1)}
                >
                  ↓
                </button>{" "}
                {items.length > min && (
                  <button
                    type="button"
                    className={s.iconBtn}
                    title="삭제"
                    onClick={() => remove(i)}
                  >
                    ×
                  </button>
                )}
              </span>
            </div>
            {renderItem(item, (patch) => update(i, patch), i)}
          </div>
        ))}
      </div>
      <button
        type="button"
        className={s.addBtn}
        onClick={() => onChange([...items, makeEmpty()])}
      >
        {addLabel}
      </button>
    </FieldShell>
  );
}

/* ── 이미지 (업로드 + 경로) ──────────────────────────── */
export function ImageField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const id = useId();

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "업로드에 실패했습니다.");
        return;
      }
      onChange(data.url);
    } catch {
      setError("업로드 중 오류가 발생했습니다.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <FieldShell label={label} hint={hint} htmlFor={id}>
      <div className={s.image}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={s.thumb} src={value} alt="" />
        ) : (
          <span className={`${s.thumb} ${s.thumbEmpty}`}>미지정</span>
        )}
        <div className={s.imageCol}>
          <div className={s.uploadRow}>
            <button
              type="button"
              className={s.fileBtn}
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            >
              {busy ? "업로드 중…" : "사진 올리기"}
            </button>
            {value && (
              <button
                type="button"
                className={s.fileBtn}
                onClick={() => onChange("")}
              >
                제거
              </button>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={onFile}
            />
          </div>
          <input
            id={id}
            className={s.input}
            value={value}
            placeholder="/images/파일명.webp 또는 https://..."
            onChange={(e) => onChange(e.target.value)}
          />
          {error && <span className={s.fieldHint}>{error}</span>}
        </div>
      </div>
    </FieldShell>
  );
}
