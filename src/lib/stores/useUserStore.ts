import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Profile } from '@/lib/db';

export type Theme = 'light' | 'dark' | 'auto';

interface UserState {
  activeProfileId: string | null;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  theme: Theme;
  setActiveProfileId: (id: string | null) => void;
  toggleSound: () => void;
  toggleHaptics: () => void;
  setTheme: (theme: Theme) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setHapticsEnabled: (enabled: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      activeProfileId: null,
      soundEnabled: true,
      hapticsEnabled: true,
      theme: 'light',
      setActiveProfileId: (id) => set({ activeProfileId: id }),
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      toggleHaptics: () => set((state) => ({ hapticsEnabled: !state.hapticsEnabled })),
      setTheme: (theme) => set({ theme }),
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setHapticsEnabled: (enabled) => set({ hapticsEnabled: enabled }),
    }),
    {
      name: 'math-dash-user-storage',
    }
  )
);
