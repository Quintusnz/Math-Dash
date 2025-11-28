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

  const weakFacts = useLiveQuery(
    async () => selectedProfileId ? await MasteryTracker.getWeakFacts(selectedProfileId) : [],
    [selectedProfileId]
  );

  const stats = useLiveQuery(
    async () => {
      if (!selectedProfileId) return null;
      const sessions = await db.sessions.where('profileId').equals(selectedProfileId).toArray();
      const totalSessions = sessions.length;
      const totalQuestions = sessions.reduce((acc, s) => acc + s.questionsAnswered, 0);
      const totalCorrect = sessions.reduce((acc, s) => acc + s.questionsCorrect, 0);
      const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
      
      return { totalSessions, totalQuestions, accuracy };
    },
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

  useEffect(() => {
    const initSeedData = async () => {
      try {
        const exists = await db.profiles.where('displayName').equals('Johnny').first();
        if (exists) return;

        console.log('Seeding demo data...');
        
        const profileId = crypto.randomUUID();
        await db.profiles.add({
          id: profileId,
          playCode: 'DASH-DEMO',
          displayName: 'Johnny',
          ageBand: '7-9',
          avatarId: '🦁',
          isGuest: false,
          classroomId: null,
          preferences: { theme: 'default', soundEnabled: true, hapticsEnabled: true },
          syncStatus: 'local',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        // Add sessions
        const topics = ['addition', 'subtraction', 'multiplication', 'division'];
        const now = Date.now();
        
        for (let i = 0; i < 10; i++) {
          const sessionId = crypto.randomUUID();
          const topic = topics[i % 4];
          
          await db.sessions.add({
            id: sessionId,
            profileId: profileId,
            topicId: topic,
            mode: 'standard',
            startedAt: new Date(now - i * 86400000).toISOString(),
            endedAt: new Date(now - i * 86400000 + 300000).toISOString(),
            score: Math.floor(Math.random() * 1000) + 500,
            questionsAnswered: 20,
            questionsCorrect: 15 + Math.floor(Math.random() * 5),
            isCompleted: true,
            synced: 0
          });
        }

        // Add direct mastery data (skipping complex calculation logic for stability)
        const ops = ['addition', 'subtraction', 'multiplication', 'division'];
        for (const op of ops) {
          // Add some mastered facts
          for (let k = 0; k < 5; k++) {
            await db.mastery.add({
              profileId,
              fact: `${Math.floor(Math.random()*10)} ${op === 'multiplication' ? 'x' : op === 'addition' ? '+' : op === 'subtraction' ? '-' : '/'} ${Math.floor(Math.random()*10)}`,
              operation: op as any,
              attempts: 10,
              correct: 9,
              avgResponseTime: 1500,
              lastAttemptAt: new Date().toISOString(),
              status: 'mastered',
              weight: 1
            });
          }
          // Add some weak facts
          if (op === 'multiplication' || op === 'division') {
            for (let k = 0; k < 3; k++) {
              await db.mastery.add({
                profileId,
                fact: `${Math.floor(Math.random()*10)} ${op === 'multiplication' ? 'x' : '/'} ${Math.floor(Math.random()*10)}`,
                operation: op as any,
                attempts: 5,
                correct: 2,
                avgResponseTime: 4000,
                lastAttemptAt: new Date().toISOString(),
                status: 'learning',
                weight: 10 // High weight = weak
              });
            }
          }
        }
        
        console.log('Demo data seeded successfully');
        // Force reload to show new data
        window.location.reload();
      } catch (e) {
        console.error('Failed to seed data:', e);
      }
    };

    initSeedData();
  }, []);

  const seedData = async () => {
    // ... kept for reference but unused in UI
  };

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
              <label className={styles.label}>Select Profile:</label>
              <div className={styles.profileTabs}>
                {profiles?.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProfileId(p.id)}
                    className={`${styles.profileTab} ${selectedProfileId === p.id ? styles.active : ''}`}
                  >
                    <span className={styles.profileAvatar}>{p.avatarId}</span>
                    <span className={styles.profileName}>{p.displayName}</span>
                  </button>
                ))}
                {profiles?.length === 0 && (
                  <div className={styles.muted}>No profiles found. Create one in the Profiles tab.</div>
                )}
              </div>
            </div>

            {selectedProfileId ? (
                <div className={styles.dashboardGrid}>
                  {/* Summary Stats */}
                  <div className={styles.statsRow}>
                    <div className={styles.statCard}>
                      <div className={styles.statLabel}>Total Sessions</div>
                      <div className={styles.statValue}>{stats?.totalSessions || 0}</div>
                    </div>
                    <div className={styles.statCard}>
                      <div className={styles.statLabel}>Questions Answered</div>
                      <div className={styles.statValue}>{stats?.totalQuestions || 0}</div>
                    </div>
                    <div className={styles.statCard}>
                      <div className={styles.statLabel}>Accuracy</div>
                      <div className={styles.statValue}>{stats?.accuracy || 0}%</div>
                    </div>
                  </div>

                  {/* Analysis Row: Radar + Weak Spots */}
                  <div className={styles.analysisRow}>
                    <div className={styles.radarContainer}>
                      <SkillRadar data={radarData} />
                    </div>
                    
                    <div className={styles.statsCard}>
                      <h3>Needs Practice</h3>
                      {weakFacts && weakFacts.length > 0 ? (
                        <div className={styles.weakFactsGrid}>
                          {weakFacts.map(fact => (
                            <div key={fact.id} className={styles.weakFactTag}>
                              {fact.fact}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className={styles.muted}>No weak spots identified yet! Keep playing.</p>
                      )}
                    </div>
                  </div>

                  {/* Recent Activity - Full Width */}
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
