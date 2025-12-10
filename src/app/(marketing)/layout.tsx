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
            <Image
              src="/logos/ready_steady_math_trophy_transparent.png"
              alt="Ready Steady Math logo"
              width={170}
              height={40}
              priority
            />
          </Link>
          <nav className={styles.nav}>
            <Link href="/about" className={styles.navLink}>About</Link>
            <Link href="/pricing" className={styles.navLink}>Pricing</Link>
            <Link href="/kids" className={styles.navLink}>For Kids</Link>
            <Link href="/parents" className={styles.navLink}>For Parents</Link>
            <Link href="/teachers" className={styles.navLink}>For Teachers</Link>
            <Link href="/grown-ups" className={styles.navLink}>Grown-Ups</Link>
            <span className={styles.cta}>
              <LinkButton href="/dashboard" variant="secondary" size="md" className={styles.navCtaSecondary}>My Dashboard</LinkButton>
              <LinkButton href="/play" size="md" className={styles.navCta}>Start Playing</LinkButton>
            </span>
          </nav>
        </div>
      </header>

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerMeta}>
            <Image
              src="/logos/ready_steady_math_trophy_transparent.png"
              alt="Ready Steady Math logo"
              width={170}
              height={40}
            />
            <span>Fast, playful math practice - built for kids, trusted by grown-ups.</span>
          </div>
          <div className={styles.footerLinks}>
            <Link href="/about" className={styles.footerLink}>About</Link>
            <Link href="/pricing" className={styles.footerLink}>Pricing</Link>
            <Link href="/kids" className={styles.footerLink}>For Kids</Link>
            <Link href="/parents" className={styles.footerLink}>For Parents</Link>
            <Link href="/teachers" className={styles.footerLink}>For Teachers</Link>
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
