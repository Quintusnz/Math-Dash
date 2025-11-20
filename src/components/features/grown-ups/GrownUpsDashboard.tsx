'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProfileManager } from './ProfileManager';
import { SkillRadar } from '@/components/features/analytics/SkillRadar';
import { UpgradeCard } from '@/components/features/monetization/UpgradeCard';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { MasteryTracker } from '@/lib/game-engine/mastery-tracker';
import styles from './GrownUpsDashboard.module.css';

export default function GrownUpsDashboard() {
  const [activeTab, setActiveTab] = useState<'profiles' | 'progress' | 'settings' | 'premium'>('profiles');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const profiles = useLiveQuery(() => db.profiles.toArray());
  const settings = useLiveQuery(() => db.globalSettings.get('default'));
  
  const radarData = useLiveQuery(
    async () => selectedProfileId ? await MasteryTracker.getRadarData(selectedProfileId) : undefined,
    [selectedProfileId]
  );

  const recentSessions = useLiveQuery(
    async () => selectedProfileId 
      ? await db.sessions
          .where('profileId').equals(selectedProfileId)
          .reverse()
          .limit(5)
          .toArray()
      : [],
    [selectedProfileId]
  );
  
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      // In a real app, verify with backend. For local-first, we trust the redirect for now
      // or verify a token. Here we'll just enable premium.
      db.globalSettings.put({ id: 'default', isPremium: true, updatedAt: new Date().toISOString() });
      alert('Thank you for upgrading! Premium features are now unlocked.');
      router.replace('/grown-ups'); // Clear params
    }
  }, [searchParams, router]);

  return (
    <div className={styles.dashboard}>
      <div className={styles.sidebar}>
        <h1 className={styles.logo}>Math Dash <span className={styles.badge}>Admin</span></h1>
        <nav className={styles.nav}>
          <button 
            className={`${styles.navItem} ${activeTab === 'profiles' ? styles.active : ''}`}
            onClick={() => setActiveTab('profiles')}
          >
            Profiles
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'progress' ? styles.active : ''}`}
            onClick={() => setActiveTab('progress')}
          >
            Progress
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'premium' ? styles.active : ''}`}
            onClick={() => setActiveTab('premium')}
          >
            Premium
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'settings' ? styles.active : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </nav>
      </div>

      <main className={styles.content}>
        {activeTab === 'profiles' && (
          <div className={styles.section}>
            <ProfileManager />
          </div>
        )}

        {activeTab === 'progress' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Progress Overview</h2>
            
            <div className={styles.profileSelector}>
              <label>Select Profile:</label>
              <select 
                onChange={(e) => setSelectedProfileId(e.target.value)}
                value={selectedProfileId || ''}
                className={styles.select}
              >
                <option value="">Select a child...</option>
                {profiles?.map(p => (
                  <option key={p.id} value={p.id}>{p.displayName}</option>
                ))}
              </select>
            </div>

            {selectedProfileId ? (
              <div className={styles.chartsGrid}>
                <div className={styles.chartCard}>
                  <SkillRadar data={radarData} />
                </div>
                <div className={styles.statsCard}>
                  <h3>Recent Activity</h3>
                  {recentSessions && recentSessions.length > 0 ? (
                    <ul className={styles.sessionList}>
                      {recentSessions.map(session => (
                        <li key={session.id} className={styles.sessionItem}>
                          <div className={styles.sessionHeader}>
                            <span className={styles.sessionDate}>{new Date(session.startedAt).toLocaleDateString()}</span>
                            <span className={styles.sessionScore}>{session.score} pts</span>
                          </div>
                          <div className={styles.sessionDetails}>
                            {session.questionsCorrect}/{session.questionsAnswered} correct • {session.mode}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.muted}>No recent sessions found.</p>
                  )}
                </div>

              </div>
            ) : (
              <div className={styles.emptyState}>
                Please select a profile to view progress.
              </div>
            )}
          </div>
        )}

        {activeTab === 'premium' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Upgrade to Premium</h2>
            {settings?.isPremium ? (
              <div className={styles.card}>
                <h3>You are a Premium Member! 🎉</h3>
                <p>Thank you for supporting Math Dash. You have access to all features.</p>
              </div>
            ) : (
              <UpgradeCard />
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>App Settings</h2>
            <div className={styles.card}>
              <h3>Data Management</h3>
              <p>Export or delete all data from this device.</p>
              <div className={styles.actions}>
                <button className={styles.button}>Export Data (JSON)</button>
                <button className={`${styles.button} ${styles.danger}`}>Reset App</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
