import { useCallback } from 'react';
import { useThemeStore, type ThemeMode } from '@/store/themeStore';

export function useThemeMode() {
  const { mode, setMode, toggleMode } = useThemeStore();
  const isDark = mode === 'dark';

  const setThemeMode = useCallback((next: ThemeMode) => setMode(next), [setMode]);

  return { mode, isDark, setThemeMode, toggleMode };
}
