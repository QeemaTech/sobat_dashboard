import { create } from 'zustand';
import { STORAGE_THEME } from '@/utils/constants';

export type ThemeMode = 'light' | 'dark';

function readStoredTheme(): ThemeMode {
  try {
    return localStorage.getItem(STORAGE_THEME) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

function applyThemeClass(mode: ThemeMode) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(mode);
  root.dataset.theme = mode;
  root.style.colorScheme = mode;
}

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  hydrate: () => void;
}

const initialTheme = readStoredTheme();
applyThemeClass(initialTheme);

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: initialTheme,

  hydrate: () => {
    const mode = readStoredTheme();
    applyThemeClass(mode);
    set({ mode });
  },

  setMode: (mode) => {
    try {
      localStorage.setItem(STORAGE_THEME, mode);
    } catch {
      /* ignore */
    }
    applyThemeClass(mode);
    set({ mode });
  },

  toggleMode: () => {
    const next = get().mode === 'dark' ? 'light' : 'dark';
    get().setMode(next);
  },
}));
