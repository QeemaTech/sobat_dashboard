import { api, unwrap, unwrapPaginated } from './api';
import { ADMIN_PREFIX } from '@/utils/constants';
import type { SupportTicket, SupportTicketDetail } from '@/types';

export const supportService = {
  list(params: Record<string, string | number | undefined>) {
    return unwrapPaginated<SupportTicket>(api.get(`${ADMIN_PREFIX}/support-tickets`, { params }));
  },

  get(id: string) {
    return unwrap<{ ticket: SupportTicketDetail }>(api.get(`${ADMIN_PREFIX}/support-tickets/${id}`)).then((r) => r.ticket);
  },

  update(id: string, body: { status?: string; priority?: string }) {
    return unwrap<{ ticket: SupportTicketDetail }>(api.put(`${ADMIN_PREFIX}/support-tickets/${id}`, body)).then(
      (r) => r.ticket
    );
  },

  reply(id: string, message: string) {
    return unwrap<{ ticket: SupportTicketDetail }>(api.post(`${ADMIN_PREFIX}/support-tickets/${id}/reply`, { message })).then(
      (r) => r.ticket
    );
  },
};
