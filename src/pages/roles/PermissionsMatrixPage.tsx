import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Alert, Box, Button } from '@mui/material';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { PermissionsMatrixTable } from '@/components/permissions/PermissionsMatrixTable';
import { rolesService } from '@/services/roles.service';
import type { Permission, Role } from '@/types';

export function PermissionsMatrixPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();

  const { data: rolesData, isLoading: rolesLoading, isError: rolesError, error: rolesErr, refetch: refetchRoles } = useQuery({
    queryKey: ['roles-matrix'],
    queryFn: () => rolesService.list({ limit: 100 }),
  });

  const { data: permissions, isLoading: permsLoading, isError: permsError, error: permsErr, refetch: refetchPerms } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => rolesService.listPermissions(),
  });

  const updateMut = useMutation({
    mutationFn: ({ roleId, keys }: { roleId: string; keys: string[] }) => rolesService.setPermissions(roleId, keys),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roles-matrix'] }),
  });

  const modules = useMemo(() => {
    const map = new Map<string, Permission[]>();
    (permissions ?? []).forEach((p) => {
      if (!map.has(p.module)) map.set(p.module, []);
      map.get(p.module)!.push(p);
    });
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [permissions]);

  const roles = rolesData?.data ?? [];

  function roleKeys(role: Role): string[] {
    const keys = role.permissionKeys ?? role.permissions;
    if (!Array.isArray(keys)) return [];
    return keys.map((k) => (typeof k === 'string' ? k : (k as Permission).key));
  }

  function toggle(role: Role, permKey: string) {
    const current = roleKeys(role);
    const next = current.includes(permKey) ? current.filter((k) => k !== permKey) : [...current, permKey];
    updateMut.mutate({ roleId: role.id, keys: next });
  }

  if (rolesLoading || permsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <LoadingSpinner />
      </Box>
    );
  }

  if (rolesError || permsError) {
    const message = ((rolesErr ?? permsErr) as Error)?.message ?? t('common.error');
    return (
      <Box>
        <PageHeader title={t('permissions.title')} />
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                refetchRoles();
                refetchPerms();
              }}
            >
              {t('common.retry')}
            </Button>
          }
        >
          {message}
        </Alert>
      </Box>
    );
  }

  if (!permissions?.length) {
    return (
      <Box>
        <PageHeader title={t('permissions.title')} />
        <EmptyState />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader title={t('permissions.title')} />
      <PermissionsMatrixTable
        roles={roles}
        modules={modules}
        roleKeys={roleKeys}
        onToggle={toggle}
        disabled={updateMut.isPending}
      />
    </Box>
  );
}
