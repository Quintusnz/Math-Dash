import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import { LinkButton } from "@/components/ui/Button";
import { ShieldCheck, Lock, Plus, Minus, X, Divide, Gamepad2, Heart, GraduationCap, Rocket, Star, CheckCircle2, Users, Sparkles } from "lucide-react";

const OPERATIONS = [
  { icon: Plus, label: "Addition", color: "var(--color-primary-600)" },
  { icon: Minus, label: "Subtraction", color: "var(--color-accent-coral)" },
  { icon: X, label: "Multiplication", color: "var(--color-accent-gold)" },
  { icon: Divide, label: "Division", color: "var(--color-secondary-500)" },
];

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <Sparkles size={14} className={styles.badgeIcon} />
            Free to Play • No Ads • Ages 6-11
          </div>
          <h1 className={styles.title}>
            Master Mental Math <br />
            <span className={styles.titleHighlight}>in minutes a day.</span>
          </h1>
          <div className={styles.marqueeContainer}>
            <div className={styles.marqueeTrack}>
              {[...OPERATIONS, ...OPERATIONS, ...OPERATIONS, ...OPERATIONS].map((op, i) => (
                <span key={i} className={styles.opItem} style={{ color: op.color }}>
                  <op.icon size={20} strokeWidth={3} /> {op.label}
                </span>
              ))}
            </div>
          </div>
          <p className={styles.subtitle}>
            The game-based math practice app that kids actually want to use. 
            Build speed, confidence, and fluency—no nagging required.
          </p>
          
          <div className={styles.heroActions}>
            <LinkButton href="/play" size="md" className={styles.primaryBtn}>
              <Rocket size={18} />
              Play Free Now
            </LinkButton>
            <LinkButton href="/how-it-works" variant="secondary" size="md" className={styles.secondaryBtn}>
              See How It Works
            </LinkButton>
          </div>

          {/* Trust Badges Row */}
          <div className={styles.trustBadges}>
            <div className={styles.trustBadge}>
              <ShieldCheck size={18} className={styles.trustIconShield} />
              <span>No Ads Ever</span>
            </div>
            <div className={styles.trustBadge}>
              <Lock size={18} className={styles.trustIconLock} />
              <span>Kid-Safe</span>
            </div>
            <div className={styles.trustBadge}>
              <Star size={18} className={styles.trustIconStar} />
              <span>Parent Approved</span>
            </div>
            <div className={styles.trustBadge}>
              <Users size={18} className={styles.trustIconUsers} />
              <span>10,000+ Students</span>
            </div>
          </div>
        </div>
        
        <div className={styles.heroVisual}>
          <div className={styles.heroGlow} />
          <Image 
            src="/logos/logo-3d.png" 
            alt="Math Dash 3D logo" 
            width={480} 
            height={480} 
            className={styles.heroLogo}
            priority
          />
          <Image
            src="/mascots/dashy-sprint.png"
            alt="Dashy the Squirrel ready to sprint"
            width={280}
            height={280}
            className={styles.heroMascot}
            priority
          />
        </div>
      </section>

      {/* Pricing Value Section */}
      <section className={styles.pricingValue}>
        <div className={styles.pricingValueInner}>
          <div className={styles.pricingFree}>
            <div className={styles.pricingIcon}>🎉</div>
            <div className={styles.pricingText}>
              <h3>FREE Forever</h3>
              <p>Unlimited practice • Progress tracking • No ads</p>
            </div>
          </div>
          <div className={styles.pricingDivider} />
          <div className={styles.pricingPremium}>
            <div className={styles.pricingIcon}>💎</div>
            <div className={styles.pricingText}>
              <h3>Unlock Everything — Just $6.99</h3>
              <p>One-time payment • All topics • Family profiles • No subscriptions!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cohort Selection Section */}
      <section className={styles.cohortSection}>
        <div className={styles.cohortHeader}>
          <h2 className={styles.cohortTitle}>Who&apos;s joining the adventure?</h2>
          <p className={styles.cohortSubtitle}>We&apos;ve got something special for everyone!</p>
        </div>
        
        <div className={styles.cohortGrid}>
          <Link href="/kids" className={`${styles.cohortCard} ${styles.cohortKids}`}>
            <div className={styles.cohortIconWrapper}>
              <Gamepad2 size={48} strokeWidth={2} />
            </div>
            <div className={styles.cohortContent}>
              <h3>I&apos;m a Learner!</h3>
              <p>Ready to become a math champion? Let&apos;s dash! 🚀</p>
            </div>
            <span className={styles.cohortArrow}>→</span>
          </Link>

          <Link href="/parents" className={`${styles.cohortCard} ${styles.cohortParents}`}>
            <div className={styles.cohortIconWrapper}>
              <Heart size={48} strokeWidth={2} />
            </div>
            <div className={styles.cohortContent}>
              <h3>I&apos;m a Parent</h3>
              <p>See how Math Dash helps your child build confidence</p>
            </div>
            <span className={styles.cohortArrow}>→</span>
          </Link>

          <Link href="/teachers" className={`${styles.cohortCard} ${styles.cohortTeachers}`}>
            <div className={styles.cohortIconWrapper}>
              <GraduationCap size={48} strokeWidth={2} />
            </div>
            <div className={styles.cohortContent}>
              <h3>I&apos;m a Teacher</h3>
              <p>Discover how Math Dash transforms classroom practice</p>
            </div>
            <span className={styles.cohortArrow}>→</span>
          </Link>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to dash?</h2>
          <p className={styles.ctaText}>
            Join thousands of students mastering math one sprint at a time.
          </p>
          <div className={styles.ctaButtons}>
            <LinkButton href="/play" size="md" className={styles.ctaPrimary}>
              <Rocket size={18} />
              Play Free Now
            </LinkButton>
            <LinkButton href="/pricing" variant="secondary" size="md" className={styles.ctaSecondary}>
              View Plans
            </LinkButton>
          </div>
          <div className={styles.ctaGuarantees}>
            <span><CheckCircle2 size={14} /> Free to start</span>
            <span><CheckCircle2 size={14} /> No credit card needed</span>
            <span><CheckCircle2 size={14} /> Cancel anytime</span>
          </div>
        </div>
      </section>
    </div>
  );
}
