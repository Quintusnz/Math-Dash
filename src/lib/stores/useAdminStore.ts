import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminState {
  isVerified: boolean;
  verifiedAt: number | null;
  verify: () => void;
  reset: () => void;
  checkExpiry: () => boolean;
}

const SESSION_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      isVerified: false,
      verifiedAt: null,

      verify: () => {
        set({
          isVerified: true,
          verifiedAt: Date.now(),
        });
      },

      reset: () => {
        set({
          isVerified: false,
          verifiedAt: null,
        });
      },

      checkExpiry: () => {
        const { verifiedAt, isVerified } = get();
        if (!isVerified || !verifiedAt) return false;

        const now = Date.now();
        const isValid = now - verifiedAt < SESSION_DURATION_MS;

        if (!isValid) {
          set({ isVerified: false, verifiedAt: null });
        }

        return isValid;
      },
    }),
    {
      name: 'math-dash-admin-storage',
    }
  )
);
