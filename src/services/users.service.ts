import { api, unwrap, unwrapPaginated } from './api';
import { ADMIN_PREFIX } from '@/utils/constants';
import type { SleepPlanResponse, UserDetailData, UserListItem } from '@/types';

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  goal?: string;
  subscription?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const usersService = {
  list(params: UserListParams) {
    return unwrapPaginated<UserListItem>(api.get(`${ADMIN_PREFIX}/users`, { params }));
  },

  get(id: string) {
    return unwrap<UserDetailData>(api.get(`${ADMIN_PREFIX}/users/${id}`));
  },

  update(id: string, body: Record<string, unknown>) {
    return unwrap(api.put(`${ADMIN_PREFIX}/users/${id}`, body));
  },

  ban(id: string) {
    return unwrap(api.post(`${ADMIN_PREFIX}/users/${id}/ban`));
  },

  unban(id: string) {
    return unwrap(api.post(`${ADMIN_PREFIX}/users/${id}/unban`));
  },

  remove(id: string) {
    return unwrap(api.delete(`${ADMIN_PREFIX}/users/${id}`));
  },

  sleepProfile(id: string) {
    return unwrap<{ profile: unknown }>(api.get(`${ADMIN_PREFIX}/users/${id}/sleep-profile`));
  },

  sleepPlan(id: string, date?: string) {
    return unwrap<SleepPlanResponse>(api.get(`${ADMIN_PREFIX}/users/${id}/sleep-plan`, { params: date ? { date } : {} }));
  },
};
