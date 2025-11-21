import Image from "next/image";
import styles from "./page.module.css";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.badge}>Built for kids. Trusted by grown-ups.</span>
          <h1 className={styles.title}>Lightning-fast math practice in 60-second sprints.</h1>
          <p className={styles.subtitle}>
            Adaptive drills, instant feedback, and progress insights. Math Dash keeps kids engaged while parents and teachers track growth with confidence.
          </p>
          <div className={styles.heroActions}>
            <LinkButton href="/play" size="lg">Start a session</LinkButton>
            <LinkButton href="#how" variant="secondary" size="lg">
              See how it works
            </LinkButton>
          </div>
          <div className={styles.foldSeparator} aria-hidden="true">
            <div className={styles.orb} />
            <div className={styles.orbSecondary} />
          </div>
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Avg. session time</span>
              <span className={styles.statValue}>60s</span>
              <span className={styles.statNote}>High-intensity, low-friction drills</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Offline-first</span>
              <span className={styles.statValue}>100%</span>
              <span className={styles.statNote}>Keeps working without a connection</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Parent controls</span>
              <span className={styles.statValue}>Built-in</span>
              <span className={styles.statNote}>Grown-ups gate & premium toggle</span>
            </div>
          </div>
        </div>
        <div className={styles.heroLogoWrap}>
          <Image src="/logos/logo-3d.png" alt="Math Dash 3D logo" width={360} height={200} className={styles.heroLogo} />
        </div>
      </section>

      <section id="how">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Why kids stay engaged</h2>
          <p className={styles.sectionSubtitle}>Micro-sessions, instant feedback, and positive reinforcement keep motivation high without overwhelming younger learners.</p>
        </div>
        <div className={styles.cardGrid}>
          <Card className={styles.tile} elevated>
            <h3>Adaptive pacing</h3>
            <p>Questions ramp with accuracy and speed, keeping the sweet spot between confidence and challenge.</p>
          </Card>
          <Card className={styles.tile} elevated>
            <h3>Celebratory feedback</h3>
            <p>Friendly animations and achievement badges reward progress without distraction.</p>
          </Card>
          <Card className={styles.tile} elevated>
            <h3>Kid-safe UI</h3>
            <p>Large tap targets, reduced clutter, and clear focus states support young hands and eyes.</p>
          </Card>
        </div>
      </section>

      <section>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>What grown-ups get</h2>
          <p className={styles.sectionSubtitle}>Transparent insights and control without getting in the way of play.</p>
        </div>
        <div className={styles.cardGrid}>
          <Card className={styles.tile}>
            <h3>Progress at a glance</h3>
            <p>Accuracy, streaks, and skill radar so you can see where to support.</p>
          </Card>
          <Card className={styles.tile}>
            <h3>Profiles & privacy</h3>
            <p>Multiple profiles, offline-first storage, and a grown-ups gate to protect settings.</p>
          </Card>
          <Card className={styles.tile}>
            <h3>Sync when ready</h3>
            <p>Local-first by default with optional sync so families stay in control of data.</p>
          </Card>
        </div>
      </section>

      <section className={styles.ctaBanner}>
        <div>
          <h3>Ready to dash?</h3>
          <p>Fire up a 60-second session or explore pricing—both with AA contrast and a kid-friendly flow.</p>
        </div>
        <div className={styles.ctaActions}>
          <LinkButton href="/play" variant="secondary" size="lg">Start Playing</LinkButton>
          <LinkButton href="/pricing" size="lg">View Pricing</LinkButton>
        </div>
      </section>
    </div>
  );
}
