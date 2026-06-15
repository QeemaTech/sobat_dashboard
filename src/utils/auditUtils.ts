import type { AuditLogEntry } from '@/types';

const DELETE_BURST_WINDOW_MS = 5 * 60 * 1000;
const DELETE_BURST_MIN = 3;

export type SuspiciousFlag = 'delete_burst' | 'new_ip_login';

export function buildSuspiciousMap(rows: AuditLogEntry[]): Record<string, SuspiciousFlag> {
  const map: Record<string, SuspiciousFlag> = {};

  const deletesByAdmin = new Map<string, AuditLogEntry[]>();
  for (const row of rows) {
    if (row.action === 'DELETE' && row.admin?.id) {
      const list = deletesByAdmin.get(row.admin.id) ?? [];
      list.push(row);
      deletesByAdmin.set(row.admin.id, list);
    }
  }

  for (const list of deletesByAdmin.values()) {
    const sorted = [...list].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    for (let i = 0; i < sorted.length; i++) {
      let count = 1;
      for (let j = i + 1; j < sorted.length; j++) {
        const delta = new Date(sorted[j].createdAt).getTime() - new Date(sorted[i].createdAt).getTime();
        if (delta <= DELETE_BURST_WINDOW_MS) count++;
        else break;
      }
      if (count >= DELETE_BURST_MIN) {
        for (let j = i; j < sorted.length && j < i + count; j++) {
          map[sorted[j].id] = 'delete_burst';
        }
      }
    }
  }

  const adminIps = new Map<string, Set<string>>();
  const chronological = [...rows].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  for (const row of chronological) {
    if (row.action === 'LOGIN' && row.admin?.id && row.ipAddress) {
      const ips = adminIps.get(row.admin.id) ?? new Set<string>();
      if (!ips.has(row.ipAddress)) {
        if (ips.size > 0) map[row.id] = 'new_ip_login';
        ips.add(row.ipAddress);
        adminIps.set(row.admin.id, ips);
      }
    }
  }

  return map;
}

export function parseUserAgent(ua: string | null | undefined): string {
  if (!ua) return '—';
  const browser = ua.includes('Edg/')
    ? 'Edge'
    : ua.includes('Chrome/')
      ? 'Chrome'
      : ua.includes('Firefox/')
        ? 'Firefox'
        : ua.includes('Safari/') && !ua.includes('Chrome')
          ? 'Safari'
          : 'Browser';
  const os = ua.includes('Windows')
    ? 'Windows'
    : ua.includes('Mac OS X') || ua.includes('Macintosh')
      ? 'macOS'
      : ua.includes('Android')
        ? 'Android'
        : ua.includes('iPhone') || ua.includes('iPad')
          ? 'iOS'
          : 'Unknown OS';
  return `${browser} · ${os}`;
}

export function parseIpLocation(ip: string | null | undefined) {
  if (!ip) return { flag: '🌐', label: '—', tooltip: '—' };
  if (/^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ip)) {
    return { flag: '🏠', label: 'Private', tooltip: 'Private network · Local' };
  }
  return { flag: '🇸🇦', label: 'SA', tooltip: 'Saudi Arabia' };
}

export function adminPrimaryRole(admin: AuditLogEntry['admin']): string | null {
  const role = admin?.roles?.[0]?.role;
  if (!role) return null;
  return role.nameAr || role.name;
}

export function diffRows(
  oldValues?: Record<string, unknown> | null,
  newValues?: Record<string, unknown> | null
) {
  const keys = Array.from(new Set([...Object.keys(oldValues ?? {}), ...Object.keys(newValues ?? {})]));
  return keys.map((field) => ({
    field,
    before: formatValue(oldValues?.[field]),
    after: formatValue(newValues?.[field]),
    changed: JSON.stringify(oldValues?.[field]) !== JSON.stringify(newValues?.[field]),
  }));
}

function formatValue(v: unknown) {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

export function entityLabel(entityType: string | null | undefined, entityId: string | null | undefined) {
  if (!entityType && !entityId) return '—';
  const short = entityId ? entityId.replace(/-/g, '').slice(0, 8) : '';
  return entityType ? `${entityType} #${short}` : `#${short}`;
}
