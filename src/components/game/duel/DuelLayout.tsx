import { ReactNode } from "react";
import styles from './DuelLayout.module.css';

interface DuelLayoutProps {
  player1: ReactNode;
  player2: ReactNode;
  timer: ReactNode;
}

export function DuelLayout({ player1, player2, timer }: DuelLayoutProps) {
  return (
    <div className={styles.container}>
      {/* Top Bar with Timer */}
      <div className={styles.topBar}>
        {timer}
      </div>

      {/* Split Screen Area */}
      <div className={styles.splitArea}>
        {/* Player 1 (Left) */}
        <div className={styles.playerLeft}>
          {player1}
        </div>

        {/* Player 2 (Right) */}
        <div className={styles.playerRight}>
          {player2}
        </div>
        
        {/* VS Badge (Center Overlay) */}
        <div className={styles.vsBadge}>
          VS
        </div>
      </div>
    </div>
  );
}

