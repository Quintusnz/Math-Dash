import { ReactNode } from 'react';
import styles from './GameCanvas.module.css';

export function GameCanvas({ children }: { children: ReactNode }) {
  return (
    <div className={styles.canvas}>
      {children}
    </div>
  );
}
