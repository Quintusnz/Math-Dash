import { useEffect, useCallback, useRef, useState } from 'react';

export interface FocusLossOptions {
  /**
   * Called when focus is lost (tab hidden, window blurred)
   */
  onFocusLost?: () => void;
  /**
   * Called when focus is regained (tab visible, window focused)
   */
  onFocusRegained?: () => void;
  /**
   * Whether the hook should be active. Set to false to disable monitoring.
   */
  enabled?: boolean;
}

export interface FocusLossState {
  /** Whether the app is currently focused */
  isFocused: boolean;
  /** Timestamp when focus was last lost (null if never lost or currently focused) */
  lastFocusLostAt: number | null;
  /** Total duration of focus loss in ms (cumulative across multiple losses) */
  totalFocusLossDuration: number;
  /** Number of times focus has been lost */
  focusLossCount: number;
}

/**
 * Hook to detect when the browser tab or window loses focus.
 * Uses both visibilitychange (for tab switches) and blur/focus (for window focus).
 * 
 * @example
 * ```tsx
 * const { isFocused, focusLossCount } = useFocusLoss({
 *   onFocusLost: () => pauseGame(),
 *   onFocusRegained: () => showResumeModal(),
 *   enabled: status === 'playing'
 * });
 * ```
 */
export function useFocusLoss(options: FocusLossOptions = {}): FocusLossState {
  const { onFocusLost, onFocusRegained, enabled = true } = options;
  
  // Track state with refs to avoid re-renders from the hook itself
  const stateRef = useRef<FocusLossState>({
    isFocused: true,
    lastFocusLostAt: null,
    totalFocusLossDuration: 0,
    focusLossCount: 0,
  });
  const [state, setState] = useState<FocusLossState>(stateRef.current);

  // Use refs for callbacks to avoid effect dependency issues
  const onFocusLostRef = useRef(onFocusLost);
  const onFocusRegainedRef = useRef(onFocusRegained);
  
  // Keep refs up to date
  useEffect(() => {
    onFocusLostRef.current = onFocusLost;
    onFocusRegainedRef.current = onFocusRegained;
  }, [onFocusLost, onFocusRegained]);

  const handleFocusLost = useCallback(() => {
    if (!stateRef.current.isFocused) return; // Already unfocused
    
    const nextState: FocusLossState = {
      ...stateRef.current,
      isFocused: false,
      lastFocusLostAt: Date.now(),
      focusLossCount: stateRef.current.focusLossCount + 1,
    };
    
    stateRef.current = nextState;
    setState(nextState);
    onFocusLostRef.current?.();
  }, []);

  const handleFocusRegained = useCallback(() => {
    if (stateRef.current.isFocused) return; // Already focused
    
    const lostAt = stateRef.current.lastFocusLostAt;
    const duration = lostAt ? Date.now() - lostAt : 0;
    
    const nextState: FocusLossState = {
      ...stateRef.current,
      isFocused: true,
      lastFocusLostAt: null,
      totalFocusLossDuration: stateRef.current.totalFocusLossDuration + duration,
    };
    
    stateRef.current = nextState;
    setState(nextState);
    onFocusRegainedRef.current?.();
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Check if document is already hidden on mount
    if (typeof document !== 'undefined' && document.hidden) {
      handleFocusLost();
    }

    // Visibility change (tab switch, minimize browser)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleFocusLost();
      } else {
        handleFocusRegained();
      }
    };

    // Window blur/focus (clicking outside the window)
    const handleWindowBlur = () => handleFocusLost();
    const handleWindowFocus = () => handleFocusRegained();

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [enabled, handleFocusLost, handleFocusRegained]);

  // Reset state when disabled/re-enabled
  useEffect(() => {
    if (!enabled) {
      stateRef.current = {
        isFocused: true,
        lastFocusLostAt: null,
        totalFocusLossDuration: 0,
        focusLossCount: 0,
      };
      setState(stateRef.current);
    }
  }, [enabled]);

  return state;
}
