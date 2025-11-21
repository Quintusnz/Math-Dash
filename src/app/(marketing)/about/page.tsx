import styles from "./page.module.css";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const timeline = [
  { label: "Q4 2025", text: "Offline-first Math Dash shipped with 60s drills and grown-ups gate." },
  { label: "Q1 2026", text: "Progress radar, streaks, and achievements for motivational feedback." },
  { label: "Q2 2026", text: "Custom challenge sets and richer parent insights (planned)." },
];

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1 className={styles.title}>Our mission</h1>
        <p className={styles.subtitle}>
          Make math practice feel fast, fun, and habit-forming—without sacrificing accessibility, contrast, or privacy.
        </p>
      </section>

      <section className={styles.grid}>
        <Card className={styles.card}>
          <h3>Pedagogy</h3>
          <p>Short, repeatable sprints strengthen recall and confidence. Positive feedback loops keep kids motivated.</p>
        </Card>
        <Card className={styles.card}>
          <h3>Design ethics</h3>
          <p>AA contrast, clear focus states, generous targets, and no ads. Grown-ups gate protects settings and purchases.</p>
        </Card>
        <Card className={styles.card}>
          <h3>Privacy first</h3>
          <p>Local-first storage with optional sync. Families own their data and control when to connect.</p>
        </Card>
      </section>

      <section className={styles.timeline}>
        {timeline.map((item) => (
          <div key={item.label} className={styles.timelineItem}>
            <span className={styles.badge}>{item.label}</span>
            <p>{item.text}</p>
          </div>
        ))}
      </section>

      <section className={styles.cta}>
        <div>
          <h3>Join Math Dash</h3>
          <p>Start a session for free or hop into pricing—both optimized for contrast and clarity.</p>
        </div>
        <div className={styles.ctaActions}>
          <LinkButton href="/play" variant="secondary" size="lg">Start Playing</LinkButton>
          <LinkButton href="/pricing" size="lg">Pricing</LinkButton>
        </div>
      </section>
    </div>
  );
}
