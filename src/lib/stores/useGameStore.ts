import { create } from 'zustand'

export type GameStatus = 'idle' | 'playing' | 'paused' | 'finished'

export type Operation = 'addition' | 'subtraction' | 'multiplication' | 'division';
export type GameMode = 'timed' | 'sprint' | 'practice';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GameConfig {
  operations: Operation[];
  selectedNumbers: number[];
  mode: GameMode;
  difficulty: Difficulty;
  duration: number; // seconds (for timed mode)
  questionCount: number; // number of questions (for sprint mode)
}

export interface Question {
  id: string
  text: string
  answer: number
  type: Operation
  fact: string // e.g. "7x8"
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
    mode: 'timed',
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
      questionsCorrect: 0
    });
  },
  
  pauseGame: () => set((state) => ({ 
    status: state.status === 'playing' ? 'paused' : state.status 
  })),
  
  resumeGame: () => set((state) => ({ 
    status: state.status === 'paused' ? 'playing' : state.status 
  })),
  
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
