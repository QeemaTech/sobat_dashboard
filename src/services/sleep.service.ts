import { api, unwrap, unwrapPaginated } from './api';
import { ADMIN_PREFIX } from '@/utils/constants';
import type { HealthSource, NapRecord, Reminder, SleepDebtRow, SleepLog, SyncLog, Notification } from '@/types';
import type { SleepInputMethodStats } from '@/types/sleepInputMethods';

export type SleepListParams = Record<string, string | number | undefined>;

export interface SleepProfileRow {
  id: string;
  userId: string;
  targetBedtime?: string | null;
  targetWakeTime?: string | null;
  targetSleepHours?: string | number | null;
  sleepGoalType?: string | null;
  mainGoal?: string | null;
  currentStreak?: number;
  fajrMode?: boolean;
  onboardingCompleted?: boolean;
  user?: { id: string; fullName: string; email: string | null };
}

export const sleepService = {
  sleepProfiles(params: SleepListParams) {
    return unwrapPaginated<SleepProfileRow>(api.get(`${ADMIN_PREFIX}/sleep-profiles`, { params }));
  },

  sleepLogs(params: SleepListParams) {
    return unwrapPaginated<SleepLog>(api.get(`${ADMIN_PREFIX}/sleep-logs`, { params }));
  },

  naps(params: SleepListParams) {
    return unwrapPaginated<NapRecord>(api.get(`${ADMIN_PREFIX}/naps`, { params }));
  },

  sleepDebt(params: SleepListParams) {
    return unwrapPaginated<SleepDebtRow>(api.get(`${ADMIN_PREFIX}/sleep-debt`, { params }));
  },

  healthSources(params?: SleepListParams) {
    return unwrapPaginated<HealthSource>(api.get(`${ADMIN_PREFIX}/health-sources/admin`, { params }));
  },

  inputMethods() {
    return unwrap<SleepInputMethodStats>(api.get(`${ADMIN_PREFIX}/health-sources/admin/input-methods`));
  },

  updateHealthSource(id: string, body: Record<string, unknown>) {
    return unwrap(api.post(`${ADMIN_PREFIX}/health-sources/admin`, { id, ...body }));
  },

  syncLogs(params: SleepListParams) {
    return unwrapPaginated<SyncLog>(api.get(`${ADMIN_PREFIX}/sync-logs`, { params }));
  },

  reminders(params: SleepListParams) {
    return unwrapPaginated<Reminder>(api.get(`${ADMIN_PREFIX}/reminders/admin`, { params }));
  },

  notifications(params: SleepListParams) {
    return unwrapPaginated<Notification>(api.get(`${ADMIN_PREFIX}/notifications/admin`, { params }));
  },

  broadcast(body: Record<string, unknown>) {
    return unwrap(api.post(`${ADMIN_PREFIX}/notifications/admin/broadcast`, body));
  },
};
