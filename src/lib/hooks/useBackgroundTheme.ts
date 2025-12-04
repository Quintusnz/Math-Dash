import { useState, useEffect, useRef } from 'react';

const STORAGE_KEY = 'math-dash-bg-history';
const HISTORY_SIZE = 3;

// Theme indices (0-3) corresponding to the theme classes
const THEME_COUNT = 4;

/**
 * Gets a background theme index that hasn't been used in the last 3 visits.
 * Persists history to localStorage so themes rotate across page visits.
 */
function getNextThemeIndex(): number {
  // Read history from localStorage
  let history: number[] = [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      history = JSON.parse(stored);
      // Validate it's an array of numbers
      if (!Array.isArray(history) || !history.every(n => typeof n === 'number')) {
        history = [];
      }
    }
  } catch {
    // Ignore parse errors
    history = [];
  }
  
  // Find available themes (not in recent history)
  const availableThemes = Array.from({ length: THEME_COUNT }, (_, i) => i)
    .filter(i => !history.includes(i));
  
  // If all themes are in history (shouldn't happen with 4 themes and 3 history),
  // just pick randomly from all
  const pool = availableThemes.length > 0 ? availableThemes : Array.from({ length: THEME_COUNT }, (_, i) => i);
  
  // Pick random from available
  const selectedIndex = pool[Math.floor(Math.random() * pool.length)];
  
  // Update history (add to front, trim to HISTORY_SIZE)
  const newHistory = [selectedIndex, ...history].slice(0, HISTORY_SIZE);
  
  // Save to localStorage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  } catch {
    // Ignore storage errors
  }
  
  return selectedIndex;
}

/**
 * Hook that returns a background theme class, ensuring variety across visits.
 * Tracks the last 3 themes used and picks a different one each time.
 * 
 * @param themes - Array of theme class names
 * @returns The selected theme class name
 */
export function useBackgroundTheme<T extends readonly string[]>(themes: T): T[number] {
  // Use a ref to ensure we only pick the theme once per component mount
  const hasPickedRef = useRef(false);
  const [themeIndex, setThemeIndex] = useState<number>(0);

  useEffect(() => {
    // Only pick a theme once when the component mounts on the client
    if (!hasPickedRef.current) {
      hasPickedRef.current = true;
      const index = getNextThemeIndex();
      setThemeIndex(index);
    }
  }, []);

  return themes[themeIndex];
}
