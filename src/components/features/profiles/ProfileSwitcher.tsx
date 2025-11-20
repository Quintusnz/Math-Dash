import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useUserStore } from "@/lib/stores/useUserStore";
import { motion } from "motion/react";
import styles from './ProfileSwitcher.module.css';

export function ProfileSwitcher({ onCreateNew }: { onCreateNew: () => void }) {
  const profiles = useLiveQuery(() => db.profiles.toArray());
  const { activeProfileId, setActiveProfileId } = useUserStore();

  if (!profiles) return null;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Who is playing?</h2>
      
      <div className={styles.grid}>
        {profiles.map(profile => (
          <motion.button
            key={profile.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveProfileId(profile.id)}
            className={`${styles.card} ${activeProfileId === profile.id ? styles.active : ''}`}
          >
            <div className={styles.avatar}>{profile.avatarId}</div>
            <div className={styles.name}>{profile.displayName}</div>
          </motion.button>
        ))}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCreateNew}
          className={`${styles.card} ${styles.newProfile}`}
        >
          <div className={styles.avatar}>+</div>
          <div className={styles.name}>New Profile</div>
        </motion.button>
      </div>
    </div>
  );
}
