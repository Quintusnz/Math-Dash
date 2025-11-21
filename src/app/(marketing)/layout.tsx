import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import styles from "./layout.module.css";
import { LinkButton } from "@/components/ui/Button";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.brand}>
            <Image src="/logos/logo-icon.png" alt="Math Dash lightning icon" width={36} height={36} />
            Math Dash
          </Link>
          <nav className={styles.nav}>
            <Link href="/about" className={styles.navLink}>About</Link>
            <Link href="/pricing" className={styles.navLink}>Pricing</Link>
            <Link href="/grown-ups" className={styles.navLink}>Grown-Ups</Link>
            <Link href="/play" className={styles.navLink}>Play</Link>
            <span className={styles.cta}>
              <LinkButton href="/play" size="md">Start Playing</LinkButton>
            </span>
          </nav>
        </div>
      </header>

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerMeta}>
            <Image src="/logos/logo-main.png" alt="Math Dash logo" width={96} height={30} />
            <span>Fast, playful math practice—built for kids, trusted by grown-ups.</span>
          </div>
          <div className={styles.footerLinks}>
            <Link href="/about" className={styles.footerLink}>About</Link>
            <Link href="/pricing" className={styles.footerLink}>Pricing</Link>
            <Link href="/grown-ups" className={styles.footerLink}>Grown-Ups</Link>
            <Link href="/play" className={styles.footerLink}>Play</Link>
          </div>
          <div className={styles.footerMeta}>
            <span>Built with accessible design tokens and AA contrast.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
