import { create } from 'zustand'

export type GameStatus = 'idle' | 'playing' | 'paused' | 'finished'

// Base operations
export type Operation = 'addition' | 'subtraction' | 'multiplication' | 'division';

// Extended topic types (includes special topics)
export type TopicType = Operation | 'number-bonds-10' | 'number-bonds-20' | 'number-bonds-50' | 'number-bonds-100' | 'doubles' | 'halves' | 'squares';

// Topic categories for UI grouping
export type TopicCategory = 'basic-operations' | 'times-tables' | 'number-bonds' | 'doubles-halves' | 'squares';

export type GameMode = 'timed' | 'sprint' | 'practice';
export type InputMode = 'numpad' | 'choice' | 'voice';
export type Difficulty = 'easy' | 'medium' | 'hard';

// Topic configuration for special topics
export interface TopicConfig {
  type: TopicType;
  label: string;
  description: string;
  category: TopicCategory;
  icon?: string;
}

// All available special topics
export const SPECIAL_TOPICS: TopicConfig[] = [
  // Number Bonds
  { type: 'number-bonds-10', label: 'Make 10', description: 'Find pairs that sum to 10', category: 'number-bonds' },
  { type: 'number-bonds-20', label: 'Make 20', description: 'Find pairs that sum to 20', category: 'number-bonds' },
  { type: 'number-bonds-50', label: 'Make 50', description: 'Find pairs that sum to 50', category: 'number-bonds' },
  { type: 'number-bonds-100', label: 'Make 100', description: 'Find pairs that sum to 100', category: 'number-bonds' },
  // Doubles & Halves
  { type: 'doubles', label: 'Doubles', description: 'Double numbers up to 20', category: 'doubles-halves' },
  { type: 'halves', label: 'Halves', description: 'Find half of even numbers', category: 'doubles-halves' },
  // Squares
  { type: 'squares', label: 'Squares', description: 'Square numbers 1-12', category: 'squares' },
];

// Number Range types for Addition/Subtraction
export type RangePreset = 'starter' | 'builder' | 'challenge' | 'pro' | 'custom';
export type RangeType = 'operand' | 'answer';

export interface NumberRange {
  preset: RangePreset;
  min: number;  // For answer mode: answer min. For operand mode: first operand min
  max: number;  // For answer mode: answer max. For operand mode: first operand max
  min2?: number; // For operand mode: second operand min (defaults to min if not set)
  max2?: number; // For operand mode: second operand max (defaults to max if not set)
  rangeType: RangeType; // 'operand' = each number in range, 'answer' = results in range
  allowNegatives: boolean; // For subtraction - default false
}

// Preset configurations
export const NUMBER_RANGE_PRESETS: Record<Exclude<RangePreset, 'custom'>, { min: number; max: number; label: string; stars: number; yearHint: string }> = {
  starter: { min: 0, max: 10, label: 'Starter', stars: 1, yearHint: 'Years 1–2' },
  builder: { min: 0, max: 20, label: 'Builder', stars: 2, yearHint: 'Years 2–3' },
  challenge: { min: 0, max: 50, label: 'Challenge', stars: 3, yearHint: 'Years 3–4' },
  pro: { min: 0, max: 100, label: 'Pro', stars: 4, yearHint: 'Years 5–6' },
};

export interface GameConfig {
  operations: Operation[];
  selectedNumbers: number[]; // Used for multiplication/division (times tables)
  numberRange: NumberRange; // Used for addition/subtraction
  selectedTopics: TopicType[]; // Used for special topics (number bonds, doubles, etc.)
  mode: GameMode;
  inputMode: InputMode;
  difficulty: Difficulty;
  duration: number; // seconds (for timed mode)
  questionCount: number; // number of questions (for sprint mode)
}

export interface Question {
  id: string
  text: string
  answer: number
  type: Operation | TopicType // Extended to include special topic types
  fact: string // e.g. "7x8" or "10-6=?" for number bonds
}

interface GameState {
  status: GameStatus
  config: GameConfig
  score: number
  streak: number
  timeLeft: number
  timeElapsed: number
  currentQuestion: Question | null
  input: string
  questionsAnswered: number
  questionsCorrect: number
  
  // Pause tracking
  pauseCount: number
  totalPauseDuration: number // Total ms spent paused
  pauseStartedAt: number | null // Timestamp when current pause started
  
  // Actions
  setConfig: (config: Partial<GameConfig>) => void
  startGame: () => void
  pauseGame: () => void
  resumeGame: () => void
  endGame: () => void
  setQuestion: (question: Question) => void
  setInput: (value: string) => void
  appendInput: (digit: string) => void
  clearInput: () => void
  submitAnswer: () => boolean // Returns true if correct
  tick: () => void // Decrement timer or increment elapsed
}

export const useGameStore = create<GameState>((set, get) => ({
  status: 'idle',
  config: {
    operations: ['addition'],
    selectedNumbers: [],
    numberRange: {
      preset: 'starter',
      min: 0,
      max: 10,
      rangeType: 'operand',
      allowNegatives: false,
    },
    selectedTopics: [],
    mode: 'timed',
    inputMode: 'numpad',
    difficulty: 'medium',
    duration: 60,
    questionCount: 20
  },
  score: 0,
  streak: 0,
  timeLeft: 60,
  timeElapsed: 0,
  currentQuestion: null,
  input: '',
  questionsAnswered: 0,
  questionsCorrect: 0,
  pauseCount: 0,
  totalPauseDuration: 0,
  pauseStartedAt: null,

  setConfig: (config) => set((state) => ({
    config: { ...state.config, ...config }
  })),

  startGame: () => {
    const { config } = get();
    set({ 
      status: 'playing', 
      score: 0, 
      streak: 0, 
      timeLeft: config.mode === 'timed' ? config.duration : 0,
      timeElapsed: 0,
      input: '',
      questionsAnswered: 0,
      questionsCorrect: 0,
      pauseCount: 0,
      totalPauseDuration: 0,
      pauseStartedAt: null,
    });
  },
  
  pauseGame: () => set((state) => {
    if (state.status !== 'playing') return {};
    return { 
      status: 'paused',
      pauseCount: state.pauseCount + 1,
      pauseStartedAt: Date.now(),
    };
  }),
  
  resumeGame: () => set((state) => {
    if (state.status !== 'paused') return {};
    const pauseDuration = state.pauseStartedAt ? Date.now() - state.pauseStartedAt : 0;
    return { 
      status: 'playing',
      pauseStartedAt: null,
      totalPauseDuration: state.totalPauseDuration + pauseDuration,
    };
  }),
  
  endGame: () => set({ status: 'finished' }),
  
  setQuestion: (question) => set({ currentQuestion: question, input: '' }),
  
  setInput: (value) => set({ input: value }),
  
  appendInput: (digit) => set((state) => ({ input: state.input + digit })),
  
  clearInput: () => set({ input: '' }),
  
  submitAnswer: () => {
    const state = get()
    if (!state.currentQuestion) return false
    
    const numericInput = parseInt(state.input, 10)
    const isCorrect = numericInput === state.currentQuestion.answer
    
    set((state) => ({
      questionsAnswered: state.questionsAnswered + 1,
      questionsCorrect: isCorrect ? state.questionsCorrect + 1 : state.questionsCorrect,
      score: isCorrect ? state.score + 10 + (state.streak * 2) : state.score,
      streak: isCorrect ? state.streak + 1 : 0
    }))
    
    return isCorrect
  },
  
  tick: () => set((state) => {
    if (state.status !== 'playing') return {}
    
    const updates: Partial<GameState> = { timeElapsed: state.timeElapsed + 1 };

    if (state.config.mode === 'timed') {
      if (state.timeLeft <= 1) {
        return { ...updates, status: 'finished', timeLeft: 0 };
      }
      updates.timeLeft = state.timeLeft - 1;
    }
    
    return updates;
  })
}))
