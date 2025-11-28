import Dexie, { Table } from 'dexie';

export interface Profile {
  id: string;
  playCode: string | null; // Format: DASH-XXXX (null for guests)
  accountId?: string;
  displayName: string;
  ageBand: string;
  avatarId: string;
  isGuest: boolean;
  classroomId: string | null; // null for personal profiles
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
  syncStatus: 'local' | 'synced' | 'pending';
  createdAt: string;
  updatedAt: string;
}

// Tracks which play codes are known on this device
export interface DeviceProfile {
  id?: number;
  playCode: string;
  addedAt: string;
}

// Device-level settings
export interface DeviceSettings {
  id: string; // 'default'
  lastActivePlayCode: string | null;
  requireCodeToSwitch: boolean;
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
  
  // Session configuration snapshot (added for analytics)
  config?: {
    operations: string[];
    selectedNumbers: number[];
    difficulty: string;
    inputMethod: string;
    targetDuration?: number;  // For timed mode
    targetQuestions?: number; // For sprint mode
  };
  
  // Computed metrics (added for Coach AI)
  accuracyPercent?: number;
  avgResponseTimeMs?: number;
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
  
  // Added for better analytics
  givenAnswer?: number | null;  // What user entered (null if timeout/skipped)
  expectedAnswer?: number;       // Correct answer
  questionIndex?: number;        // Position in session (1st, 2nd, etc.)
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
  marketingOptIn?: boolean;
  stripeCustomerId?: string;
  updatedAt: string;
}

export class MathDashDB extends Dexie {
  profiles!: Table<Profile>;
  deviceProfiles!: Table<DeviceProfile>;
  deviceSettings!: Table<DeviceSettings>;
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

    // Add index on startedAt for ordering recent sessions
    this.version(6).stores({
      sessions: 'id, profileId, topicId, synced, startedAt'
    });

    // Add playCode authentication system
    this.version(7).stores({
      profiles: 'id, playCode, accountId, classroomId',
      deviceProfiles: '++id, playCode',
      deviceSettings: 'id'
    });
  }
}

export const db = new MathDashDB();
