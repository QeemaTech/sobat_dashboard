import { create } from 'zustand';

interface BreadcrumbState {
  labels: Record<string, string>;
  setLabel: (path: string, label: string) => void;
  clearLabel: (path: string) => void;
}

export const useBreadcrumbStore = create<BreadcrumbState>((set) => ({
  labels: {},
  setLabel: (path, label) =>
    set((state) => ({
      labels: { ...state.labels, [path]: label },
    })),
  clearLabel: (path) =>
    set((state) => {
      const next = { ...state.labels };
      delete next[path];
      return { labels: next };
    }),
}));

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuidSegment(value: string) {
  return UUID_RE.test(value);
}
