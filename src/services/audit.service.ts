import { api, unwrap, unwrapPaginated } from './api';
import { ADMIN_PREFIX } from '@/utils/constants';
import type { AuditLogEntry, AuditLogStats } from '@/types';

export const auditService = {
  list(params: Record<string, string | number | undefined>) {
    return unwrapPaginated<AuditLogEntry>(api.get(`${ADMIN_PREFIX}/audit-log`, { params }));
  },

  stats(params: Record<string, string | number | undefined>) {
    return unwrap<AuditLogStats>(api.get(`${ADMIN_PREFIX}/audit-log/stats`, { params }));
  },

  async exportCsv(params: Record<string, string | undefined>) {
    const res = await api.get(`${ADMIN_PREFIX}/audit-log`, {
      params: { ...params, export: 'csv' },
      responseType: 'blob',
    });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit-log.csv';
    a.click();
    URL.revokeObjectURL(url);
  },
};
