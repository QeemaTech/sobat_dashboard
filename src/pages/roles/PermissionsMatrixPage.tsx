import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Alert, Box, Button, Paper, useTheme } from '@mui/material';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PermissionsMatrixTable } from '@/components/permissions/PermissionsMatrixTable';
import { useLanguage } from '@/hooks/useLanguage';
import { rolesService } from '@/services/roles.service';
import { tokens } from '@/theme/tokens';
import type { Permission, Role } from '@/types';

function buildDraft(roles: Role[], roleKeys: (role: Role) => string[]) {
  return Object.fromEntries(roles.map((role) => [role.id, roleKeys(role)]));
}

function buildNameDraft(roles: Role[]) {
  return Object.fromEntries(
    roles.map((role) => [role.id, { name: role.name, nameAr: role.nameAr }])
  );
}

export function PermissionsMatrixPage() {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Record<string, string[]>>({});
  const [nameDraft, setNameDraft] = useState<Record<string, { name: string; nameAr: string }>>({});
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);
  const syncedKeyRef = useRef('');

  const { data: rolesData, isLoading: rolesLoading, isError: rolesError, error: rolesErr, refetch: refetchRoles } = useQuery({
    queryKey: ['roles-matrix'],
    queryFn: () => rolesService.list({ limit: 100 }),
  });

  const { data: permissions, isLoading: permsLoading, isError: permsError, error: permsErr, refetch: refetchPerms } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => rolesService.listPermissions(),
  });

  const roles = rolesData?.data ?? [];

  function roleKeys(role: Role): string[] {
    const keys = role.permissionKeys ?? role.permissions;
    if (!Array.isArray(keys)) return [];
    return keys.map((k) => (typeof k === 'string' ? k : (k as Permission).key));
  }

  const serverSnapshotKey = useMemo(
    () =>
      roles
        .map((role) => `${role.id}:${role.name}:${role.nameAr}:${roleKeys(role).sort().join(',')}`)
        .join('|'),
    [roles]
  );

  useEffect(() => {
    if (!roles.length) return;
    if (syncedKeyRef.current === serverSnapshotKey) return;
    setDraft(buildDraft(roles, roleKeys));
    setNameDraft(buildNameDraft(roles));
    syncedKeyRef.current = serverSnapshotKey;
  }, [roles, serverSnapshotKey]);

  useEffect(() => {
    if (!roles.length) {
      setSelectedRoleId(null);
      return;
    }
    if (!selectedRoleId || !roles.some((role) => role.id === selectedRoleId)) {
      setSelectedRoleId(roles[0].id);
    }
  }, [roles, selectedRoleId]);

  const saveMut = useMutation({
    mutationFn: async (changes: { roleId: string; keys: string[]; name: string; nameAr: string }[]) => {
      await Promise.all(
        changes.map(async ({ roleId, keys, name, nameAr }) => {
          const role = roles.find((item) => item.id === roleId);
          const nameChanged = role && (role.name !== name || role.nameAr !== nameAr);
          const keysChanged =
            role && [...roleKeys(role)].sort().join(',') !== [...keys].sort().join(',');

          if (nameChanged) {
            await rolesService.update(roleId, { name, nameAr });
          }
          if (keysChanged) {
            await rolesService.setPermissions(roleId, keys);
          }
        })
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roles-matrix'] });
      qc.invalidateQueries({ queryKey: ['roles'] });
    },
  });

  const createRoleMut = useMutation({
    mutationFn: (name: string) =>
      rolesService.create({
        name: lang === 'en' ? name : name,
        nameAr: lang === 'ar' ? name : name,
        permissions: [],
      }),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['roles-matrix'] });
      qc.invalidateQueries({ queryKey: ['roles'] });
      setSelectedRoleId(result.role.id);
    },
  });

  const deleteRoleMut = useMutation({
    mutationFn: (id: string) => rolesService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roles-matrix'] });
      qc.invalidateQueries({ queryKey: ['roles'] });
      setDeleteRoleId(null);
    },
  });

  const modules = useMemo(() => {
    const map = new Map<string, Permission[]>();
    (permissions ?? []).forEach((p) => {
      if (!map.has(p.module)) map.set(p.module, []);
      map.get(p.module)!.push(p);
    });
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [permissions]);

  const draftRoleKeys = (role: Role) => draft[role.id] ?? roleKeys(role);
  const draftRoleName = (role: Role) => nameDraft[role.id] ?? { name: role.name, nameAr: role.nameAr };

  const dirtyRoles = useMemo(
    () =>
      roles.filter((role) => {
        const originalKeys = [...roleKeys(role)].sort().join(',');
        const currentKeys = [...draftRoleKeys(role)].sort().join(',');
        const originalName = `${role.name}|${role.nameAr}`;
        const currentName = `${draftRoleName(role).name}|${draftRoleName(role).nameAr}`;
        return originalKeys !== currentKeys || originalName !== currentName;
      }),
    [roles, draft, nameDraft]
  );

  const isDirty = dirtyRoles.length > 0;
  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? null;

  function toggle(role: Role, permKey: string) {
    if (role.isSystem) return;
    setDraft((prev) => {
      const current = prev[role.id] ?? roleKeys(role);
      const next = current.includes(permKey) ? current.filter((k) => k !== permKey) : [...current, permKey];
      return { ...prev, [role.id]: next };
    });
  }

  function handleRoleNameChange(field: 'name' | 'nameAr', value: string) {
    if (!selectedRole) return;
    setNameDraft((prev) => ({
      ...prev,
      [selectedRole.id]: {
        ...draftRoleName(selectedRole),
        [field]: value,
      },
    }));
  }

  function handleAddRole(name: string) {
    createRoleMut.mutate(name);
  }

  function handleSave() {
    if (!isDirty) return;
    saveMut.mutate(
      dirtyRoles.map((role) => ({
        roleId: role.id,
        keys: draftRoleKeys(role),
        name: draftRoleName(role).name,
        nameAr: draftRoleName(role).nameAr,
      }))
    );
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
    <Box sx={{ pb: 10 }}>
      <PageHeader title={t('permissions.title')} />

      <PermissionsMatrixTable
        roles={roles}
        modules={modules}
        selectedRoleId={selectedRoleId}
        onSelectRole={setSelectedRoleId}
        roleKeys={draftRoleKeys}
        onToggle={toggle}
        roleNameDraft={selectedRole ? draftRoleName(selectedRole) : { name: '', nameAr: '' }}
        onRoleNameChange={handleRoleNameChange}
        onAddRole={handleAddRole}
        onDeleteRole={setDeleteRoleId}
        disabled={saveMut.isPending || deleteRoleMut.isPending}
        addRolePending={createRoleMut.isPending}
      />

      <Paper
        elevation={0}
        sx={{
          position: 'sticky',
          bottom: 16,
          zIndex: 10,
          mt: 3,
          py: 2,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
          borderRadius: 3,
          border: 1,
          borderColor: isDark ? tokens.dark.border : 'divider',
          bgcolor: isDark ? 'rgba(19, 34, 56, 0.92)' : 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Box sx={{ color: 'text.secondary', typography: 'body2' }}>
          {isDirty
            ? t('permissions.unsavedChanges', { count: dirtyRoles.length })
            : t('permissions.allSaved')}
        </Box>
        <Button
          variant="contained"
          size="large"
          disabled={!isDirty || saveMut.isPending}
          onClick={handleSave}
        >
          {saveMut.isPending ? t('settings.saving') : t('permissions.saveChanges')}
        </Button>
      </Paper>

      <ConfirmDialog
        open={!!deleteRoleId}
        title={t('roles.deleteTitle')}
        message={t('roles.deleteMessage')}
        destructive
        confirmLoading={deleteRoleMut.isPending}
        onCancel={() => setDeleteRoleId(null)}
        onConfirm={() => deleteRoleId && deleteRoleMut.mutate(deleteRoleId)}
      />
    </Box>
  );
}
