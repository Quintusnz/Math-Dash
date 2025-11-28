'use client';

import { useEffect } from 'react';
import { useUserStore, Theme } from '@/lib/stores/useUserStore';

/**
 * Applies the current theme from user store to the document.
 * Handles 'auto' theme by detecting system preference.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useUserStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('theme-light', 'theme-dark');

    let effectiveTheme: 'light' | 'dark' = 'light';

    if (theme === 'auto') {
      // Detect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      effectiveTheme = prefersDark ? 'dark' : 'light';
    } else {
      effectiveTheme = theme;
    }

    root.classList.add(`theme-${effectiveTheme}`);
    root.setAttribute('data-theme', effectiveTheme);

    // Listen for system theme changes when in auto mode
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        root.classList.remove('theme-light', 'theme-dark');
        root.classList.add(`theme-${e.matches ? 'dark' : 'light'}`);
        root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  return <>{children}</>;
}
