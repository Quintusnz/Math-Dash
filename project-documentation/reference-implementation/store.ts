import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

interface UserState {
  currentProfileId: string | null;
  isAdultMode: boolean;
  adultModeExpiresAt: number | null;
  
  // Actions
  setCurrentProfile: (id: string) => void;
  enterAdultMode: () => void;
  exitAdultMode: () => void;
}

interface GameState {
  status: 'idle' | 'playing' | 'paused' | 'finished';
  currentTopicId: string | null;
  score: number;
  streak: number;
  
  // Actions
  startGame: (topicId: string) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  incrementScore: (points: number) => void;
  resetGame: () => void;
}

// --------------------------------------------------------------------------
// Stores
// --------------------------------------------------------------------------

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      currentProfileId: null,
      isAdultMode: false,
      adultModeExpiresAt: null,

      setCurrentProfile: (id) => set({ currentProfileId: id }),
      
      enterAdultMode: () => set({ 
        isAdultMode: true, 
        adultModeExpiresAt: Date.now() + 15 * 60 * 1000 // 15 mins
      }),
      
      exitAdultMode: () => set({ 
        isAdultMode: false, 
        adultModeExpiresAt: null 
      }),
    }),
    {
      name: 'math-dash-user-storage',
      storage: createJSONStorage(() => localStorage), // or sessionStorage
      partialize: (state) => ({ currentProfileId: state.currentProfileId }), // Don't persist adult mode
    }
  )
);

export const useGameStore = create<GameState>((set) => ({
  status: 'idle',
  currentTopicId: null,
  score: 0,
  streak: 0,

  startGame: (topicId) => set({ 
    status: 'playing', 
    currentTopicId: topicId, 
    score: 0, 
    streak: 0 
  }),
  
  pauseGame: () => set({ status: 'paused' }),
  
  resumeGame: () => set({ status: 'playing' }),
  
  endGame: () => set({ status: 'finished' }),
  
  incrementScore: (points) => set((state) => ({ 
    score: state.score + points,
    streak: state.streak + 1
  })),
  
  resetGame: () => set({ 
    status: 'idle', 
    currentTopicId: null, 
    score: 0, 
    streak: 0 
  }),
}));
