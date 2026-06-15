import type { SyncLog } from '@/types';

export type SyncLogStatus = 'SUCCESS' | 'PARTIAL' | 'FAILED' | 'IN_PROGRESS';

export const SYNC_STATUS_STYLE: Record<
  SyncLogStatus,
  { color: string; bg: string; border: string }
> = {
  SUCCESS: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.35)' },
  PARTIAL: { color: '#eab308', bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.35)' },
  FAILED: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.35)' },
  IN_PROGRESS: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.35)' },
};

export type SourceDisplayKind = 'apple' | 'manual' | 'integration';

export function syncLogSourceKind(sourceType?: string | null): SourceDisplayKind {
  if (sourceType === 'APPLE_HEALTH') return 'apple';
  if (sourceType === 'MANUAL' || sourceType === 'MANUAL_ENTRY') return 'manual';
  return 'integration';
}

export function syncLogUser(log: SyncLog) {
  return log.connection?.user ?? log.user;
}

export function syncLogCompletedAt(log: SyncLog): string | null {
  return log.completedAt ?? log.finishedAt ?? null;
}
