import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { LoginForm } from "./LoginForm";
import styles from "../admin.module.css";

export const metadata = { title: "관리자 로그인", robots: { index: false } };

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");

  return (
    <main className={styles.loginWrap}>
      <div className={styles.loginCard}>
        <h1 className={styles.loginTitle}>밝은태 한의원 관리자</h1>
        <p className={styles.loginDesc}>
          홈페이지 문구와 사진을 수정하려면 비밀번호를 입력하세요.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
