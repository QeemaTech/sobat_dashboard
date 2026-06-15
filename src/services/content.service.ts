import { api, unwrap } from './api';
import { ADMIN_PREFIX } from '@/utils/constants';
import type { ContentPageItem, ContentListResponse, SleepTipItem } from '@/types';

export const contentService = {
  list() {
    return unwrap<ContentListResponse>(api.get(`${ADMIN_PREFIX}/content`, { params: { limit: 100 } }));
  },

  createPage(body: Partial<ContentPageItem> & { slug: string }) {
    return unwrap(api.post(`${ADMIN_PREFIX}/content`, { ...body, type: 'PAGE' }));
  },

  updatePage(id: string, body: Partial<ContentPageItem>) {
    return unwrap(api.put(`${ADMIN_PREFIX}/content/${id}`, { ...body, type: 'PAGE' }));
  },

  deletePage(slug: string) {
    return unwrap(api.delete(`${ADMIN_PREFIX}/content/${slug}`, { data: { type: 'PAGE' } }));
  },

  createTip(body: Partial<SleepTipItem>) {
    return unwrap(api.post(`${ADMIN_PREFIX}/content`, { ...body, type: 'tip' }));
  },

  updateTip(id: string, body: Partial<SleepTipItem>) {
    return unwrap(api.put(`${ADMIN_PREFIX}/content/${id}`, { ...body, type: 'tip' }));
  },

  deleteTip(id: string) {
    return unwrap(api.delete(`${ADMIN_PREFIX}/content/${id}`, { data: { type: 'tip' } }));
  },
};
