import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { SidebarItem } from './SidebarItem';
import { SidebarSection } from './SidebarSection';

interface SidebarProps {
  collapsed?: boolean;
  mobile?: boolean;
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ collapsed, mobile, open, onClose }: SidebarProps) {
  const { t } = useTranslation();

  const content = (
    <Box
      component="aside"
      sx={{
        display: 'flex',
        height: '100%',
        flexDirection: 'column',
        width: collapsed ? 72 : 260,
        flexShrink: 0,
        bgcolor: 'background.paper',
        borderColor: 'divider',
        borderStyle: 'solid',
        borderWidth: 0,
        borderInlineEndWidth: mobile ? 0 : 1,
        borderInlineStartWidth: mobile ? 1 : 0,
        boxShadow: (theme) => (theme.palette.mode === 'light' && !mobile ? 1 : 0),
      }}
    >
      <Box
        sx={{
          display: 'flex',
          height: 64,
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider',
          px: collapsed ? 1 : 2.5,
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        <Box component="span" sx={{ fontSize: '1.25rem', fontWeight: 700, color: 'primary.main' }}>
          {collapsed ? t('common.appName').charAt(0) : t('common.appName')}
        </Box>
      </Box>
      <Box component="nav" sx={{ flex: 1, overflowY: 'auto', p: 1.5 }}>
        <SidebarSection title={t('nav.dashboard')} collapsed={collapsed}>
          <SidebarItem to="/admin" label={t('nav.dashboard')} collapsed={collapsed} />
        </SidebarSection>
        <SidebarSection title={t('nav.identity')} collapsed={collapsed}>
          <SidebarItem to="/admin/users" label={t('nav.users')} collapsed={collapsed} />
          <SidebarItem to="/admin/supervisors" label={t('nav.supervisors')} collapsed={collapsed} />
          <SidebarItem to="/admin/roles" label={t('nav.roles')} collapsed={collapsed} />
          <SidebarItem to="/admin/permissions" label={t('nav.permissions')} collapsed={collapsed} />
        </SidebarSection>
        <SidebarSection title={t('nav.product')} collapsed={collapsed}>
          <SidebarItem to="/admin/sleep-files" label={t('nav.sleepFiles')} collapsed={collapsed} />
          <SidebarItem to="/admin/sleep-logs" label={t('nav.sleepLogs')} collapsed={collapsed} />
          <SidebarItem to="/admin/naps" label={t('nav.naps')} collapsed={collapsed} />
          <SidebarItem to="/admin/sleep-debt" label={t('nav.sleepDebt')} collapsed={collapsed} />
          <SidebarItem to="/admin/health-sources" label={t('nav.healthSources')} collapsed={collapsed} />
          <SidebarItem to="/admin/sync-logs" label={t('nav.syncLogs')} collapsed={collapsed} />
          <SidebarItem to="/admin/reminders" label={t('nav.reminders')} collapsed={collapsed} />
          <SidebarItem to="/admin/custom-notifications" label={t('nav.customNotifications')} collapsed={collapsed} />
          <SidebarItem to="/admin/notifications" label={t('nav.notifications')} collapsed={collapsed} />
        </SidebarSection>
        <SidebarSection title={t('nav.finance')} collapsed={collapsed}>
          <SidebarItem to="/admin/plans" label={t('nav.plans')} collapsed={collapsed} />
          <SidebarItem to="/admin/subscriptions" label={t('nav.subscriptions')} collapsed={collapsed} />
          <SidebarItem to="/admin/payments" label={t('nav.payments')} collapsed={collapsed} />
          <SidebarItem to="/admin/content" label={t('nav.content')} collapsed={collapsed} />
          <SidebarItem to="/admin/settings" label={t('nav.settings')} collapsed={collapsed} />
        </SidebarSection>
        <SidebarSection title={t('nav.supportSection')} collapsed={collapsed}>
          <SidebarItem to="/admin/support" label={t('nav.support')} collapsed={collapsed} />
          <SidebarItem to="/admin/audit-log" label={t('nav.auditLog')} collapsed={collapsed} />
        </SidebarSection>
      </Box>
    </Box>
  );

  if (mobile) {
    return (
      <>
        {open && (
          <Box
            component="button"
            type="button"
            aria-label="close menu"
            onClick={onClose}
            sx={{
              position: 'fixed',
              inset: 0,
              zIndex: 40,
              bgcolor: 'rgba(0,0,0,0.5)',
              border: 'none',
              display: { lg: 'none' },
            }}
          />
        )}
        <Box
          sx={{
            position: 'fixed',
            insetBlock: 0,
            zIndex: 50,
            transition: 'transform 0.2s',
            transform: open ? 'translateX(0)' : 'translateX(100%)',
            display: { lg: 'none' },
            '[dir="rtl"] &': {
              transform: open ? 'translateX(0)' : 'translateX(-100%)',
            },
          }}
        >
          {content}
        </Box>
      </>
    );
  }

  return <Box sx={{ display: { xs: 'none', lg: 'block' }, flexShrink: 0 }}>{content}</Box>;
}
