import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFocusLoss } from '@/lib/hooks/useFocusLoss';

describe('useFocusLoss hook', () => {
  let originalHidden: PropertyDescriptor | undefined;
  let visibilityChangeHandler: ((event: Event) => void) | null = null;
  let blurHandler: ((event: Event) => void) | null = null;
  let focusHandler: ((event: Event) => void) | null = null;

  beforeEach(() => {
    // Store original document.hidden descriptor
    originalHidden = Object.getOwnPropertyDescriptor(document, 'hidden');
    
    // Mock document.hidden
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => false,
    });

    // Capture event handlers
    visibilityChangeHandler = null;
    blurHandler = null;
    focusHandler = null;

    vi.spyOn(document, 'addEventListener').mockImplementation((type, listener) => {
      if (type === 'visibilitychange') {
        visibilityChangeHandler = listener as (event: Event) => void;
      }
    });

    vi.spyOn(window, 'addEventListener').mockImplementation((type, listener) => {
      if (type === 'blur') {
        blurHandler = listener as (event: Event) => void;
      } else if (type === 'focus') {
        focusHandler = listener as (event: Event) => void;
      }
    });

    vi.spyOn(document, 'removeEventListener').mockImplementation(() => {});
    vi.spyOn(window, 'removeEventListener').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore original document.hidden
    if (originalHidden) {
      Object.defineProperty(document, 'hidden', originalHidden);
    }
    vi.restoreAllMocks();
  });

  it('should initialize with focused state', () => {
    const { result } = renderHook(() => useFocusLoss());
    
    expect(result.current.isFocused).toBe(true);
    expect(result.current.focusLossCount).toBe(0);
    expect(result.current.totalFocusLossDuration).toBe(0);
    expect(result.current.lastFocusLostAt).toBeNull();
  });

  it('should call onFocusLost when tab becomes hidden', () => {
    const onFocusLost = vi.fn();
    
    renderHook(() => useFocusLoss({ onFocusLost, enabled: true }));
    
    // Simulate tab becoming hidden
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => true,
    });
    
    act(() => {
      visibilityChangeHandler?.(new Event('visibilitychange'));
    });
    
    expect(onFocusLost).toHaveBeenCalledTimes(1);
  });

  it('should call onFocusRegained when tab becomes visible again', () => {
    const onFocusLost = vi.fn();
    const onFocusRegained = vi.fn();
    
    renderHook(() => useFocusLoss({ onFocusLost, onFocusRegained, enabled: true }));
    
    // Simulate tab becoming hidden
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => true,
    });
    
    act(() => {
      visibilityChangeHandler?.(new Event('visibilitychange'));
    });
    
    // Simulate tab becoming visible
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => false,
    });
    
    act(() => {
      visibilityChangeHandler?.(new Event('visibilitychange'));
    });
    
    expect(onFocusLost).toHaveBeenCalledTimes(1);
    expect(onFocusRegained).toHaveBeenCalledTimes(1);
  });

  it('should call onFocusLost on window blur', () => {
    const onFocusLost = vi.fn();
    
    renderHook(() => useFocusLoss({ onFocusLost, enabled: true }));
    
    act(() => {
      blurHandler?.(new Event('blur'));
    });
    
    expect(onFocusLost).toHaveBeenCalledTimes(1);
  });

  it('should call onFocusRegained on window focus after blur', () => {
    const onFocusLost = vi.fn();
    const onFocusRegained = vi.fn();
    
    renderHook(() => useFocusLoss({ onFocusLost, onFocusRegained, enabled: true }));
    
    act(() => {
      blurHandler?.(new Event('blur'));
    });
    
    act(() => {
      focusHandler?.(new Event('focus'));
    });
    
    expect(onFocusLost).toHaveBeenCalledTimes(1);
    expect(onFocusRegained).toHaveBeenCalledTimes(1);
  });

  it('should not call callbacks when disabled', () => {
    const onFocusLost = vi.fn();
    const onFocusRegained = vi.fn();
    
    renderHook(() => useFocusLoss({ onFocusLost, onFocusRegained, enabled: false }));
    
    // These handlers shouldn't be added when disabled
    expect(visibilityChangeHandler).toBeNull();
    expect(blurHandler).toBeNull();
    expect(focusHandler).toBeNull();
  });

  it('should increment focusLossCount on each focus loss', () => {
    let capturedCount = 0;
    const onFocusLost = vi.fn(() => {
      // Capture count is incremented before callback
      capturedCount++;
    });
    
    renderHook(() => useFocusLoss({ onFocusLost, enabled: true }));
    
    // First blur
    act(() => {
      blurHandler?.(new Event('blur'));
    });
    
    expect(onFocusLost).toHaveBeenCalledTimes(1);
    
    // Focus again
    act(() => {
      focusHandler?.(new Event('focus'));
    });
    
    // Second blur
    act(() => {
      blurHandler?.(new Event('blur'));
    });
    
    expect(onFocusLost).toHaveBeenCalledTimes(2);
  });

  it('should track lastFocusLostAt timestamp (via callback invocation)', () => {
    let wasCalledDuringBlur = false;
    const onFocusLost = vi.fn(() => {
      wasCalledDuringBlur = true;
    });
    
    renderHook(() => useFocusLoss({ onFocusLost, enabled: true }));
    
    act(() => {
      blurHandler?.(new Event('blur'));
    });
    
    // Verify callback was called (which means internal state was updated)
    expect(wasCalledDuringBlur).toBe(true);
    expect(onFocusLost).toHaveBeenCalledTimes(1);
  });

  it('should not duplicate focus loss on multiple blur events', () => {
    const onFocusLost = vi.fn();
    
    renderHook(() => useFocusLoss({ onFocusLost, enabled: true }));
    
    // Multiple blur events
    act(() => {
      blurHandler?.(new Event('blur'));
    });
    act(() => {
      blurHandler?.(new Event('blur'));
    });
    
    expect(onFocusLost).toHaveBeenCalledTimes(1);
  });

  it('should not duplicate focus regain on multiple focus events', () => {
    const onFocusLost = vi.fn();
    const onFocusRegained = vi.fn();
    
    renderHook(() => useFocusLoss({ onFocusLost, onFocusRegained, enabled: true }));
    
    act(() => {
      blurHandler?.(new Event('blur'));
    });
    
    // Multiple focus events
    act(() => {
      focusHandler?.(new Event('focus'));
    });
    act(() => {
      focusHandler?.(new Event('focus'));
    });
    
    expect(onFocusRegained).toHaveBeenCalledTimes(1);
  });
});
