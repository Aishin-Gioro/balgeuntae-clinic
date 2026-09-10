import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import styles from "../admin.module.css";

export const metadata = { title: "관리자", robots: { index: false } };

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAdmin())) redirect("/admin/login");

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <span className={styles.brand}>밝은태 관리자</span>
        <div className={styles.topbarActions}>
          <a className={styles.ghostBtn} href="/" target="_blank" rel="noopener">
            홈페이지 보기 ↗
          </a>
          <a className={styles.ghostBtn} href="/api/admin/logout">
            로그아웃
          </a>
        </div>
      </header>
      {children}
    </div>
  );
}
