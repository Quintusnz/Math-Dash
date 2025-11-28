import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db, Profile, DeviceProfile, DeviceSettings } from '@/lib/db';

export type AuthStep = 
  | 'welcome'           // Initial screen with options
  | 'create-name'       // Enter display name
  | 'create-avatar'     // Choose avatar
  | 'create-age'        // Select age band
  | 'create-code'       // Show generated code
  | 'enter-code'        // Enter existing code
  | 'profile-select'    // Select from existing profiles
  | 'playing';          // Authenticated, in app

interface ProfileState {
  // Current session
  activeProfile: Profile | null;
  isAuthenticated: boolean;
  
  // Auth flow
  authStep: AuthStep;
  
  // Creation flow state
  pendingProfile: {
    displayName: string;
    avatarId: string;
    ageBand: string;
  };
  
  // Device profiles (known codes on this device)
  deviceProfiles: Profile[];
  
  // Settings
  requireCodeToSwitch: boolean;
  
  // Actions
  setAuthStep: (step: AuthStep) => void;
  setPendingName: (name: string) => void;
  setPendingAvatar: (avatarId: string) => void;
  setPendingAgeBand: (ageBand: string) => void;
  resetPendingProfile: () => void;
  
  setActiveProfile: (profile: Profile | null) => void;
  setDeviceProfiles: (profiles: Profile[]) => void;
  addDeviceProfile: (profile: Profile) => void;
  
  setRequireCodeToSwitch: (require: boolean) => void;
  
  logout: () => void;
  
  // Initialize from DB
  initialize: () => Promise<void>;
}

const initialPendingProfile = {
  displayName: '',
  avatarId: '🦊',
  ageBand: '6-8',
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      // Initial state
      activeProfile: null,
      isAuthenticated: false,
      authStep: 'welcome',
      pendingProfile: { ...initialPendingProfile },
      deviceProfiles: [],
      requireCodeToSwitch: false,
      
      // Auth flow actions
      setAuthStep: (step) => set({ authStep: step }),
      
      setPendingName: (name) => set((state) => ({
        pendingProfile: { ...state.pendingProfile, displayName: name }
      })),
      
      setPendingAvatar: (avatarId) => set((state) => ({
        pendingProfile: { ...state.pendingProfile, avatarId }
      })),
      
      setPendingAgeBand: (ageBand) => set((state) => ({
        pendingProfile: { ...state.pendingProfile, ageBand }
      })),
      
      resetPendingProfile: () => set({ 
        pendingProfile: { ...initialPendingProfile } 
      }),
      
      // Profile actions
      setActiveProfile: (profile) => set({ 
        activeProfile: profile,
        isAuthenticated: profile !== null,
        authStep: profile ? 'playing' : 'welcome'
      }),
      
      setDeviceProfiles: (profiles) => set({ deviceProfiles: profiles }),
      
      addDeviceProfile: (profile) => set((state) => {
        // Avoid duplicates
        const exists = state.deviceProfiles.some(p => p.id === profile.id);
        if (exists) {
          return { 
            deviceProfiles: state.deviceProfiles.map(p => 
              p.id === profile.id ? profile : p
            )
          };
        }
        return { deviceProfiles: [...state.deviceProfiles, profile] };
      }),
      
      setRequireCodeToSwitch: (require) => set({ requireCodeToSwitch: require }),
      
      logout: () => set({
        activeProfile: null,
        isAuthenticated: false,
        authStep: 'welcome',
        pendingProfile: { ...initialPendingProfile }
      }),
      
      // Initialize from database
      initialize: async () => {
        try {
          // Load all profiles from this device
          const profiles = await db.profiles.toArray();
          set({ deviceProfiles: profiles });
          
          // Load device settings
          const settings = await db.deviceSettings.get('default');
          if (settings) {
            set({ requireCodeToSwitch: settings.requireCodeToSwitch });
            
            // Try to restore last active profile, but only if not in a create flow
            const currentStep = get().authStep;
            const isInCreateFlow = ['create-name', 'create-avatar', 'create-age', 'create-code'].includes(currentStep);
            
            if (settings.lastActivePlayCode && !isInCreateFlow) {
              const lastProfile = profiles.find(
                p => p.playCode === settings.lastActivePlayCode
              );
              if (lastProfile) {
                set({ 
                  activeProfile: lastProfile,
                  isAuthenticated: true,
                  authStep: 'playing'
                });
              }
            }
          }
          
          // Determine initial auth step (only if not already in a flow)
          const { activeProfile, authStep } = get();
          const isInFlow = ['create-name', 'create-avatar', 'create-age', 'create-code', 'enter-code'].includes(authStep);
          if (!activeProfile && !isInFlow) {
            if (profiles.length > 0) {
              set({ authStep: 'profile-select' });
            } else {
              set({ authStep: 'welcome' });
            }
          }
        } catch (error) {
          console.error('Failed to initialize profile store:', error);
        }
      }
    }),
    {
      name: 'math-dash-profile-storage',
      partialize: (state) => ({
        // Only persist minimal data - actual profiles are in IndexedDB
        requireCodeToSwitch: state.requireCodeToSwitch,
      }),
    }
  )
);
