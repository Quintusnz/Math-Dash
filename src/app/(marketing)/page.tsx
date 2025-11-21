import Image from "next/image";
import styles from "./page.module.css";
import { LinkButton } from "@/components/ui/Button";
import { Zap, Trophy, Flame, ShieldCheck, ChartBar, Lock, Cloud, Plus, Minus, X, Divide } from "lucide-react";

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            Math Practice for Ages 6-11
          </div>
          <h1 className={styles.title}>
            Master mental math in <br />
            <span className={styles.titleHighlight}>minutes a day.</span>
          </h1>
          <div className={styles.operationsList}>
            <span className={styles.opItem} style={{ color: 'var(--color-primary-600)' }}>
              <Plus size={20} strokeWidth={3} /> Addition
            </span>
            <span className={styles.opItem} style={{ color: 'var(--color-accent-coral)' }}>
              <Minus size={20} strokeWidth={3} /> Subtraction
            </span>
            <span className={styles.opItem} style={{ color: 'var(--color-accent-gold)' }}>
              <X size={20} strokeWidth={3} /> Multiplication
            </span>
            <span className={styles.opItem} style={{ color: 'var(--color-secondary-500)' }}>
              <Divide size={20} strokeWidth={3} /> Division
            </span>
          </div>
          <p className={styles.subtitle}>
            High-speed drills. Instant feedback. Zero distractions. 
            The offline-first app that builds fluency and confidence through play.
          </p>
          
          <div className={styles.heroActions}>
            <LinkButton href="/play" size="lg" className={styles.primaryBtn}>
              Start a Session
            </LinkButton>
            <LinkButton href="/how-it-works" variant="secondary" size="lg" className={styles.secondaryBtn}>
              See How It Works
            </LinkButton>
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
        </div>
      </section>

      <section id="how" className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Why kids actually want to play.</h2>
          <p className={styles.sectionSubtitle}>
            We turned math practice into a game they can win. No boring drills—just fast, fun sprints that feel great to master.
          </p>
        </div>
        
        <div className={styles.bentoGrid}>
          <div className={`${styles.bentoCard} ${styles.span2} ${styles.primary}`}>
            <div className={styles.cardContent}>
              <h3>Always the Right Challenge</h3>
              <p>Too easy? Boring. Too hard? Frustrating. Math Dash adjusts instantly to keep questions in the &quot;Goldilocks zone&quot;—just right for building speed and confidence.</p>
            </div>
            <Zap className={styles.cardIconAdaptive} strokeWidth={1.5} />
          </div>
          
          <div className={`${styles.bentoCard} ${styles.accent}`}>
            <div className={styles.cardContent}>
              <h3>Instant Wins</h3>
              <p>Blast through questions and get immediate, satisfying feedback. Every correct answer feels like a victory lap.</p>
            </div>
            <Trophy className={styles.cardIconFeedback} strokeWidth={1.5} />
          </div>
          
          <div className={styles.bentoCard}>
            <div className={styles.cardContent}>
              <h3>Build Your Streak</h3>
              <p>Watch the flame grow! Daily goals and streaks turn &quot;have to do&quot; into &quot;want to do.&quot;</p>
            </div>
            <Flame className={styles.cardIconStreak} strokeWidth={1.5} />
          </div>

          <div className={`${styles.bentoCard} ${styles.span3} ${styles.dark}`}>
            <div className={styles.cardContentRow}>
              <div>
                <h3>Safe, Clean Fun (No Ads!)</h3>
                <p>A 100% kid-safe zone. No advertisements, no tracking, and no chat. Just pure focus and fun, with a grown-ups gate for the settings.</p>
              </div>
              <ShieldCheck className={styles.cardIconPrivacy} strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.parentsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Peace of mind for grown-ups.</h2>
          <p className={styles.sectionSubtitle}>
            You stay in control with a dedicated dashboard that&apos;s hidden from the kids.
          </p>
        </div>
        
        <div className={styles.featureRow}>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>
              <ChartBar className={styles.iconPrimary} size={32} />
            </div>
            <h3>Deep Insights</h3>
            <p>Track accuracy trends and speed improvements over time.</p>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>
              <Lock className={styles.iconSecondary} size={32} />
            </div>
            <h3>Parent Gate</h3>
            <p>Settings and purchases are protected by a grown-ups only gate.</p>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>
              <Cloud className={styles.iconAccent} size={32} />
            </div>
            <h3>Optional Sync</h3>
            <p>Backup progress to the cloud only when you want to.</p>
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to dash?</h2>
          <p className={styles.ctaText}>
            Join thousands of students mastering math one sprint at a time.
          </p>
          <div className={styles.ctaButtons}>
            <LinkButton href="/play" size="lg" className={styles.ctaPrimary}>
              Start Playing Now
            </LinkButton>
            <LinkButton href="/pricing" variant="secondary" size="lg" className={styles.ctaSecondary}>
              View Plans
            </LinkButton>
          </div>
        </div>
      </section>
    </div>
  );
}
