import type { HealthSource } from '@/types';

export interface SleepInputMethodStats {
  totalRecords: number;
  apple: {
    recordCount: number;
    sharePercent: number;
    lastUpdatedAt: string | null;
    isActive: boolean;
    source: HealthSource | null;
  };
  manual: {
    recordCount: number;
    sharePercent: number;
    lastUpdatedAt: string | null;
    isActive: boolean;
  };
}
