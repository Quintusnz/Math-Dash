'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, Profile } from '@/lib/db';
import { useState } from 'react';
import { AdultGateModal } from '@/components/features/auth/AdultGateModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
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
  
  // Deletion flow state
  const [showAdultGate, setShowAdultGate] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<Profile | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfile.name.trim()) return;

    // Generate a unique play code
    const generateCode = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = '';
      for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return `DASH-${code}`;
    };

    try {
      await db.profiles.add({
        id: crypto.randomUUID(),
        displayName: newProfile.name,
        ageBand: newProfile.ageBand,
        avatarId: newProfile.avatarId,
        playCode: generateCode(),
        isGuest: false,
        classroomId: null,
        syncStatus: 'local',
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

  // Step 1: User clicks delete - show adult gate first
  const handleDeleteClick = (profile: Profile) => {
    setProfileToDelete(profile);
    setShowAdultGate(true);
  };

  // Step 2: Adult gate verified - show deletion confirmation
  const handleAdultVerified = () => {
    setShowAdultGate(false);
    setShowDeleteModal(true);
  };

  // Step 3: User confirms deletion - perform actual delete
  const handleConfirmDelete = async () => {
    if (!profileToDelete) return;

    const id = profileToDelete.id;
    setDeletingId(id);

    try {
      // Cascade delete: sessions and attempts
      const sessions = await db.sessions.where('profileId').equals(id).toArray();
      const sessionIds = sessions.map(s => s.id);
      
      await db.transaction('rw', db.profiles, db.sessions, db.attempts, async () => {
        await db.profiles.delete(id);
        await db.sessions.where('profileId').equals(id).delete();
        
        // Bulk delete attempts for these sessions
        for (const sessionId of sessionIds) {
          await db.attempts.where('sessionId').equals(sessionId).delete();
        }
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Cancel/close handlers
  const handleCancelAdultGate = () => {
    setShowAdultGate(false);
    setProfileToDelete(null);
  };

  const handleCancelDeleteModal = () => {
    setShowDeleteModal(false);
    setProfileToDelete(null);
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
        
        {profiles.map((profile: Profile) => (
          <div key={profile.id} className={styles.item}>
            <div className={styles.info}>
              <div className={styles.avatar}>{profile.avatarId}</div>
              <div className={styles.details}>
                <span className={styles.name}>{profile.displayName}</span>
                <span className={styles.meta}>{profile.ageBand}</span>
              </div>
            </div>
            <button 
              onClick={() => handleDeleteClick(profile)}
              disabled={deletingId === profile.id}
              className={styles.deleteButton}
            >
              {deletingId === profile.id ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        ))}
      </div>

      {/* Adult Gate Modal - shown before deletion */}
      <AdultGateModal
        isOpen={showAdultGate}
        onVerified={handleAdultVerified}
        onCancel={handleCancelAdultGate}
        title="Verify Adult"
        description="Deleting a profile requires adult verification. Please solve this math problem to continue."
      />

      {/* Delete Confirmation Modal - multi-step confirmation */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        profile={profileToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDeleteModal}
      />
    </div>
  );
}
