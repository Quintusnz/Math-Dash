import styles from './page.module.css';
import { LinkButton } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className={styles.page}>
      <div className={styles.heroCard}>
        <span className={styles.badge}>60-second math missions</span>
        <h1 className={styles.title}>Math Dash</h1>
        <p className={styles.lead}>
          Quick-fire drills for kids, with progress insights for grown-ups.
        </p>
        <div className={styles.actions}>
          <LinkButton href="/play" variant="primary" size="lg">
            Play Now
          </LinkButton>
          <LinkButton href="/grown-ups" variant="secondary" size="lg">
            Grown-Ups
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
