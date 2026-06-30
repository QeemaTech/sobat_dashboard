import type { SvgIconComponent } from '@mui/icons-material';
import AlarmRoundedIcon from '@mui/icons-material/AlarmRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import AirlineSeatIndividualSuiteRoundedIcon from '@mui/icons-material/AirlineSeatIndividualSuiteRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import BedtimeRoundedIcon from '@mui/icons-material/BedtimeRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import CardMembershipRoundedIcon from '@mui/icons-material/CardMembershipRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import EditNotificationsRoundedIcon from '@mui/icons-material/EditNotificationsRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import HotelRoundedIcon from '@mui/icons-material/HotelRounded';
import MonitorHeartRoundedIcon from '@mui/icons-material/MonitorHeartRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import SyncRoundedIcon from '@mui/icons-material/SyncRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';

export interface NavItem {
  to: string;
  labelKey: string;
  icon: SvgIconComponent;
  end?: boolean;
}

export interface NavSection {
  id: string;
  titleKey: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    id: 'dashboard',
    titleKey: 'nav.dashboard',
    items: [{ to: '/admin', labelKey: 'nav.dashboard', icon: DashboardRoundedIcon, end: true }],
  },
  {
    id: 'identity',
    titleKey: 'nav.identity',
    items: [
      { to: '/admin/users', labelKey: 'nav.users', icon: GroupRoundedIcon },
      { to: '/admin/supervisors', labelKey: 'nav.supervisors', icon: AdminPanelSettingsRoundedIcon },
      { to: '/admin/permissions', labelKey: 'nav.permissions', icon: VerifiedUserRoundedIcon },
    ],
  },
  {
    id: 'product',
    titleKey: 'nav.product',
    items: [
      { to: '/admin/sleep-files', labelKey: 'nav.sleepFiles', icon: BedtimeRoundedIcon },
      { to: '/admin/sleep-logs', labelKey: 'nav.sleepLogs', icon: HotelRoundedIcon },
      { to: '/admin/naps', labelKey: 'nav.naps', icon: AirlineSeatIndividualSuiteRoundedIcon },
      { to: '/admin/sleep-debt', labelKey: 'nav.sleepDebt', icon: TrendingDownRoundedIcon },
      { to: '/admin/health-sources', labelKey: 'nav.healthSources', icon: MonitorHeartRoundedIcon },
      { to: '/admin/sync-logs', labelKey: 'nav.syncLogs', icon: SyncRoundedIcon },
      { to: '/admin/reminders', labelKey: 'nav.reminders', icon: AlarmRoundedIcon },
      { to: '/admin/custom-notifications', labelKey: 'nav.customNotifications', icon: EditNotificationsRoundedIcon },
      { to: '/admin/notifications', labelKey: 'nav.notifications', icon: CampaignRoundedIcon },
      { to: '/admin/onboarding', labelKey: 'nav.onboarding', icon: QuizRoundedIcon },
    ],
  },
  {
    id: 'finance',
    titleKey: 'nav.finance',
    items: [
      { to: '/admin/plans', labelKey: 'nav.plans', icon: CardMembershipRoundedIcon },
      { to: '/admin/subscriptions', labelKey: 'nav.subscriptions', icon: AutorenewRoundedIcon },
      { to: '/admin/payments', labelKey: 'nav.payments', icon: PaymentsRoundedIcon },
      { to: '/admin/content', labelKey: 'nav.content', icon: ArticleRoundedIcon },
      { to: '/admin/settings', labelKey: 'nav.settings', icon: SettingsRoundedIcon },
    ],
  },
  {
    id: 'support',
    titleKey: 'nav.supportSection',
    items: [
      { to: '/admin/support', labelKey: 'nav.support', icon: SupportAgentRoundedIcon },
      { to: '/admin/audit-log', labelKey: 'nav.auditLog', icon: HistoryRoundedIcon },
    ],
  },
];

/** Flat map path → labelKey for breadcrumbs */
export const ROUTE_LABELS: Record<string, string> = NAV_SECTIONS.flatMap((s) => s.items).reduce(
  (acc, item) => {
    acc[item.to] = item.labelKey;
    return acc;
  },
  {} as Record<string, string>
);
