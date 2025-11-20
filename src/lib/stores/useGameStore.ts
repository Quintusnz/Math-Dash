import { create } from 'zustand'

export type GameStatus = 'idle' | 'playing' | 'paused' | 'finished'

export interface Question {
  id: string
  text: string
  answer: number
  type: 'addition' | 'subtraction' | 'multiplication' | 'division'
  fact: string // e.g. "7x8"
}

interface GameState {
  status: GameStatus
  score: number
  streak: number
  timeLeft: number
  currentQuestion: Question | null
  input: string
  questionsAnswered: number
  questionsCorrect: number
  
  // Actions
  startGame: () => void
  pauseGame: () => void
  resumeGame: () => void
  endGame: () => void
  setQuestion: (question: Question) => void
  setInput: (value: string) => void
  appendInput: (digit: string) => void
  clearInput: () => void
  submitAnswer: () => boolean // Returns true if correct
  tick: () => void // Decrement timer
}

export const useGameStore = create<GameState>((set, get) => ({
  status: 'idle',
  score: 0,
  streak: 0,
  timeLeft: 60, // Default 60s round
  currentQuestion: null,
  input: '',
  questionsAnswered: 0,
  questionsCorrect: 0,

  startGame: () => set({ 
    status: 'playing', 
    score: 0, 
    streak: 0, 
    timeLeft: 60, 
    input: '',
    questionsAnswered: 0,
    questionsCorrect: 0
  }),
  
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
    if (state.timeLeft <= 1) return { status: 'finished', timeLeft: 0 }
    return { timeLeft: state.timeLeft - 1 }
  })
}))
