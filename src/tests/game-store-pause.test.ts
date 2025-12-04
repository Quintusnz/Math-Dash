import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import { useGameStore } from '@/lib/stores/useGameStore';

describe('useGameStore - Pause/Resume', () => {
  beforeEach(() => {
    // Reset store state before each test
    useGameStore.setState({
      status: 'idle',
      score: 0,
      streak: 0,
      timeLeft: 60,
      timeElapsed: 0,
      input: '',
      questionsAnswered: 0,
      questionsCorrect: 0,
      pauseCount: 0,
      totalPauseDuration: 0,
      pauseStartedAt: null,
      currentQuestion: null,
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
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('startGame', () => {
    it('should reset pause state when starting a new game', () => {
      const store = useGameStore.getState();
      
      // Set some pause state
      useGameStore.setState({
        pauseCount: 3,
        totalPauseDuration: 5000,
        pauseStartedAt: Date.now(),
      });
      
      act(() => {
        store.startGame();
      });
      
      const newState = useGameStore.getState();
      expect(newState.status).toBe('playing');
      expect(newState.pauseCount).toBe(0);
      expect(newState.totalPauseDuration).toBe(0);
      expect(newState.pauseStartedAt).toBeNull();
    });
  });

  describe('pauseGame', () => {
    it('should change status to paused when playing', () => {
      act(() => {
        useGameStore.getState().startGame();
      });
      
      expect(useGameStore.getState().status).toBe('playing');
      
      act(() => {
        useGameStore.getState().pauseGame();
      });
      
      expect(useGameStore.getState().status).toBe('paused');
    });

    it('should increment pauseCount', () => {
      act(() => {
        useGameStore.getState().startGame();
      });
      
      expect(useGameStore.getState().pauseCount).toBe(0);
      
      act(() => {
        useGameStore.getState().pauseGame();
      });
      
      expect(useGameStore.getState().pauseCount).toBe(1);
    });

    it('should set pauseStartedAt timestamp', () => {
      act(() => {
        useGameStore.getState().startGame();
      });
      
      const beforePause = Date.now();
      
      act(() => {
        useGameStore.getState().pauseGame();
      });
      
      const afterPause = Date.now();
      const { pauseStartedAt } = useGameStore.getState();
      
      expect(pauseStartedAt).not.toBeNull();
      expect(pauseStartedAt).toBeGreaterThanOrEqual(beforePause);
      expect(pauseStartedAt).toBeLessThanOrEqual(afterPause);
    });

    it('should not change state when not playing', () => {
      expect(useGameStore.getState().status).toBe('idle');
      
      act(() => {
        useGameStore.getState().pauseGame();
      });
      
      expect(useGameStore.getState().status).toBe('idle');
      expect(useGameStore.getState().pauseCount).toBe(0);
    });

    it('should not double-pause when already paused', () => {
      act(() => {
        useGameStore.getState().startGame();
        useGameStore.getState().pauseGame();
      });
      
      expect(useGameStore.getState().pauseCount).toBe(1);
      
      act(() => {
        useGameStore.getState().pauseGame();
      });
      
      // Should still be 1, not 2
      expect(useGameStore.getState().pauseCount).toBe(1);
    });
  });

  describe('resumeGame', () => {
    it('should change status to playing when paused', () => {
      act(() => {
        useGameStore.getState().startGame();
        useGameStore.getState().pauseGame();
      });
      
      expect(useGameStore.getState().status).toBe('paused');
      
      act(() => {
        useGameStore.getState().resumeGame();
      });
      
      expect(useGameStore.getState().status).toBe('playing');
    });

    it('should clear pauseStartedAt', () => {
      act(() => {
        useGameStore.getState().startGame();
        useGameStore.getState().pauseGame();
      });
      
      expect(useGameStore.getState().pauseStartedAt).not.toBeNull();
      
      act(() => {
        useGameStore.getState().resumeGame();
      });
      
      expect(useGameStore.getState().pauseStartedAt).toBeNull();
    });

    it('should accumulate pause duration', async () => {
      // Mock Date.now for predictable timing
      let mockTime = 1000000;
      vi.spyOn(Date, 'now').mockImplementation(() => mockTime);
      
      act(() => {
        useGameStore.getState().startGame();
      });
      
      // Pause at time 1000000
      act(() => {
        useGameStore.getState().pauseGame();
      });
      
      // Advance time by 5 seconds
      mockTime += 5000;
      
      act(() => {
        useGameStore.getState().resumeGame();
      });
      
      expect(useGameStore.getState().totalPauseDuration).toBe(5000);
      
      // Pause again
      act(() => {
        useGameStore.getState().pauseGame();
      });
      
      // Advance time by 3 more seconds
      mockTime += 3000;
      
      act(() => {
        useGameStore.getState().resumeGame();
      });
      
      // Total should be 5000 + 3000 = 8000
      expect(useGameStore.getState().totalPauseDuration).toBe(8000);
    });

    it('should not change state when not paused', () => {
      act(() => {
        useGameStore.getState().startGame();
      });
      
      expect(useGameStore.getState().status).toBe('playing');
      
      act(() => {
        useGameStore.getState().resumeGame();
      });
      
      expect(useGameStore.getState().status).toBe('playing');
    });
  });

  describe('tick', () => {
    it('should not tick when paused', () => {
      act(() => {
        useGameStore.getState().startGame();
      });
      
      const initialTimeLeft = useGameStore.getState().timeLeft;
      
      act(() => {
        useGameStore.getState().pauseGame();
        useGameStore.getState().tick();
      });
      
      // Timer should not have changed
      expect(useGameStore.getState().timeLeft).toBe(initialTimeLeft);
    });

    it('should tick when playing (not paused)', () => {
      act(() => {
        useGameStore.getState().startGame();
      });
      
      const initialTimeLeft = useGameStore.getState().timeLeft;
      
      act(() => {
        useGameStore.getState().tick();
      });
      
      expect(useGameStore.getState().timeLeft).toBe(initialTimeLeft - 1);
    });
  });

  describe('multiple pause/resume cycles', () => {
    it('should correctly track pause count through multiple cycles', () => {
      act(() => {
        useGameStore.getState().startGame();
      });
      
      for (let i = 1; i <= 5; i++) {
        act(() => {
          useGameStore.getState().pauseGame();
        });
        expect(useGameStore.getState().pauseCount).toBe(i);
        
        act(() => {
          useGameStore.getState().resumeGame();
        });
        expect(useGameStore.getState().pauseCount).toBe(i);
      }
    });
  });
});
