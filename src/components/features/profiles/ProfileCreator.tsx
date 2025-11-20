import { useState } from 'react';
import { db, Profile } from '@/lib/db';
import { useUserStore } from '@/lib/stores/useUserStore';
import { motion } from 'motion/react';
import styles from './ProfileCreator.module.css';

const AVATARS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯'];

export function ProfileCreator({ onCreated }: { onCreated?: () => void }) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [ageBand, setAgeBand] = useState('6-8');
  const setActiveProfileId = useUserStore(state => state.setActiveProfileId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProfile: Profile = {
      id: crypto.randomUUID(),
      displayName: name,
      avatarId: avatar,
      ageBand,
      preferences: {
        theme: 'default',
        soundEnabled: true,
        hapticsEnabled: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.profiles.add(newProfile);
    setActiveProfileId(newProfile.id);
    setName('');
    if (onCreated) onCreated();
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.title}>Create New Profile</h2>
      
      <div className={styles.field}>
        <label className={styles.label}>Name</label>
        <input 
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={styles.input}
          placeholder="Enter your name"
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Choose Avatar</label>
        <div className={styles.avatarGrid}>
          {AVATARS.map(a => (
            <button
              key={a}
              type="button"
              onClick={() => setAvatar(a)}
              className={`${styles.avatarBtn} ${avatar === a ? styles.selected : ''}`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Age Group</label>
        <select 
          value={ageBand} 
          onChange={(e) => setAgeBand(e.target.value)}
          className={styles.select}
        >
          <option value="4-5">4-5 Years</option>
          <option value="6-8">6-8 Years</option>
          <option value="9-12">9-12 Years</option>
        </select>
      </div>

      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit" 
        className={styles.submitBtn}
      >
        Start Adventure!
      </motion.button>
    </form>
  );
}
