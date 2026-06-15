import { api, unwrap, unwrapPaginated } from './api';
import { ADMIN_PREFIX } from '@/utils/constants';

export type NotificationTemplateCategory = 'SLEEP' | 'WORSHIP' | 'HEALTH' | 'CUSTOM';
export type NotificationTriggerType = 'FIXED_TIME' | 'RELATIVE_TO_SLEEP' | 'RELATIVE_TO_WAKE' | 'RELATIVE_TO_FAJR';

export interface NotificationTemplate {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  category: NotificationTemplateCategory;
  triggerType: NotificationTriggerType;
  offsetMinutes: number;
  fixedTime?: string | null;
  isActive: boolean;
  enabledUsersCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type NotificationTemplateInput = Omit<NotificationTemplate, 'id' | 'enabledUsersCount' | 'createdAt' | 'updatedAt'>;

export type NotificationTemplateListParams = Record<string, string | number | boolean | undefined>;

export const notificationTemplatesService = {
  list(params?: NotificationTemplateListParams) {
    return unwrapPaginated<NotificationTemplate>(api.get(`${ADMIN_PREFIX}/notification-templates`, { params }));
  },

  create(body: NotificationTemplateInput) {
    return unwrap<{ template: NotificationTemplate }>(api.post(`${ADMIN_PREFIX}/notification-templates`, body));
  },

  update(id: string, body: Partial<NotificationTemplateInput>) {
    return unwrap<{ template: NotificationTemplate }>(api.patch(`${ADMIN_PREFIX}/notification-templates/${id}`, body));
  },

  toggle(id: string, isActive?: boolean) {
    return unwrap<{ template: NotificationTemplate }>(
      api.patch(`${ADMIN_PREFIX}/notification-templates/${id}/toggle`, isActive !== undefined ? { isActive } : {})
    );
  },

  remove(id: string) {
    return unwrap(api.delete(`${ADMIN_PREFIX}/notification-templates/${id}`));
  },
};
