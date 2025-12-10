'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Users,
  LineChart,
  Crown,
  Settings as SettingsIcon,
  PanelLeftOpen,
  PanelLeftClose,
  Play,
} from 'lucide-react';
import { ProfileManager } from './ProfileManager';
import { ProfileCurriculumSettings } from './ProfileCurriculumSettings';
import { SkillRadar } from '@/components/features/analytics/SkillRadar';
import { UpgradeCard } from '@/components/features/monetization/UpgradeCard';
import { WeeklyGoalDisplay } from '@/components/features/engagement';
import { CurriculumProgressPanel } from './CurriculumProgressPanel';
import { useCurriculumProgress } from '@/lib/hooks/useCurriculumProgress';
import { useGameStore } from '@/lib/stores/useGameStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { MasteryTracker } from '@/lib/game-engine/mastery-tracker';
import { WeeklyGoalTracker } from '@/lib/game-engine/weekly-goal-tracker';
import { trackCurriculumRecommendationClicked } from '@/lib/analytics/curriculum-analytics';
import styles from './GrownUpsDashboard.module.css';

export default function GrownUpsDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get initial tab from URL param, default to 'profiles'
  const tabParam = searchParams.get('tab');
  const initialTab = (tabParam === 'premium' || tabParam === 'progress' || tabParam === 'settings') 
    ? tabParam 
    : 'profiles';
  
  const [activeTab, setActiveTab] = useState<'profiles' | 'progress' | 'settings' | 'premium'>(initialTab);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [panelTab, setPanelTab] = useState<'skills' | 'needs' | 'curriculum' | 'activity'>('skills');
  const [timeRange, setTimeRange] = useState<'all' | '7d' | '14d' | '30d'>('all');
  const [graphType, setGraphType] = useState<'radar' | 'bars' | 'table'>('radar');

  const profiles = useLiveQuery(() => db.profiles.toArray());
  const settings = useLiveQuery(() => db.globalSettings.get('default'));
  
  const timeRangeStart = useMemo(() => {
    if (timeRange === 'all') return null;
    const now = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;
    now.setDate(now.getDate() - days);
    return now;
  }, [timeRange]);

  const radarData = useLiveQuery(
    async () => selectedProfileId ? await MasteryTracker.getRadarData(selectedProfileId, timeRangeStart ?? undefined) : undefined,
    [selectedProfileId, timeRangeStart?.toISOString()]
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

  const allSessions = useLiveQuery(
    async () => selectedProfileId
      ? await db.sessions.where('profileId').equals(selectedProfileId).toArray()
      : [],
    [selectedProfileId]
  );

  const filteredSessions = useMemo(() => {
    if (!allSessions) return [];
    if (!timeRangeStart) return allSessions;
    return allSessions.filter((s) => new Date(s.startedAt) >= timeRangeStart);
  }, [allSessions, timeRangeStart]);

  const weakFacts = useLiveQuery(
    async () => selectedProfileId ? await MasteryTracker.getWeakFacts(selectedProfileId) : [],
    [selectedProfileId]
  );

  const stats = useMemo(() => {
    const sessions = filteredSessions || [];
    const totalSessions = sessions.length;
    const totalQuestions = sessions.reduce((acc, s) => acc + s.questionsAnswered, 0);
    const totalCorrect = sessions.reduce((acc, s) => acc + s.questionsCorrect, 0);
    const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    return { totalSessions, totalQuestions, accuracy };
  }, [filteredSessions]);

  // Recommendations panel intentionally only on Recommendations tab now

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      // Retrieve email data from sessionStorage (stored before redirect)
      const pendingEmailData = sessionStorage.getItem('pendingPurchaseEmail');
      let parentEmail: string | undefined;
      let marketingOptIn: boolean | undefined;
      let stripeCustomerId: string | undefined;

      if (pendingEmailData) {
        try {
          const parsed = JSON.parse(pendingEmailData);
          parentEmail = parsed.email;
          marketingOptIn = parsed.marketingOptIn;
        } catch (e) {
          console.error('Failed to parse pending email data:', e);
        }
        sessionStorage.removeItem('pendingPurchaseEmail');
      }

      // Get customerId from URL if available
      stripeCustomerId = searchParams.get('customerId') || undefined;

      // Store all data in globalSettings
      db.globalSettings.put({ 
        id: 'default', 
        isPremium: true, 
        parentEmail,
        marketingOptIn,
        stripeCustomerId,
        updatedAt: new Date().toISOString() 
      });

      alert('Thank you for upgrading! Premium features are now unlocked.');
      router.replace('/grown-ups'); // Clear params
    }
  }, [searchParams, router]);

  useEffect(() => {
        const initSeedData = async () => {
      try {
        const profiles = await db.profiles.toArray();
        const exists = profiles.find((p) => p.displayName === 'Johnny');
        if (exists) return;

        console.log('Seeding demo data...');
        
        const profileId = crypto.randomUUID();
        await db.profiles.add({
          id: profileId,
          playCode: 'DASH-DEMO',
          displayName: 'Johnny',
          ageBand: '7-9',
          avatarId: 'PENG',
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
      <div className={`${styles.sidebar} ${sidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
        <button
          type="button"
          className={styles.sidebarToggle}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => setSidebarCollapsed((v) => !v)}
        >
          {sidebarCollapsed ? <PanelLeftOpen size={16} aria-hidden="true" /> : <PanelLeftClose size={16} aria-hidden="true" />}
        </button>
        <h1 className={styles.logo}>
          <span className={styles.logoText}>Math Dash</span> <span className={styles.badge}>Admin</span>
        </h1>
        <Link href="/" className={styles.backLink}>
          ← Back to main site
        </Link>
        <nav className={styles.nav}>
          <button 
            className={`${styles.navItem} ${activeTab === 'profiles' ? styles.active : ''}`}
            onClick={() => setActiveTab('profiles')}
            aria-label="Profiles"
          >
            <span className={styles.navIcon} aria-hidden="true">
              <Users size={16} />
            </span>
            <span className={styles.navLabel}>Profiles</span>
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'progress' ? styles.active : ''}`}
            onClick={() => setActiveTab('progress')}
            aria-label="Progress"
          >
            <span className={styles.navIcon} aria-hidden="true">
              <LineChart size={16} />
            </span>
            <span className={styles.navLabel}>Progress</span>
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'premium' ? styles.active : ''}`}
            onClick={() => setActiveTab('premium')}
            aria-label="Premium"
          >
            <span className={styles.navIcon} aria-hidden="true">
              <Crown size={16} />
            </span>
            <span className={styles.navLabel}>Premium</span>
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'settings' ? styles.active : ''}`}
            onClick={() => setActiveTab('settings')}
            aria-label="Settings"
          >
            <span className={styles.navIcon} aria-hidden="true">
              <SettingsIcon size={16} />
            </span>
            <span className={styles.navLabel}>Settings</span>
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
                <div className={styles.timeFilter}>
                  <span className={styles.label}>Time range:</span>
                  <div className={styles.tabBar}>
                    {[
                      { key: 'all', label: 'All time' },
                      { key: '7d', label: 'Last 7 days' },
                      { key: '14d', label: 'Last 14 days' },
                      { key: '30d', label: 'Last 30 days' },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        className={`${styles.tabButton} ${timeRange === opt.key ? styles.tabButtonActive : ''}`}
                        onClick={() => setTimeRange(opt.key as any)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
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

                <div className={styles.tabBar}>
                  <button
                    type="button"
                    className={`${styles.tabButton} ${panelTab === 'skills' ? styles.tabButtonActive : ''}`}
                    onClick={() => setPanelTab('skills')}
                  >
                    Skill Breakdown
                  </button>
                  <button
                    type="button"
                    className={`${styles.tabButton} ${panelTab === 'needs' ? styles.tabButtonActive : ''}`}
                    onClick={() => setPanelTab('needs')}
                  >
                    Needs Practice
                  </button>
                  <button
                    type="button"
                    className={`${styles.tabButton} ${panelTab === 'curriculum' ? styles.tabButtonActive : ''}`}
                    onClick={() => setPanelTab('curriculum')}
                  >
                    Curriculum Progress
                  </button>
                  <button
                    type="button"
                    className={`${styles.tabButton} ${panelTab === 'activity' ? styles.tabButtonActive : ''}`}
                    onClick={() => setPanelTab('activity')}
                  >
                    Recent Activity
                  </button>
                  <button
                    type="button"
                    className={`${styles.tabButton} ${panelTab === 'recommendations' ? styles.tabButtonActive : ''}`}
                    onClick={() => setPanelTab('recommendations')}
                  >
                    Recommendations
                  </button>
                </div>

                {panelTab === 'skills' && (
                  <div className={styles.panel}>
                    <div className={styles.graphToggle}>
                      <button
                        type="button"
                        className={`${styles.graphButton} ${graphType === 'radar' ? styles.graphButtonActive : ''}`}
                        onClick={() => setGraphType('radar')}
                      >
                        Radar
                      </button>
                      <button
                        type="button"
                        className={`${styles.graphButton} ${graphType === 'bars' ? styles.graphButtonActive : ''}`}
                        onClick={() => setGraphType('bars')}
                      >
                        Bars
                      </button>
                      <button
                        type="button"
                        className={`${styles.graphButton} ${graphType === 'table' ? styles.graphButtonActive : ''}`}
                        onClick={() => setGraphType('table')}
                      >
                        Table
                      </button>
                    </div>
                    {graphType === 'radar' && <SkillRadar data={radarData} />}
                    {graphType === 'bars' && (
                      <div className={styles.barsContainer}>
                        {(radarData ?? []).map((row) => (
                          <div key={row.subject} className={styles.barRow}>
                            <span className={styles.barLabel}>{row.subject}</span>
                            <div className={styles.barTrack}>
                              <div className={styles.barFill} style={{ width: `${row.score}%` }} />
                            </div>
                            <span className={styles.barValue}>{row.score}%</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {graphType === 'table' && (
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>Skill</th>
                            <th>Score</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(radarData ?? []).map((row) => (
                            <tr key={row.subject}>
                              <td>{row.subject}</td>
                              <td>{row.score}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {panelTab === 'needs' && (
                  <div className={styles.panel}>
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
                )}

                {panelTab === 'curriculum' && (
                  <CurriculumProgressPanel
                    profileId={selectedProfileId}
                    onOpenSettings={() => setActiveTab('settings')}
                    className={styles.panel}
                  />
                )}

                {panelTab === 'activity' && (
                  <div className={styles.panel}>
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
                          {session.questionsCorrect}/{session.questionsAnswered} correct | {session.mode}
                        </div>
                      </li>
                    ))}
                    </ul>
                  ) : (
                        <p className={styles.muted}>No recent sessions found.</p>
                      )}
                  </div>
                )}

                {panelTab === 'recommendations' && selectedProfileId && (
                  <RecommendationsPanel profileId={selectedProfileId} />
                )}
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
                <h3>You are a Premium Member!</h3>
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
            
            {/* Curriculum Settings */}
            <div className={styles.card}>
              <h3>Curriculum Alignment</h3>
              <ProfileCurriculumSettings profiles={profiles ?? []} />
            </div>
            
            {/* Weekly Goal Settings */}
            <div className={styles.card}>
              <h3>Weekly Practice Goals</h3>
              <p>Set how many days per week each player should practice. Goals reset every Monday.</p>
              
              <div className={styles.goalSettingsGrid}>
                {profiles?.map(profile => {
                  const goal = profile.weeklyGoal;
                  const targetDays = goal?.targetDays ?? 3;
                  
                  return (
                    <div key={profile.id} className={styles.goalSetting}>
                      <div className={styles.goalProfileInfo}>
                        <span className={styles.goalAvatar}>{profile.avatarId}</span>
                        <span className={styles.goalName}>{profile.displayName}</span>
                      </div>
                      
                      <div className={styles.goalControls}>
                        <label className={styles.goalLabel}>Days per week:</label>
                        <div className={styles.goalSelector}>
                          {[1, 2, 3, 4, 5, 6, 7].map(days => (
                            <button
                              key={days}
                              className={`${styles.goalButton} ${targetDays === days ? styles.goalButtonActive : ''}`}
                              onClick={async () => {
                                await WeeklyGoalTracker.updateGoalTarget(profile.id, days);
                              }}
                            >
                              {days}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {goal && (
                        <div className={styles.goalProgress}>
                          <WeeklyGoalDisplay weeklyGoal={goal} compact />
                          <span className={styles.goalStatus}>
                            {goal.currentDays >= goal.targetDays 
                              ? 'Goal achieved this week!' 
                              : `${goal.currentDays}/${goal.targetDays} days this week`}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {(!profiles || profiles.length === 0) && (
                  <div className={styles.muted}>No profiles found. Create one in the Profiles tab.</div>
                )}
              </div>
            </div>
            
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
function RecommendationsPanel({ profileId }: { profileId: string }) {
  const router = useRouter();
  const setConfig = useGameStore((state) => state.setConfig);
  const { recommendedFocus, loading } = useCurriculumProgress(profileId);

  if (loading) {
    return (
      <div className={styles.panel}>
        <h3>Recommended next steps</h3>
        <p className={styles.muted}>Loading...</p>
      </div>
    );
  }

  const handlePractice = (skillId: string) => {
    const rec = recommendedFocus.find((r) => r.skillId === skillId);
    if (!rec) return;
    const cfg = rec.action?.config || {};
    const update: Parameters<typeof setConfig>[0] = {};
    if (cfg.operations) update.operations = cfg.operations;
    if (cfg.selectedNumbers) update.selectedNumbers = cfg.selectedNumbers;
    if (cfg.numberRange) update.numberRange = cfg.numberRange;
    if (cfg.selectedTopics && cfg.selectedTopics.length > 0) {
      update.selectedTopics = cfg.selectedTopics;
    } else if (rec.action?.topicType) {
      update.selectedTopics = [rec.action.topicType];
    }
    setConfig(update);
    trackCurriculumRecommendationClicked(profileId, skillId, 'recommendation_panel');
    router.push('/play?source=recommendation');
  };

  return (
    <div className={styles.panel}>
      <div className={styles.recommendHeader}>
        <h3>Recommended next steps</h3>
        <span className={styles.recommendSub}>Up to 3 focus areas</span>
      </div>
      {recommendedFocus.length === 0 ? (
        <p className={styles.muted}>No recommendations yet. Play a session to generate them.</p>
      ) : (
        <div className={styles.recommendList}>
          {recommendedFocus.map((rec) => (
            <div key={rec.skillId} className={styles.recommendCard}>
              <div className={styles.recommendInfo}>
                <div className={styles.recommendTitle}>{rec.label}</div>
                <div className={styles.recommendMeta}>
                  {rec.proficiency === 'not-started' ? 'Not started' : rec.proficiency} | {rec.accuracy}% acc | {rec.coverage}% coverage
                </div>
              </div>
              <button type="button" className={styles.practiceButton} onClick={() => handlePractice(rec.skillId)}>
                <Play size={14} aria-hidden="true" /> Practice
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
