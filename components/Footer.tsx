import { getContent } from "@/lib/content";
import { BrandMark } from "./icons";
import styles from "./Footer.module.css";

export async function Footer() {
  const { site, location, footer } = await getContent();
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <BrandMark className={styles.brandMark} />
            <span className={styles.brandName}>{site.name}</span>
          </div>
          {footer.links.length > 0 && (
            <nav className={styles.links} aria-label="정책 및 안내">
              {footer.links.map((link) => (
                <a key={link.label} href={link.href}>
                  {link.label}
                </a>
              ))}
            </nav>
          )}
        </div>

        <div className={styles.divider} aria-hidden="true" />

        <div className={styles.info}>
          <span>
            상호명 <b>{site.name}</b>
          </span>
          <span>진료과목: {footer.bizDept}</span>
          <span>
            대표자 <b>{footer.representative}</b>
          </span>
          <span>
            대표번호 <b>{site.phone}</b>
          </span>
          <span>
            사업자등록번호 <b>{footer.bizNumber}</b>
          </span>
        </div>
        <p className={styles.address}>주소 {location.address}</p>

        <div className={styles.disclaimer}>
          {footer.disclaimer.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>

        <p className={styles.copyright}>
          © {year} {footer.copyrightName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
