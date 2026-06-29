import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import {
  Box,
  Chip,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { TicketDetailPanel } from '@/components/support/TicketDetailPanel';
import { TicketListCard } from '@/components/support/TicketListCard';
import { ExportCsvButton } from '@/components/ui/ExportCsvButton';
import { TICKET_STATUS_STYLE } from '@/components/support/TicketStatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Select';
import { supportService } from '@/services/support.service';
import { useAuthStore } from '@/store/authStore';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { SupportTicket, SupportTicketCategory, TicketPriority, TicketStatus } from '@/types';
import { compareByPriority } from '@/utils/supportUtils';
import { formatDateTime, exportCsv } from '@/utils/formatters';

const STATUS_TABS: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'WAITING_USER', 'RESOLVED', 'CLOSED'];
const CATEGORY_OPTIONS: SupportTicketCategory[] = [
  'TECHNICAL_ISSUE',
  'FEATURE_SUGGESTION',
  'GENERAL_FEEDBACK',
];
type SortKey = 'newest' | 'oldest' | 'priority' | 'updated';

export function SupportPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const qc = useQueryClient();
  const currentAdmin = useAuthStore((s) => s.admin);
  const [statusTab, setStatusTab] = useState<TicketStatus | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<SupportTicketCategory | ''>('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [sortBy, setSortBy] = useState<SortKey>('newest');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [assignedMap, setAssignedMap] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['support-tickets'],
    queryFn: () => supportService.list({ limit: 100 }),
  });

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ['support-ticket', selectedId],
    queryFn: () => supportService.get(selectedId!),
    enabled: !!selectedId,
  });

  const updateMut = useMutation({
    mutationFn: (body: { status?: string; priority?: string; id?: string }) => {
      const { id, ...rest } = body;
      return supportService.update(id ?? selectedId!, rest);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['support-tickets'] });
      qc.invalidateQueries({ queryKey: ['support-ticket', selectedId] });
      setToast(t('support.updateSuccess'));
    },
  });

  const replyMut = useMutation({
    mutationFn: (message: string) => supportService.reply(selectedId!, message),
    onSuccess: () => {
      setReply('');
      qc.invalidateQueries({ queryKey: ['support-tickets'] });
      qc.invalidateQueries({ queryKey: ['support-ticket', selectedId] });
      setToast(t('support.replySuccess'));
    },
  });

  const allTickets = data?.data ?? [];

  useEffect(() => {
    const ticketId = (location.state as { ticketId?: string } | null)?.ticketId;
    if (ticketId) setSelectedId(ticketId);
  }, [location.state]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { '': allTickets.length };
    for (const s of STATUS_TABS) counts[s] = 0;
    for (const tk of allTickets) counts[tk.status] = (counts[tk.status] ?? 0) + 1;
    return counts;
  }, [allTickets]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { '': allTickets.length };
    for (const category of CATEGORY_OPTIONS) counts[category] = 0;
    for (const tk of allTickets) {
      if (tk.category) counts[tk.category] = (counts[tk.category] ?? 0) + 1;
    }
    return counts;
  }, [allTickets]);

  const filtered = useMemo(() => {
    let rows = [...allTickets];
    if (statusTab) rows = rows.filter((tk) => tk.status === statusTab);
    if (categoryFilter) rows = rows.filter((tk) => tk.category === categoryFilter);
    const q = debouncedSearch.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (tk) =>
          tk.subject.toLowerCase().includes(q) ||
          tk.user?.fullName.toLowerCase().includes(q) ||
          tk.user?.email?.toLowerCase().includes(q)
      );
    }
    rows.sort((a, b) => {
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'priority') return compareByPriority(a, b);
      if (sortBy === 'updated') {
        return new Date(b.updatedAt ?? b.createdAt).getTime() - new Date(a.updatedAt ?? a.createdAt).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return rows;
  }, [allTickets, statusTab, categoryFilter, debouncedSearch, sortBy]);

  const assignToMe = useCallback(
    (ticket: SupportTicket) => {
      setSelectedId(ticket.id);
      if (currentAdmin?.fullName) {
        setAssignedMap((m) => ({ ...m, [ticket.id]: currentAdmin.fullName }));
      }
      updateMut.mutate({ id: ticket.id, status: 'IN_PROGRESS' });
    },
    [currentAdmin?.fullName, updateMut]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedId) setSelectedId(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedId]);

  const assignedName = selectedId ? assignedMap[selectedId] ?? (detail?.status === 'IN_PROGRESS' ? currentAdmin?.fullName ?? null : null) : null;

  function handleExport() {
    exportCsv(
      'support-tickets.csv',
      [
        t('support.colSubject'),
        t('common.name'),
        t('common.email'),
        t('common.status'),
        t('support.colCategory'),
        t('support.priority'),
        t('common.registeredAt'),
      ],
      filtered.map((tk) => [
        tk.subject,
        tk.user?.fullName ?? t('support.unknownUser'),
        tk.user?.email ?? '',
        t(`ticketStatus.${tk.status}`, tk.status),
        t(`support.category.${tk.category}`, { defaultValue: tk.category ?? '—' }),
        t(`ticketPriority.${tk.priority}`, tk.priority),
        formatDateTime(tk.createdAt),
      ])
    );
  }

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          height: 'calc(100vh - 7rem)',
          minHeight: 520,
          overflow: 'hidden',
          border: 1,
          borderColor: 'divider',
          borderRadius: 3,
        }}
      >
        <Box
          sx={{
            width: { xs: selectedId ? 0 : '100%', md: 380 },
            flexShrink: 0,
            display: { xs: selectedId ? 'none' : 'flex', md: 'flex' },
            flexDirection: 'column',
            borderRight: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ px: 2, pt: 2, pb: 1.5, borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {t('support.title')}
              </Typography>
              <Chip size="small" label={t('support.ticketCount', { count: allTickets.length })} sx={{ fontWeight: 600 }} />
              <Box sx={{ flex: 1 }} />
              <ExportCsvButton onClick={handleExport} disabled={!filtered.length} />
            </Box>

            <Box
              sx={{
                display: 'flex',
                gap: 0.75,
                overflowX: 'auto',
                pb: 0.5,
                flexWrap: 'nowrap',
                '&::-webkit-scrollbar': { height: 4 },
              }}
            >
              <FilterChip
                label={t('filters.all')}
                count={statusCounts['']}
                active={statusTab === ''}
                onClick={() => setStatusTab('')}
              />
              {STATUS_TABS.map((s) => (
                <FilterChip
                  key={s}
                  label={t(`ticketStatus.${s}`, s)}
                  count={statusCounts[s] ?? 0}
                  active={statusTab === s}
                  onClick={() => setStatusTab(s)}
                  color={TICKET_STATUS_STYLE[s].color}
                  bg={TICKET_STATUS_STYLE[s].bg}
                  border={TICKET_STATUS_STYLE[s].border}
                />
              ))}
            </Box>

            <Box
              sx={{
                display: 'flex',
                gap: 0.75,
                overflowX: 'auto',
                pb: 0.5,
                flexWrap: 'nowrap',
                '&::-webkit-scrollbar': { height: 4 },
              }}
            >
              <FilterChip
                label={t('support.filterAllCategories')}
                count={categoryCounts['']}
                active={categoryFilter === ''}
                onClick={() => setCategoryFilter('')}
              />
              {CATEGORY_OPTIONS.map((category) => (
                <FilterChip
                  key={category}
                  label={t(`support.category.${category}`, category)}
                  count={categoryCounts[category] ?? 0}
                  active={categoryFilter === category}
                  onClick={() => setCategoryFilter(category)}
                />
              ))}
            </Box>
          </Box>

          <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column', gap: 1 }}>
            <TextField
              size="small"
              fullWidth
              placeholder={t('support.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlinedIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Select
              label={t('support.sortBy')}
              value={sortBy}
              onChange={(v) => setSortBy(v as SortKey)}
              options={[
                { value: 'newest', label: t('support.sortNewest') },
                { value: 'oldest', label: t('support.sortOldest') },
                { value: 'priority', label: t('support.sortPriority') },
                { value: 'updated', label: t('support.sortUpdated') },
              ]}
            />
          </Box>

          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {isLoading ? (
              <TicketListCard.Skeleton />
            ) : filtered.length === 0 ? (
              <EmptyState message={debouncedSearch ? t('support.emptySearch') : t('support.emptyList')} />
            ) : (
              filtered.map((ticket) => (
                <TicketListCard
                  key={ticket.id}
                  ticket={ticket}
                  selected={selectedId === ticket.id}
                  onSelect={() => setSelectedId(ticket.id)}
                  onAssignToMe={() => assignToMe(ticket)}
                />
              ))
            )}
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
            display: { xs: selectedId ? 'flex' : 'none', md: 'flex' },
            flexDirection: 'column',
            minWidth: 0,
            bgcolor: 'background.default',
          }}
        >
          {selectedId && (
            <Box sx={{ display: { md: 'none' }, px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
              <Typography
                component="button"
                variant="body2"
                onClick={() => setSelectedId(null)}
                sx={{ border: 0, bgcolor: 'transparent', color: 'primary.main', cursor: 'pointer', fontWeight: 600 }}
              >
                ← {t('support.backToList')}
              </Typography>
            </Box>
          )}
          <TicketDetailPanel
            detail={selectedId ? detail : undefined}
            loading={!!selectedId && detailLoading}
            reply={reply}
            onReplyChange={setReply}
            onSendReply={() => replyMut.mutate(reply)}
            onCloseTicket={() => updateMut.mutate({ status: 'CLOSED' })}
            onStatusChange={(status) => updateMut.mutate({ status })}
            onPriorityChange={(priority) => updateMut.mutate({ priority })}
            assignedAdminName={assignedName}
            onAssignChange={(name) => {
              if (selectedId && name) {
                setAssignedMap((m) => ({ ...m, [selectedId]: name }));
                updateMut.mutate({ status: 'IN_PROGRESS' });
              }
            }}
            sending={replyMut.isPending}
            updating={updateMut.isPending}
            toast={toast}
            onToastClose={() => setToast(null)}
          />
        </Box>
      </Paper>
    </Box>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
  color,
  bg,
  border,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  color?: string;
  bg?: string;
  border?: string;
}) {
  return (
    <Chip
      size="small"
      label={`${label} (${count})`}
      onClick={onClick}
      sx={{
        flexShrink: 0,
        fontWeight: 600,
        fontSize: 12,
        cursor: 'pointer',
        ...(active
          ? {
              color: color ?? 'primary.contrastText',
              bgcolor: color ? bg : 'primary.main',
              border: `1px solid ${border ?? 'transparent'}`,
              '&:hover': { bgcolor: color ? bg : 'primary.dark', opacity: 0.95 },
            }
          : {
              color: color ?? 'text.secondary',
              bgcolor: bg ?? 'action.hover',
              border: `1px solid ${border ?? 'divider'}`,
              opacity: 0.85,
              '&:hover': { opacity: 1 },
            }),
      }}
    />
  );
}
