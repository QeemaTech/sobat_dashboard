import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import BedtimeOutlinedIcon from '@mui/icons-material/BedtimeOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const MODULE_META: Record<string, { icon: typeof FolderOutlinedIcon; color: string }> = {
  payments: { icon: CreditCardOutlinedIcon, color: '#6366f1' },
  users: { icon: PeopleOutlinedIcon, color: '#3b82f6' },
  content: { icon: ArticleOutlinedIcon, color: '#14b8a6' },
  plans: { icon: Inventory2OutlinedIcon, color: '#8b5cf6' },
  notifications: { icon: NotificationsOutlinedIcon, color: '#ec4899' },
  settings: { icon: SettingsOutlinedIcon, color: '#f59e0b' },
  support: { icon: SupportAgentOutlinedIcon, color: '#0ea5e9' },
  sleep: { icon: BedtimeOutlinedIcon, color: '#8b5cf6' },
  roles: { icon: ShieldOutlinedIcon, color: '#64748b' },
  admins: { icon: AdminPanelSettingsOutlinedIcon, color: '#475569' },
  subscriptions: { icon: Inventory2OutlinedIcon, color: '#22c55e' },
};

export function AuditModuleCell({ module }: { module: string }) {
  const { t } = useTranslation();
  const meta = MODULE_META[module] ?? { icon: FolderOutlinedIcon, color: '#94a3b8' };
  const Icon = meta.icon;
  const label = t(`audit.modules.${module}`, module);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 28,
          height: 28,
          borderRadius: 1.5,
          bgcolor: `${meta.color}18`,
          color: meta.color,
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 16 }} />
      </Box>
      <Typography variant="body2" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
        {label}
      </Typography>
    </Box>
  );
}
