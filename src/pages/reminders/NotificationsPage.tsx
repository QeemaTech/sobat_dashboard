import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select as MuiSelect,
  Skeleton,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { PageHeader } from '@/components/ui/PageHeader';
import { TabBar } from '@/components/ui/TabBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { ThemedCard } from '@/components/ui/ThemedCard';
import { NotificationChannelBadge } from '@/components/notifications/NotificationChannelBadge';
import { NotificationReadIndicator } from '@/components/notifications/NotificationReadIndicator';
import { NotificationTypeBadge } from '@/components/notifications/NotificationTypeBadge';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { sleepService } from '@/services/sleep.service';
import { usersService } from '@/services/users.service';
import type { Notification } from '@/types';
import { formatDateTime, formatRelativeTime } from '@/utils/formatters';

const BODY_MAX = 500;
const LOG_DEFAULTS = { type: '', channel: '', search: '' };
const TYPE_CHIPS = ['', 'REMINDER', 'SYSTEM', 'SLEEP_DEBT'] as const;
const CHANNEL_CHIPS = ['', 'IN_APP', 'PUSH'] as const;
const SEND_TYPES = ['SYSTEM', 'REMINDER', 'SLEEP_DEBT', 'SUBSCRIPTION'] as const;
const SEND_CHANNELS = ['IN_APP', 'PUSH'] as const;
const COL_COUNT = 6;

function sentAt(row: Notification) {
  return row.sentAt ?? row.createdAt;
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: COL_COUNT }).map((__, j) => (
            <TableCell key={j}>
              <Skeleton variant="text" width={j === 0 ? 100 : j === 2 ? 160 : 72} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export function NotificationsPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [tab, setTab] = useState('log');
  const { filters, setFilter, page, setPage } = useUrlFilters(LOG_DEFAULTS);

  const [target, setTarget] = useState<'all' | 'user' | 'subscribers'>('all');
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const debouncedUserSearch = useDebouncedValue(userSearch, 400);
  const [form, setForm] = useState({
    type: 'SYSTEM',
    titleAr: '',
    titleEn: '',
    bodyAr: '',
    bodyEn: '',
    channel: 'PUSH',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState('');

  const params = useMemo(
    () => ({
      page,
      limit: 20,
      sortOrder: 'desc' as const,
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.channel ? { channel: filters.channel } : {}),
      ...(filters.search.trim() ? { search: filters.search.trim() } : {}),
    }),
    [filters, page]
  );

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['notifications', params],
    queryFn: () => sleepService.notifications(params),
    enabled: tab === 'log',
  });

  const { data: userResults } = useQuery({
    queryKey: ['notif-user-search', debouncedUserSearch],
    queryFn: () => usersService.list({ search: debouncedUserSearch, limit: 8 }),
    enabled: tab === 'send' && target === 'user' && debouncedUserSearch.length >= 2,
  });

  const broadcastMut = useMutation({
    mutationFn: async () => {
      let userIds = selectedUserIds;
      if (target === 'all') {
        const all = await usersService.list({ limit: 100, status: 'ACTIVE' });
        userIds = all.data.map((u) => u.id);
      } else if (target === 'subscribers') {
        const subs = await usersService.list({ limit: 100, subscription: 'ACTIVE' });
        userIds = subs.data.map((u) => u.id);
      }
      return sleepService.broadcast({
        type: form.type,
        titleAr: form.titleAr.trim(),
        titleEn: form.titleEn.trim() || null,
        bodyAr: form.bodyAr.trim(),
        bodyEn: form.bodyEn.trim() || null,
        channel: form.channel,
        targets: { userIds },
      });
    },
    onSuccess: (result) => {
      const created = (result as { created?: number }).created ?? 0;
      qc.invalidateQueries({ queryKey: ['notifications'] });
      setTab('log');
      setToast(t('notifications.sendSuccess', { count: created }));
      setForm({ type: 'SYSTEM', titleAr: '', titleEn: '', bodyAr: '', bodyEn: '', channel: 'PUSH' });
      setFormErrors({});
      setSelectedUserIds([]);
      setUserSearch('');
    },
  });

  function validateForm() {
    const errors: Record<string, string> = {};
    if (!form.titleAr.trim()) errors.titleAr = t('notifications.errors.titleArRequired');
    if (!form.bodyAr.trim()) errors.bodyAr = t('notifications.errors.bodyArRequired');
    if (form.bodyAr.length > BODY_MAX) errors.bodyAr = t('notifications.errors.bodyTooLong', { max: BODY_MAX });
    if (form.bodyEn.length > BODY_MAX) errors.bodyEn = t('notifications.errors.bodyTooLong', { max: BODY_MAX });
    if (target === 'user' && selectedUserIds.length === 0) errors.target = t('notifications.errors.usersRequired');
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSend() {
    if (!validateForm()) return;
    broadcastMut.mutate();
  }

  return (
    <Box>
      <PageHeader title={t('reminders.notificationsTitle')} description={t('notifications.pageSubtitle')} />

      <TabBar
        tabs={[
          { id: 'log', label: t('notifications.tabLog') },
          { id: 'send', label: t('notifications.tabSend') },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'log' && (
        <>
          <Paper elevation={0} sx={{ p: 2, mb: 2, border: 1, borderColor: 'divider', borderRadius: 3 }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  {t('notifications.colType')}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {TYPE_CHIPS.map((type) => (
                    <Chip
                      key={type || 'all-types'}
                      label={type ? t(`notifications.types.${type}`) : t('notifications.filterAll')}
                      clickable
                      size="small"
                      color={filters.type === type ? 'primary' : 'default'}
                      variant={filters.type === type ? 'filled' : 'outlined'}
                      onClick={() => {
                        setPage(1);
                        setFilter('type', type);
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  {t('notifications.colChannel')}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {CHANNEL_CHIPS.map((channel) => (
                    <Chip
                      key={channel || 'all-channels'}
                      label={channel ? t(`notifications.channels.${channel}`) : t('notifications.filterAll')}
                      clickable
                      size="small"
                      color={filters.channel === channel ? 'primary' : 'default'}
                      variant={filters.channel === channel ? 'filled' : 'outlined'}
                      onClick={() => {
                        setPage(1);
                        setFilter('channel', channel);
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <TextField
                size="small"
                placeholder={t('notifications.searchPlaceholder')}
                value={filters.search}
                onChange={(e) => {
                  setPage(1);
                  setFilter('search', e.target.value);
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <SearchOutlinedIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                    ),
                  },
                }}
                sx={{ maxWidth: 360 }}
              />
            </Stack>
          </Paper>

          {isError ? (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              action={
                <Button color="inherit" size="small" onClick={() => refetch()}>
                  {t('common.retry')}
                </Button>
              }
            >
              {(error as Error).message}
            </Alert>
          ) : null}

          <TableContainer
            component={Paper}
            elevation={0}
            sx={{ border: 1, borderColor: 'divider', borderRadius: 3, overflowX: 'auto' }}
          >
            <Table size="small" sx={{ minWidth: 720, tableLayout: 'fixed', width: '100%' }}>
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  {[
                    { key: 'user', label: t('common.name'), width: '18%' },
                    { key: 'type', label: t('notifications.colType'), width: '14%' },
                    { key: 'title', label: t('notifications.colTitle'), width: '28%' },
                    { key: 'channel', label: t('notifications.colChannel'), width: '14%' },
                    { key: 'read', label: t('notifications.colRead'), width: '8%' },
                    { key: 'sent', label: t('notifications.colSent'), width: '18%' },
                  ].map((col) => (
                    <TableCell
                      key={col.key}
                      sx={{
                        fontWeight: 600,
                        color: 'text.secondary',
                        whiteSpace: 'nowrap',
                        py: 1.5,
                        width: col.width,
                      }}
                    >
                      {col.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableSkeleton />
                ) : !data?.data?.length ? (
                  <TableRow>
                    <TableCell colSpan={COL_COUNT} sx={{ border: 0 }}>
                      <EmptyState message={t('notifications.empty')} />
                    </TableCell>
                  </TableRow>
                ) : (
                  data.data.map((row) => (
                    <TableRow
                      key={row.id}
                      hover
                      sx={{
                        bgcolor: row.isRead ? 'transparent' : 'rgba(59, 130, 246, 0.04)',
                        '&:last-child td': { borderBottom: 0 },
                      }}
                    >
                      <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {row.user ? (
                          <Link
                            component={RouterLink}
                            to={`/admin/users/${row.userId}`}
                            color="primary"
                            underline="hover"
                            sx={{ fontWeight: 500 }}
                          >
                            {row.user.fullName}
                          </Link>
                        ) : (
                          row.userId
                        )}
                      </TableCell>
                      <TableCell>
                        <NotificationTypeBadge type={row.type} />
                      </TableCell>
                      <TableCell
                        sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        title={row.titleAr}
                      >
                        <Typography variant="body2" noWrap>
                          {row.titleAr}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <NotificationChannelBadge channel={row.channel} />
                      </TableCell>
                      <TableCell align="center">
                        <NotificationReadIndicator isRead={row.isRead} />
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Tooltip title={formatDateTime(sentAt(row))}>
                          <Typography variant="body2">{formatRelativeTime(sentAt(row))}</Typography>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {data?.meta && data.meta.totalPages > 1 && (
            <Pagination page={page} totalPages={data.meta.totalPages} onPageChange={setPage} />
          )}
        </>
      )}

      {tab === 'send' && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <ThemedCard>
              <Stack spacing={2}>
                <FormControl size="small" fullWidth error={!!formErrors.target}>
                  <InputLabel>{t('notifications.target')}</InputLabel>
                  <MuiSelect
                    label={t('notifications.target')}
                    value={target}
                    onChange={(e) => {
                      setTarget(e.target.value as typeof target);
                      setFormErrors((prev) => ({ ...prev, target: '' }));
                    }}
                  >
                    <MenuItem value="all">{t('notifications.targetAll')}</MenuItem>
                    <MenuItem value="user">{t('notifications.targetUser')}</MenuItem>
                    <MenuItem value="subscribers">{t('notifications.targetSubscribers')}</MenuItem>
                  </MuiSelect>
                  {formErrors.target && <FormHelperText>{formErrors.target}</FormHelperText>}
                </FormControl>

                {target === 'user' && (
                  <>
                    <TextField
                      size="small"
                      fullWidth
                      label={t('filters.userSearch')}
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                    />
                    {userResults?.data?.map((u) => (
                      <FormControlLabel
                        key={u.id}
                        control={
                          <Checkbox
                            size="small"
                            checked={selectedUserIds.includes(u.id)}
                            onChange={(e) =>
                              setSelectedUserIds(
                                e.target.checked
                                  ? [...selectedUserIds, u.id]
                                  : selectedUserIds.filter((id) => id !== u.id)
                              )
                            }
                          />
                        }
                        label={<Typography variant="body2">{u.fullName}</Typography>}
                      />
                    ))}
                  </>
                )}

                <FormControl size="small" fullWidth>
                  <InputLabel>{t('notifications.colType')}</InputLabel>
                  <MuiSelect
                    label={t('notifications.colType')}
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    {SEND_TYPES.map((v) => (
                      <MenuItem key={v} value={v}>
                        {t(`notifications.types.${v}`)}
                      </MenuItem>
                    ))}
                  </MuiSelect>
                </FormControl>

                <FormControl size="small" fullWidth>
                  <InputLabel>{t('notifications.channel')}</InputLabel>
                  <MuiSelect
                    label={t('notifications.channel')}
                    value={form.channel}
                    onChange={(e) => setForm({ ...form, channel: e.target.value })}
                  >
                    {SEND_CHANNELS.map((v) => (
                      <MenuItem key={v} value={v}>
                        {t(`notifications.channels.${v}`)}
                      </MenuItem>
                    ))}
                  </MuiSelect>
                </FormControl>

                <TextField
                  size="small"
                  fullWidth
                  required
                  label={t('notifications.titleAr')}
                  value={form.titleAr}
                  onChange={(e) => {
                    setForm({ ...form, titleAr: e.target.value });
                    if (formErrors.titleAr) setFormErrors((prev) => ({ ...prev, titleAr: '' }));
                  }}
                  error={!!formErrors.titleAr}
                  helperText={formErrors.titleAr}
                />
                <TextField
                  size="small"
                  fullWidth
                  label={t('notifications.titleEn')}
                  value={form.titleEn}
                  onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                />
                <TextField
                  size="small"
                  fullWidth
                  required
                  multiline
                  rows={4}
                  label={t('notifications.bodyAr')}
                  value={form.bodyAr}
                  onChange={(e) => {
                    setForm({ ...form, bodyAr: e.target.value });
                    if (formErrors.bodyAr) setFormErrors((prev) => ({ ...prev, bodyAr: '' }));
                  }}
                  error={!!formErrors.bodyAr}
                  helperText={
                    formErrors.bodyAr ||
                    t('notifications.charCount', { current: form.bodyAr.length, max: BODY_MAX })
                  }
                />
                <TextField
                  size="small"
                  fullWidth
                  multiline
                  rows={4}
                  label={t('notifications.bodyEn')}
                  value={form.bodyEn}
                  onChange={(e) => {
                    setForm({ ...form, bodyEn: e.target.value });
                    if (formErrors.bodyEn) setFormErrors((prev) => ({ ...prev, bodyEn: '' }));
                  }}
                  error={!!formErrors.bodyEn}
                  helperText={
                    formErrors.bodyEn ||
                    t('notifications.charCount', { current: form.bodyEn.length, max: BODY_MAX })
                  }
                />

                {broadcastMut.isError && (
                  <Alert severity="error">{(broadcastMut.error as Error).message}</Alert>
                )}

                <Button variant="contained" fullWidth onClick={handleSend} disabled={broadcastMut.isPending}>
                  {broadcastMut.isPending ? t('notifications.sending') : t('notifications.send')}
                </Button>
              </Stack>
            </ThemedCard>
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <ThemedCard>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                {t('notifications.preview')}
              </Typography>
              <Box sx={{ p: 2, borderRadius: 2, border: 1, borderColor: 'divider', bgcolor: 'action.hover' }}>
                <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
                  <NotificationTypeBadge type={form.type} />
                  <NotificationChannelBadge channel={form.channel} />
                </Stack>
                <Typography sx={{ fontWeight: 600 }} dir="auto">
                  {form.titleAr || t('notifications.previewTitle')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }} dir="auto">
                  {form.bodyAr || t('notifications.previewBody')}
                </Typography>
              </Box>
            </ThemedCard>
          </Grid>
        </Grid>
      )}

      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast('')}
        message={toast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}