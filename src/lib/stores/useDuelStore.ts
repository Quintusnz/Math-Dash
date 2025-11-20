import { create } from 'zustand'
import { Question, GameStatus } from './useGameStore'
import { Difficulty } from '../game-engine/question-generator';

export interface PlayerState {
  id: 'p1' | 'p2';
  score: number;
  streak: number;
  currentQuestion: Question | null;
  input: string;
  questionsAnswered: number;
  questionsCorrect: number;
  difficulty: Difficulty;
}

const INITIAL_PLAYER_STATE = {
  score: 0,
  streak: 0,
  currentQuestion: null,
  input: '',
  questionsAnswered: 0,
  questionsCorrect: 0,
  difficulty: 'easy' as Difficulty,
};

interface DuelState {
  status: GameStatus | 'setup';
  timeLeft: number;
  player1: PlayerState;
  player2: PlayerState;
  
  // Global Actions
  setSetup: () => void;
  setDifficulty: (playerId: 'p1' | 'p2', difficulty: Difficulty) => void;
  startGame: () => void;
  endGame: () => void;
  tick: () => void;

  // Player Actions
  setQuestion: (playerId: 'p1' | 'p2', question: Question) => void;
  appendInput: (playerId: 'p1' | 'p2', digit: string) => void;
  clearInput: (playerId: 'p1' | 'p2') => void;
  submitAnswer: (playerId: 'p1' | 'p2') => boolean;
}

export const useDuelStore = create<DuelState>((set, get) => ({
  status: 'setup',
  timeLeft: 60,
  player1: { ...INITIAL_PLAYER_STATE, id: 'p1' },
  player2: { ...INITIAL_PLAYER_STATE, id: 'p2' },

  setSetup: () => set({ status: 'setup' }),

  setDifficulty: (playerId, difficulty) => set((state) => ({
    [playerId === 'p1' ? 'player1' : 'player2']: {
      ...state[playerId === 'p1' ? 'player1' : 'player2'],
      difficulty
    }
  })),

  startGame: () => set((state) => ({
    status: 'playing',
    timeLeft: 60,
    player1: { ...INITIAL_PLAYER_STATE, id: 'p1', difficulty: state.player1.difficulty },
    player2: { ...INITIAL_PLAYER_STATE, id: 'p2', difficulty: state.player2.difficulty }
  })),

  endGame: () => set({ status: 'finished' }),

  tick: () => set((state) => {
    if (state.status !== 'playing') return {};
    if (state.timeLeft <= 1) return { status: 'finished', timeLeft: 0 };
    return { timeLeft: state.timeLeft - 1 };
  }),

  setQuestion: (playerId, question) => set((state) => ({
    [playerId === 'p1' ? 'player1' : 'player2']: {
      ...state[playerId === 'p1' ? 'player1' : 'player2'],
      currentQuestion: question,
      input: ''
    }
  })),

  appendInput: (playerId, digit) => set((state) => {
    const key = playerId === 'p1' ? 'player1' : 'player2';
    const player = state[key];
    return {
      [key]: { ...player, input: player.input + digit }
    };
  }),

  clearInput: (playerId) => set((state) => {
    const key = playerId === 'p1' ? 'player1' : 'player2';
    return {
      [key]: { ...state[key], input: '' }
    };
  }),

  submitAnswer: (playerId) => {
    const state = get();
    const key = playerId === 'p1' ? 'player1' : 'player2';
    const player = state[key];

    if (!player.currentQuestion) return false;

    const numericInput = parseInt(player.input, 10);
    const isCorrect = numericInput === player.currentQuestion.answer;

    set((state) => {
      const p = state[key];
      return {
        [key]: {
          ...p,
          questionsAnswered: p.questionsAnswered + 1,
          questionsCorrect: isCorrect ? p.questionsCorrect + 1 : p.questionsCorrect,
          score: isCorrect ? p.score + 10 + (p.streak * 2) : p.score,
          streak: isCorrect ? p.streak + 1 : 0
        }
      };
    });

    return isCorrect;
  }
}));
