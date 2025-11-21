import styles from "./page.module.css";
import { LinkButton } from "@/components/ui/Button";
import { Timer, CheckCircle2 } from "lucide-react";

export default function HowItWorksPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>See Math Dash in Action</h1>
        <p className={styles.subtitle}>
          A simple, focused loop designed to build confidence in minutes.
        </p>
      </header>

      <div className={styles.step}>
        <div className={styles.stepContent}>
          <span className={styles.stepNumber}>Step 1</span>
          <h2 className={styles.stepTitle}>Pick Your Challenge</h2>
          <p className={styles.stepDescription}>
            Choose a specific skill to practice—like the 7x table—or let Math Dash serve up a mixed bag based on what you need to improve.
          </p>
        </div>
        <div className={styles.visualContainer}>
          {/* Mock UI: Topic Selection */}
          <div className={styles.mockGame} style={{ gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px', overflow: 'hidden' }}>
              <div style={{ background: '#EEF2FF', padding: '16px', borderRadius: '12px', flex: 1, border: '2px solid #3056D3' }}>
                <div style={{ fontWeight: 'bold', color: '#3056D3' }}>Times Tables</div>
                <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>Master 1-12</div>
              </div>
              <div style={{ background: '#F9FAFB', padding: '16px', borderRadius: '12px', flex: 1, border: '1px solid #E5E7EB' }}>
                <div style={{ fontWeight: 'bold', color: '#374151' }}>Division</div>
                <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>Inverse facts</div>
              </div>
            </div>
            <div style={{ background: '#F9FAFB', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', color: '#6B7280' }}>
              🎯 Goal: 60 correct answers
            </div>
          </div>
        </div>
      </div>

      <div className={styles.step}>
        <div className={styles.stepContent}>
          <span className={styles.stepNumber}>Step 2</span>
          <h2 className={styles.stepTitle}>The 60-Second Sprint</h2>
          <p className={styles.stepDescription}>
            Race the clock! Questions appear one by one. Big buttons and zero distractions mean you can focus entirely on the math.
          </p>
        </div>
        <div className={styles.visualContainer}>
          {/* Mock UI: Gameplay */}
          <div className={styles.mockGame}>
            <div className={styles.mockHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Timer size={16} /> 0:45
              </div>
              <div>Score: 12</div>
            </div>
            <div className={styles.mockQuestion}>7 × 8</div>
            <div className={styles.mockGrid}>
              <div className={styles.mockOption}>54</div>
              <div className={`${styles.mockOption} ${styles.correct}`}>56</div>
              <div className={styles.mockOption}>48</div>
              <div className={styles.mockOption}>64</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.step}>
        <div className={styles.stepContent}>
          <span className={styles.stepNumber}>Step 3</span>
          <h2 className={styles.stepTitle}>Instant Feedback</h2>
          <p className={styles.stepDescription}>
            See exactly how you did. Math Dash highlights your speed and accuracy, helping you spot which numbers need a little more practice.
          </p>
        </div>
        <div className={styles.visualContainer}>
          {/* Mock UI: Results */}
          <div className={styles.mockGame} style={{ alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', background: '#DCFCE7', borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#16A34A', marginBottom: '8px' }}>
              <CheckCircle2 size={32} />
            </div>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Great Job!</h3>
            <div style={{ display: 'flex', gap: '24px', marginTop: '16px' }}>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800' }}>92%</div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase' }}>Accuracy</div>
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800' }}>1.2s</div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase' }}>Avg Speed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.cta}>
        <h2 className={styles.ctaTitle}>Ready to start your streak?</h2>
        <LinkButton href="/play" size="lg">
          Play Your First Round
        </LinkButton>
      </div>
    </div>
  );
}
