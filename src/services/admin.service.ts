import { api, unwrap } from './api';
import { ADMIN_PREFIX } from '@/utils/constants';
import type { AnalyticsData, OverviewData } from '@/types';

export const adminService = {
  getOverview() {
    return unwrap<OverviewData>(api.get(`${ADMIN_PREFIX}/overview`));
  },

  getAnalytics(days = 30) {
    return unwrap<AnalyticsData>(api.get(`${ADMIN_PREFIX}/analytics`, { params: { days } }));
  },
};
