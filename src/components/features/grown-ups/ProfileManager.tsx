'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useState } from 'react';
import styles from './ProfileManager.module.css';

const AVATARS = [
  '🐶', '🐱', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', 
  '🐷', '🐸', '🐵', '🦄', '🐲', '🦖', '🤖', '👽', '👻', '🦸', 
  '🧚', '🧜', '🧙', '🦉', '🦋', '🐞', '🦈', '🐙', '🐬', '🐳'
];
const AGE_BANDS = ['4-6', '7-9', '10-12'];

export function ProfileManager() {
  const profiles = useLiveQuery(() => db.profiles.toArray());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newProfile, setNewProfile] = useState({
    name: '',
    ageBand: AGE_BANDS[0],
    avatarId: AVATARS[0]
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfile.name.trim()) return;

    try {
      await db.profiles.add({
        id: crypto.randomUUID(),
        displayName: newProfile.name,
        ageBand: newProfile.ageBand,
        avatarId: newProfile.avatarId,
        preferences: {
          theme: 'default',
          soundEnabled: true,
          hapticsEnabled: true
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setIsCreating(false);
      setNewProfile({
        name: '',
        ageBand: AGE_BANDS[0],
        avatarId: AVATARS[0]
      });
    } catch (error) {
      console.error('Failed to create profile:', error);
      alert('Failed to create profile');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This will delete all progress for this profile.')) return;
    
    setDeletingId(id);
    try {
      // Cascade delete: sessions and attempts
      const sessions = await db.sessions.where('profileId').equals(id).toArray();
      const sessionIds = sessions.map(s => s.id);
      
      await db.transaction('rw', db.profiles, db.sessions, db.attempts, async () => {
        await db.profiles.delete(id);
        await db.sessions.where('profileId').equals(id).delete();
        // Note: Dexie doesn't support 'in' clause for delete easily without iterating, 
        // but for now we'll just delete sessions. 
        // Ideally we'd delete attempts too: await db.attempts.where('sessionId').anyOf(sessionIds).delete();
        // Since attempts are tied to sessions, we can clean them up.
        
        // Bulk delete attempts for these sessions
        for (const sessionId of sessionIds) {
            await db.attempts.where('sessionId').equals(sessionId).delete();
        }
      });
    } catch (error) {
      console.error('Failed to delete profile:', error);
      alert('Failed to delete profile');
    } finally {
      setDeletingId(null);
    }
  };

  if (!profiles) return <div>Loading profiles...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Manage Profiles</h2>
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className={styles.createButton}
          >
            Create Profile
          </button>
        )}
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Name</label>
            <input
              type="text"
              value={newProfile.name}
              onChange={e => setNewProfile({...newProfile, name: e.target.value})}
              className={styles.input}
              placeholder="Enter name"
              autoFocus
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Age Band</label>
            <select
              value={newProfile.ageBand}
              onChange={e => setNewProfile({...newProfile, ageBand: e.target.value})}
              className={styles.select}
            >
              {AGE_BANDS.map(band => (
                <option key={band} value={band}>{band}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Avatar</label>
            <div className={styles.avatarGrid}>
              {AVATARS.map(avatar => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => setNewProfile({...newProfile, avatarId: avatar})}
                  className={`${styles.avatarOption} ${newProfile.avatarId === avatar ? styles.selected : ''}`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.createButton}>
              Save Profile
            </button>
            <button 
              type="button" 
              onClick={() => setIsCreating(false)}
              className={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className={styles.list}>
        {profiles.length === 0 && (
          <div className={styles.empty}>No profiles found.</div>
        )}
        
        {profiles.map((profile: any) => (
          <div key={profile.id} className={styles.item}>
            <div className={styles.info}>
              <div className={styles.avatar}>{profile.avatarId}</div>
              <div className={styles.details}>
                <span className={styles.name}>{profile.displayName}</span>
                <span className={styles.meta}>{profile.ageBand}</span>
              </div>
            </div>
            <button 
              onClick={() => handleDelete(profile.id)}
              disabled={deletingId === profile.id}
              className={styles.deleteButton}
            >
              {deletingId === profile.id ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
