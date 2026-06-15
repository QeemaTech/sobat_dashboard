import { api, unwrap, unwrapPaginated } from './api';
import { ADMIN_PREFIX } from '@/utils/constants';
import type { AppSetting } from '@/types';

export const settingsService = {
  list(params?: { limit?: number }) {
    return unwrapPaginated<AppSetting>(api.get(`${ADMIN_PREFIX}/settings`, { params: { limit: 100, ...params } }));
  },

  saveOne(setting: { key: string; value: string; valueType?: string }) {
    return unwrap(api.put(`${ADMIN_PREFIX}/settings`, setting));
  },

  saveBulk(settings: { key: string; value: string }[]) {
    return unwrap(api.put(`${ADMIN_PREFIX}/settings`, { settings }));
  },
};
