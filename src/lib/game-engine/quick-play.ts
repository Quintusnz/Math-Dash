import { db, GameSession } from '@/lib/db';
import { GameConfig, Operation, NumberRange, TopicType } from '@/lib/stores/useGameStore';

/**
 * Represents the last game configuration stored in a session
 */
export interface LastGameConfig {
  /** Operations used (addition, subtraction, multiplication, division) */
  operations: Operation[];
  /** Selected numbers for times tables (multiplication/division) */
  selectedNumbers: number[];
  /** Number range for addition/subtraction */
  numberRange?: NumberRange;
  /** Selected special topics */
  selectedTopics?: TopicType[];
  /** Game mode */
  mode: 'timed' | 'sprint' | 'practice';
  /** Input method */
  inputMode: 'numpad' | 'choice' | 'voice';
  /** Difficulty */
  difficulty: 'easy' | 'medium' | 'hard';
  /** Duration in seconds (for timed mode) */
  duration: number;
  /** Question count (for sprint mode) */
  questionCount: number;
  /** When the session was played */
  playedAt: string;
  /** Session score (for display) */
  lastScore?: number;
}

/**
 * Get a human-readable summary of the game configuration
 */
export function getConfigSummary(config: LastGameConfig): string {
  const parts: string[] = [];
  
  // Topic/operation description
  if (config.selectedTopics && config.selectedTopics.length > 0) {
    const topicLabels: Record<TopicType, string> = {
      addition: 'Addition',
      subtraction: 'Subtraction',
      multiplication: 'Multiplication',
      division: 'Division',
      'number-bonds-10': 'Make 10',
      'number-bonds-20': 'Make 20',
      'number-bonds-50': 'Make 50',
      'number-bonds-100': 'Make 100',
      doubles: 'Doubles',
      halves: 'Halves',
      squares: 'Squares',
    };
    const labels = config.selectedTopics.map(t => topicLabels[t] || t);
    parts.push(labels.slice(0, 2).join(', '));
    if (labels.length > 2) parts[0] += `, +${labels.length - 2}`;
  } else if (config.operations.length > 0) {
    const opSymbols: Record<Operation, string> = {
      addition: '+',
      subtraction: '−',
      multiplication: '×',
      division: '÷',
    };
    
    // For multiplication/division with selected numbers
    if (
      (config.operations.includes('multiplication') || config.operations.includes('division')) &&
      config.selectedNumbers.length > 0
    ) {
      const nums = config.selectedNumbers.slice(0, 3).join(', ');
      const sym = config.operations.map(o => opSymbols[o]).join('/');
      parts.push(`${nums}${sym}`);
      if (config.selectedNumbers.length > 3) parts[0] += ` +${config.selectedNumbers.length - 3}`;
    } else {
      // For addition/subtraction with range
      const ops = config.operations.map(o => opSymbols[o]).join('/');
      if (config.numberRange) {
        parts.push(`${ops} (0-${config.numberRange.max})`);
      } else {
        parts.push(ops);
      }
    }
  }
  
  // Mode description
  const modeLabels: Record<string, string> = {
    timed: 'Timed',
    sprint: 'Sprint',
    practice: 'Practice',
  };
  
  if (config.mode === 'timed') {
    parts.push(`${config.duration}s`);
  } else if (config.mode === 'sprint') {
    parts.push(`${config.questionCount}Q`);
  } else {
    parts.push(modeLabels[config.mode] || config.mode);
  }
  
  return parts.join(' • ');
}

/**
 * Fetch the last game configuration for a profile from their most recent session
 */
export async function getLastGameConfig(profileId: string): Promise<LastGameConfig | null> {
  try {
    // Get the most recent completed session with config data
    const sessions = await db.sessions
      .where('profileId')
      .equals(profileId)
      .filter(s => s.isCompleted && s.config != null)
      .reverse()
      .sortBy('endedAt');
    
    const lastSession = sessions[0];
    
    if (!lastSession?.config) {
      return null;
    }
    
    const cfg = lastSession.config;
    
    // Map stored config to full GameConfig format
    const lastConfig: LastGameConfig = {
      operations: (cfg.operations || []) as Operation[],
      selectedNumbers: cfg.selectedNumbers || [],
      mode: (lastSession.mode as 'timed' | 'sprint' | 'practice') || 'timed',
      inputMode: (cfg.inputMethod as 'numpad' | 'choice' | 'voice') || 'numpad',
      difficulty: (cfg.difficulty as 'easy' | 'medium' | 'hard') || 'medium',
      duration: cfg.targetDuration || 60,
      questionCount: cfg.targetQuestions || 20,
      playedAt: lastSession.endedAt || lastSession.startedAt,
      lastScore: lastSession.score,
    };
    
    // Handle number range for add/sub
    if (cfg.operations?.includes('addition') || cfg.operations?.includes('subtraction')) {
      // We can infer a basic range from the topicId or use defaults
      lastConfig.numberRange = {
        preset: 'starter',
        min: 0,
        max: 10,
        rangeType: 'operand',
        allowNegatives: false,
      };
    }
    
    return lastConfig;
  } catch (error) {
    console.error('[QuickPlay] Failed to fetch last config:', error);
    return null;
  }
}

/**
 * Convert LastGameConfig to a full GameConfig for the store
 */
export function toGameConfig(lastConfig: LastGameConfig): Partial<GameConfig> {
  return {
    operations: lastConfig.operations,
    selectedNumbers: lastConfig.selectedNumbers,
    numberRange: lastConfig.numberRange || {
      preset: 'starter',
      min: 0,
      max: 10,
      rangeType: 'operand',
      allowNegatives: false,
    },
    selectedTopics: lastConfig.selectedTopics || [],
    mode: lastConfig.mode,
    inputMode: lastConfig.inputMode,
    difficulty: lastConfig.difficulty,
    duration: lastConfig.duration,
    questionCount: lastConfig.questionCount,
  };
}
