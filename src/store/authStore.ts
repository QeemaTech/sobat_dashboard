import { create } from 'zustand';
import type { AdminProfile } from '@/types';
import {
  STORAGE_ACCESS,
  STORAGE_ADMIN,
  STORAGE_REFRESH,
  STORAGE_REMEMBER,
  STORAGE_REMEMBER_EMAIL,
} from '@/utils/constants';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  admin: AdminProfile | null;
  rememberMe: boolean;
  setSession: (
    tokens: { accessToken: string; refreshToken: string },
    admin: AdminProfile,
    rememberMe: boolean
  ) => void;
  clearSession: () => void;
  hydrate: () => void;
}

function sessionStorageFor(rememberMe: boolean): Storage {
  return rememberMe ? localStorage : sessionStorage;
}

function loadAdminFrom(storage: Storage): AdminProfile | null {
  try {
    const raw = storage.getItem(STORAGE_ADMIN);
    return raw ? (JSON.parse(raw) as AdminProfile) : null;
  } catch {
    return null;
  }
}

function clearAuthStorage(storage: Storage) {
  storage.removeItem(STORAGE_ACCESS);
  storage.removeItem(STORAGE_REFRESH);
  storage.removeItem(STORAGE_ADMIN);
}

function readRememberPreference(): boolean {
  return localStorage.getItem(STORAGE_REMEMBER) !== 'false';
}

export function getRememberedEmail(): string {
  if (!readRememberPreference()) return '';
  return localStorage.getItem(STORAGE_REMEMBER_EMAIL) ?? '';
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  admin: null,
  rememberMe: readRememberPreference(),

  hydrate: () => {
    const rememberMe = readRememberPreference();
    let storage: Storage | null = null;

    if (localStorage.getItem(STORAGE_ACCESS)) {
      storage = localStorage;
    } else if (sessionStorage.getItem(STORAGE_ACCESS)) {
      storage = sessionStorage;
    }

    set({
      rememberMe,
      accessToken: storage?.getItem(STORAGE_ACCESS) ?? null,
      refreshToken: storage?.getItem(STORAGE_REFRESH) ?? null,
      admin: storage ? loadAdminFrom(storage) : null,
    });
  },

  setSession: (tokens, admin, rememberMe) => {
    clearAuthStorage(localStorage);
    clearAuthStorage(sessionStorage);

    const storage = sessionStorageFor(rememberMe);
    storage.setItem(STORAGE_ACCESS, tokens.accessToken);
    storage.setItem(STORAGE_REFRESH, tokens.refreshToken);
    storage.setItem(STORAGE_ADMIN, JSON.stringify(admin));

    localStorage.setItem(STORAGE_REMEMBER, rememberMe ? 'true' : 'false');
    if (rememberMe) {
      localStorage.setItem(STORAGE_REMEMBER_EMAIL, admin.email);
    } else {
      localStorage.removeItem(STORAGE_REMEMBER_EMAIL);
    }

    set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      admin,
      rememberMe,
    });
  },

  clearSession: () => {
    clearAuthStorage(localStorage);
    clearAuthStorage(sessionStorage);
    set({ accessToken: null, refreshToken: null, admin: null });
  },
}));
