import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Profile } from '@/lib/db';

interface UserState {
  activeProfileId: string | null;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  setActiveProfileId: (id: string | null) => void;
  toggleSound: () => void;
  toggleHaptics: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      activeProfileId: null,
      soundEnabled: true,
      hapticsEnabled: true,
      setActiveProfileId: (id) => set({ activeProfileId: id }),
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      toggleHaptics: () => set((state) => ({ hapticsEnabled: !state.hapticsEnabled })),
    }),
    {
      name: 'math-dash-user-storage',
    }
  )
);
