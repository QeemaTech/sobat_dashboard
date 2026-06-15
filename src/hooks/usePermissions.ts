import { useAuthStore } from '@/store/authStore';

export function usePermissions() {
  const admin = useAuthStore((s) => s.admin);
  const roleNames = admin?.roles?.map((r) => r.name) ?? [];
  const isSuperAdmin = roleNames.includes('SUPER_ADMIN');

  const can = (permission: string) => {
    if (isSuperAdmin) return true;
    return false;
  };

  return { can, isSuperAdmin, roleNames };
}
