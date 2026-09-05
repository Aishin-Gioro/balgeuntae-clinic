"use client";

import { trackB } from "@/lib/site";
import { useHeroTrack } from "./HeroTrackContext";
import styles from "./PrescriptionBanner.module.css";

export function PrescriptionBanner() {
  const { track } = useHeroTrack();
  if (!track) return null;

  return (
    <section className={styles.section}>
      <div className={styles.banner}>
        <p className={styles.kicker}>{trackB.prescription.kicker}</p>
        <h2 className={styles.title}>{trackB.prescription.title}</h2>
        <p className={styles.body}>{trackB.prescription.body}</p>
        <p className={styles.note}>{trackB.prescription.note}</p>
      </div>
    </section>
  );
}
