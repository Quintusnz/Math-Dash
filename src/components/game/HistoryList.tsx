import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import styles from './HistoryList.module.css';

export function HistoryList() {
  const sessions = useLiveQuery(
    () => db.sessions.orderBy('startedAt').reverse().limit(5).toArray()
  );

  if (!sessions || sessions.length === 0) return null;

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Recent Games</h3>
      <div className={styles.list}>
        {sessions.map(session => (
          <div key={session.id} className={styles.item}>
            <div className={styles.score}>{session.score} pts</div>
            <div className={styles.date}>
              {new Date(session.startedAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
