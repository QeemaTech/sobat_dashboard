import { api, unwrap, unwrapPaginated } from './api';
import { ADMIN_PREFIX } from '@/utils/constants';
import type { Supervisor } from '@/types';

export type SupervisorStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export const supervisorsService = {
  list(params?: Record<string, string | number>) {
    return unwrapPaginated<Supervisor>(api.get(`${ADMIN_PREFIX}/supervisors`, { params }));
  },

  create(body: { email: string; password: string; fullName: string; roleIds?: string[] }) {
    return unwrap<{ admin: Supervisor }>(api.post(`${ADMIN_PREFIX}/supervisors`, body));
  },

  update(id: string, body: { fullName?: string; fullNameEn?: string | null }) {
    return unwrap<{ admin: Supervisor }>(api.patch(`${ADMIN_PREFIX}/supervisors/${id}`, body));
  },

  updateStatus(id: string, status: SupervisorStatus) {
    return unwrap<{ admin: Supervisor }>(api.patch(`${ADMIN_PREFIX}/supervisors/${id}/status`, { status }));
  },

  setRoles(id: string, roleIds: string[]) {
    return unwrap<{ admin: Supervisor }>(api.put(`${ADMIN_PREFIX}/supervisors/${id}/roles`, { roleIds }));
  },

  remove(id: string) {
    return unwrap(api.delete(`${ADMIN_PREFIX}/supervisors/${id}`));
  },
};
