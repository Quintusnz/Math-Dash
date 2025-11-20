import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import styles from './HistoryList.module.css';
import { Card } from "@/components/ui/Card";

export function HistoryList() {
  const sessions = useLiveQuery(
    () => db.sessions.orderBy('startedAt').reverse().limit(5).toArray()
  );

  if (!sessions || sessions.length === 0) return null;

  return (
    <Card className={styles.panel}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>Recent Games</h3>
          <span className={styles.caption}>Last 5 sessions</span>
        </div>
        <div className={styles.list}>
          {sessions.map(session => (
            <div key={session.id} className={styles.item}>
              <div>
                <div className={styles.score}>{session.score} pts</div>
                <div className={styles.meta}>
                  {session.questionsCorrect}/{session.questionsAnswered} correct
                </div>
              </div>
              <div className={styles.date}>
                {new Date(session.startedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
