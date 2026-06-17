import { Box } from '@mui/material';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import LoginPage from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { UsersPage } from '@/pages/users/UsersPage';
import { UserDetailPage } from '@/pages/users/UserDetailPage';
import { SupervisorsPage } from '@/pages/supervisors/SupervisorsPage';
import { PermissionsMatrixPage } from '@/pages/roles/PermissionsMatrixPage';
import { SleepFilesPage } from '@/pages/sleep/SleepFilesPage';
import { SleepLogsPage } from '@/pages/sleep/SleepLogsPage';
import { NapsPage } from '@/pages/sleep/NapsPage';
import { SleepDebtPage } from '@/pages/sleep/SleepDebtPage';
import { HealthSourcesPage } from '@/pages/sleep/HealthSourcesPage';
import { SyncLogsPage } from '@/pages/sleep/SyncLogsPage';
import { RemindersPage } from '@/pages/reminders/RemindersPage';
import { CustomNotificationsPage } from '@/pages/reminders/CustomNotificationsPage';
import { NotificationsPage } from '@/pages/reminders/NotificationsPage';
import { PlansPage } from '@/pages/finance/PlansPage';
import { SubscriptionsPage } from '@/pages/finance/SubscriptionsPage';
import { PaymentsPage } from '@/pages/finance/PaymentsPage';
import { ContentPage } from '@/pages/content/ContentPage';
import { SettingsPage } from '@/pages/content/SettingsPage';
import { SupportPage } from '@/pages/support/SupportPage';
import { AuditLogPage } from '@/pages/support/AuditLogPage';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
        <LoadingSpinner />
      </Box>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="analytics" element={<Navigate to="/admin" replace />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="users/:id" element={<UserDetailPage />} />
        <Route path="supervisors" element={<SupervisorsPage />} />
        <Route path="roles" element={<Navigate to="/admin/permissions" replace />} />
        <Route path="permissions" element={<PermissionsMatrixPage />} />
        <Route path="sleep-files" element={<SleepFilesPage />} />
        <Route path="sleep-logs" element={<SleepLogsPage />} />
        <Route path="naps" element={<NapsPage />} />
        <Route path="sleep-debt" element={<SleepDebtPage />} />
        <Route path="health-sources" element={<HealthSourcesPage />} />
        <Route path="sync-logs" element={<SyncLogsPage />} />
        <Route path="reminders" element={<RemindersPage />} />
        <Route path="custom-notifications" element={<CustomNotificationsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="plans" element={<PlansPage />} />
        <Route path="subscriptions" element={<SubscriptionsPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="content" element={<ContentPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="support" element={<SupportPage />} />
        <Route path="audit-log" element={<AuditLogPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
