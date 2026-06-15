import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { PageHeader } from '@/components/ui/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ThemedCard } from '@/components/ui/ThemedCard';
import { rolesService } from '@/services/roles.service';
import type { Permission, Role } from '@/types';

export function RolesPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', nameAr: '', descriptionAr: '', permissionKeys: [] as string[] });

  const { data, isLoading } = useQuery({ queryKey: ['roles'], queryFn: () => rolesService.list({ limit: 100 }) });
  const { data: permissions } = useQuery({ queryKey: ['permissions'], queryFn: () => rolesService.listPermissions() });

  const grouped = (permissions ?? []).reduce<Record<string, Permission[]>>((acc, p) => {
    (acc[p.module] ??= []).push(p);
    return acc;
  }, {});

  const saveMut = useMutation({
    mutationFn: () =>
      editRole
        ? rolesService.update(editRole.id, { ...form, permissions: form.permissionKeys })
        : rolesService.create({ name: form.name, nameAr: form.nameAr, descriptionAr: form.descriptionAr, permissions: form.permissionKeys }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roles'] });
      setOpen(false);
      setEditRole(null);
      setForm({ name: '', nameAr: '', descriptionAr: '', permissionKeys: [] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => rolesService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roles'] });
      setDeleteId(null);
    },
  });

  function openEdit(role: Role) {
    const keys = role.permissionKeys ?? (role.permissions as string[]);
    setEditRole(role);
    setForm({
      name: role.name,
      nameAr: role.nameAr,
      descriptionAr: role.descriptionAr || '',
      permissionKeys: Array.isArray(keys) ? keys.map((k) => (typeof k === 'string' ? k : (k as Permission).key)) : [],
    });
    setOpen(true);
  }

  if (isLoading) return null;

  return (
    <Box>
      <PageHeader
        title={t('roles.title')}
        actions={
          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={() => {
              setEditRole(null);
              setOpen(true);
            }}
          >
            {t('roles.add')}
          </Button>
        }
      />
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' },
        }}
      >
        {(data?.data ?? []).map((role) => {
          const keys = role.permissionKeys ?? role.permissions;
          const permList = Array.isArray(keys) ? keys.map((k) => (typeof k === 'string' ? k : (k as Permission).key)) : [];
          const showAll = expanded === role.id;
          return (
            <ThemedCard key={role.id}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>{role.nameAr}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {role.name}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.5}>
                  <IconButton size="small" color="primary" onClick={() => openEdit(role)}>
                    <Pencil size={16} />
                  </IconButton>
                  {!role.isSystem && (
                    <IconButton size="small" color="error" onClick={() => setDeleteId(role.id)}>
                      <Trash2 size={16} />
                    </IconButton>
                  )}
                </Stack>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {role.descriptionAr || role.description}
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ mt: 1.5, display: 'block' }}>
                {t('roles.adminCount', { count: role.adminCount ?? 0 })}
              </Typography>
              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5, mt: 1.5 }}>
                {(showAll ? permList : permList.slice(0, 5)).map((k) => (
                  <Chip key={k} label={k} size="small" variant="outlined" />
                ))}
                {permList.length > 5 && (
                  <Button size="small" onClick={() => setExpanded(showAll ? null : role.id)}>
                    {showAll ? t('roles.showLess') : t('common.viewAll')}
                  </Button>
                )}
              </Stack>
            </ThemedCard>
          );
        })}
      </Box>

      <Modal
        open={open}
        title={editRole ? t('roles.edit') : t('roles.add')}
        onClose={() => setOpen(false)}
        footer={
          <Button variant="contained" onClick={() => saveMut.mutate()}>
            {t('common.save')}
          </Button>
        }
      >
        <Box sx={{ maxHeight: '60vh', overflow: 'auto' }}>
          <Stack spacing={1.5}>
            <TextField
              size="small"
              fullWidth
              placeholder={t('roles.nameAr')}
              value={form.nameAr}
              onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
            />
            <TextField
              size="small"
              fullWidth
              placeholder={t('roles.nameEn')}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <TextField
              size="small"
              fullWidth
              multiline
              rows={2}
              placeholder={t('roles.description')}
              value={form.descriptionAr}
              onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
            />
            {Object.entries(grouped).map(([module, perms]) => (
              <Box key={module}>
                <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 600,  textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                  {module}
                </Typography>
                {perms.map((p) => (
                  <FormControlLabel
                    key={p.id}
                    sx={{ display: 'flex', py: 0.25 }}
                    control={
                      <Checkbox
                        size="small"
                        checked={form.permissionKeys.includes(p.key)}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            permissionKeys: e.target.checked
                              ? [...form.permissionKeys, p.key]
                              : form.permissionKeys.filter((k) => k !== p.key),
                          })
                        }
                      />
                    }
                    label={<Typography variant="body2">{p.nameAr || p.key}</Typography>}
                  />
                ))}
              </Box>
            ))}
          </Stack>
        </Box>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title={t('roles.deleteTitle')}
        message={t('roles.deleteMessage')}
        destructive
        onCancel={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMut.mutate(deleteId)}
      />
    </Box>
  );
}
