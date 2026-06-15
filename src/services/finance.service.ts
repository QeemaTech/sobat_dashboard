import { api, unwrap, unwrapPaginated } from './api';
import { ADMIN_PREFIX } from '@/utils/constants';
import type {
  PaymentListItem,
  PaymentStats,
  Plan,
  SubscriptionDetail,
  SubscriptionListItem,
  SubscriptionStats,
} from '@/types';

export const financeService = {
  listPlans() {
    return unwrap<{ plans: Plan[] }>(api.get(`${ADMIN_PREFIX}/plans`)).then((r) => r.plans);
  },

  createPlan(body: Partial<Plan>) {
    return unwrap<{ plan: Plan }>(api.post(`${ADMIN_PREFIX}/plans`, body)).then((r) => r.plan);
  },

  updatePlan(id: string, body: Partial<Plan>) {
    return unwrap<{ plan: Plan }>(api.put(`${ADMIN_PREFIX}/plans/${id}`, body)).then((r) => r.plan);
  },

  deletePlan(id: string) {
    return unwrap(api.delete(`${ADMIN_PREFIX}/plans/${id}`));
  },

  subscriptionStats() {
    return unwrap<{ stats: SubscriptionStats }>(api.get(`${ADMIN_PREFIX}/subscriptions/stats`)).then((r) => r.stats);
  },

  listSubscriptions(params: Record<string, string | number | undefined>) {
    return unwrapPaginated<SubscriptionListItem>(api.get(`${ADMIN_PREFIX}/subscriptions`, { params }));
  },

  getSubscription(id: string) {
    return unwrap<{ subscription: SubscriptionDetail }>(api.get(`${ADMIN_PREFIX}/subscriptions/${id}`)).then(
      (r) => r.subscription
    );
  },

  paymentStats() {
    return unwrap<{ stats: PaymentStats }>(api.get(`${ADMIN_PREFIX}/payments/stats`)).then((r) => r.stats);
  },

  listPayments(params: Record<string, string | number | undefined>) {
    return unwrapPaginated<PaymentListItem>(api.get(`${ADMIN_PREFIX}/payments`, { params }));
  },

  refundPayment(id: string) {
    return unwrap(api.post(`${ADMIN_PREFIX}/payments/${id}/refund`));
  },
};
