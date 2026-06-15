import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { UserStatusBadge } from '@/components/dashboard/UserStatusBadge';
import type { UserListItem } from '@/types';
import { formatRelativeTime } from '@/utils/formatters';

interface RecentUsersPanelProps {
  users: UserListItem[];
  newThisWeek: number;
}

export function RecentUsersPanel({ users, newThisWeek }: RecentUsersPanelProps) {
  const { t } = useTranslation();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: '100%',
        border: '1px solid',
        borderColor: (theme) => (theme.palette.mode === 'light' ? '#E5E7EB' : 'divider'),
        borderRadius: 3,
        boxShadow: (theme) => (theme.palette.mode === 'light' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'),
        overflow: 'hidden',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 2 }}>
        <Box>
          <Typography sx={{ fontSize: 16, fontWeight: 600 }}>{t('overview.recentUsers')}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {t('dashboard.newUsersThisWeek', { count: newThisWeek })}
          </Typography>
        </Box>
        <Link component={RouterLink} to="/admin/users" variant="body2" underline="hover" sx={{ fontWeight: 600, flexShrink: 0 }}>
          {t('common.viewAll')} →
        </Link>
      </Box>

      <Box sx={{ overflowX: 'auto', mx: -1 }}>
        <Table size="small" sx={{ minWidth: 560 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: (theme) => (theme.palette.mode === 'light' ? '#F8FAFC' : 'action.hover') }}>
              <TableCell sx={{ fontWeight: 600, minWidth: 180 }}>{t('common.name')}</TableCell>
              <TableCell sx={{ fontWeight: 600, minWidth: 160 }}>{t('common.email')}</TableCell>
              <TableCell sx={{ fontWeight: 600, width: 120 }}>{t('common.status')}</TableCell>
              <TableCell sx={{ fontWeight: 600, width: 110 }}>{t('dashboard.joined')}</TableCell>
              <TableCell sx={{ fontWeight: 600, width: 72 }} align="right">
                {t('common.actions')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                    {t('common.noData')}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                  <TableCell sx={{ minWidth: 180, maxWidth: 220 }}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.4 }}
                      dir="auto"
                    >
                      {user.fullName}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ minWidth: 160 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, wordBreak: 'break-all' }}
                    >
                      {user.email ?? '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <UserStatusBadge status={user.status} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {formatRelativeTime(user.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Link component={RouterLink} to={`/admin/users/${user.id}`} variant="body2" underline="hover" sx={{ fontWeight: 600 }}>
                      {t('common.view')}
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
}
