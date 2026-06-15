import type { SupportTicket, TicketPriority } from '@/types';

const PRIORITY_RANK: Record<TicketPriority, number> = {
  URGENT: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

export function ticketHasStaffReply(ticket: SupportTicket) {
  return (ticket.replies?.length ?? 0) > 0;
}

export function ticketIsUnread(ticket: SupportTicket) {
  if (ticketHasStaffReply(ticket)) return false;
  return ticket.status === 'OPEN' || ticket.status === 'WAITING_USER';
}

export function compareByPriority(a: SupportTicket, b: SupportTicket) {
  return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
}

export function ticketDisplayId(id: string) {
  return `TKT-${id.replace(/-/g, '').slice(0, 4).toUpperCase()}`;
}
