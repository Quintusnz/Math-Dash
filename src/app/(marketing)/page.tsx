import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import { LinkButton } from "@/components/ui/Button";
import { Zap, Trophy, Flame, ShieldCheck, ChartBar, Lock, Cloud, Plus, Minus, X, Divide, Gamepad2, Heart, GraduationCap, Rocket, Star, CheckCircle2, Users, Sparkles } from "lucide-react";

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
            <span className={styles.badgeDot} />
            Mental Math Practice for Ages 6-11
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
            High-speed drills. Instant feedback. Zero distractions. 
            Build fluency and confidence through play.
          </p>
          
          <div className={styles.heroActions}>
            <LinkButton href="/play" size="md" className={styles.primaryBtn}>
              Start a Session
            </LinkButton>
            <LinkButton href="/how-it-works" variant="secondary" size="md" className={styles.secondaryBtn}>
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
            <LinkButton href="/play" size="md" className={styles.ctaPrimary}>
              Start Playing Now
            </LinkButton>
            <LinkButton href="/pricing" variant="secondary" size="md" className={styles.ctaSecondary}>
              View Plans
            </LinkButton>
          </div>
        </div>
      </section>
    </div>
  );
}
