import Dexie, { Table } from 'dexie';

export interface Profile {
  id: string;
  accountId?: string;
  displayName: string;
  ageBand: string;
  avatarId: string;
  preferences: {
    theme: string;
    soundEnabled: boolean;
    hapticsEnabled: boolean;
  };
  // Engagement stats
  streak?: {
    current: number;
    best: number;
    lastActiveDate: string; // YYYY-MM-DD
  };
  stats?: {
    totalQuestions: number;
    totalCorrect: number;
    totalSessions: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'streak' | 'volume' | 'accuracy' | 'speed';
  icon: string;
  condition: {
    type: string; // e.g. 'TOTAL_QUESTIONS'
    value: number;
  };
}

export interface PlayerAchievement {
  id?: number;
  profileId: string;
  achievementId: string;
  unlockedAt: string;
  synced: number;
}

export interface GameSession {
  id: string;
  profileId: string;
  topicId: string;
  mode: string;
  startedAt: string;
  endedAt: string | null;
  score: number;
  questionsAnswered: number;
  questionsCorrect: number;
  isCompleted: boolean;
  synced: number; // 0 = false, 1 = true
}

export interface QuestionAttempt {
  id?: number; // Auto-increment
  sessionId: string;
  questionId: string;
  // New fields for mastery tracking
  fact: string; // e.g. "7x8", "10+5"
  operation: 'addition' | 'subtraction' | 'multiplication' | 'division';
  
  isCorrect: boolean;
  responseTimeMs: number;
  timestamp: string;
}

export interface MasteryRecord {
  id?: number;
  profileId: string;
  fact: string; // "7x8"
  operation: 'addition' | 'subtraction' | 'multiplication' | 'division';
  attempts: number;
  correct: number;
  avgResponseTime: number;
  lastAttemptAt: string;
  status: 'new' | 'learning' | 'mastered';
  weight: number; // Higher weight = more likely to appear (for weak items)
}

export interface SyncQueueItem {
  id?: number;
  type: 'SESSION_UPLOAD' | 'PROFILE_UPDATE';
  payload: any;
  createdAt: string;
  retryCount: number;
}

export interface GlobalSettings {
  id: string; // 'default'
  isPremium: boolean;
  parentEmail?: string;
  updatedAt: string;
}

export class MathDashDB extends Dexie {
  profiles!: Table<Profile>;
  sessions!: Table<GameSession>;
  attempts!: Table<QuestionAttempt>;
  mastery!: Table<MasteryRecord>;
  achievements!: Table<Achievement>;
  playerAchievements!: Table<PlayerAchievement>;
  syncQueue!: Table<SyncQueueItem>;
  globalSettings!: Table<GlobalSettings>;

  constructor() {
    super('mathdash_v1');
    this.version(1).stores({
      profiles: 'id, accountId',
      sessions: 'id, profileId, topicId, synced',
      attempts: '++id, sessionId',
    });
    
    this.version(2).stores({
      syncQueue: '++id, type, createdAt'
    });

    this.version(3).stores({
      globalSettings: 'id'
    });

    this.version(4).stores({
      attempts: '++id, sessionId, fact', // Added index on fact
      mastery: '++id, [profileId+fact], status, weight' // Compound index for fast lookups
    });

    this.version(5).stores({
      achievements: 'id',
      playerAchievements: '++id, [profileId+achievementId], unlockedAt'
    });
  }
}

export const db = new MathDashDB();
