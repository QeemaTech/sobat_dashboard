import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  IconButton,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { supervisorsService, type SupervisorStatus } from '@/services/supervisors.service';
import { rolesService } from '@/services/roles.service';
import type { Supervisor } from '@/types';
import { formatDateTime } from '@/utils/formatters';

type SupervisorsQueryData = Awaited<ReturnType<typeof supervisorsService.list>>;

const emptyForm = { fullName: '', email: '', password: '', roleIds: [] as string[] };

function supervisorStatusColor(status: string): 'success' | 'error' | 'default' {
  if (status === 'ACTIVE') return 'success';
  if (status === 'INACTIVE') return 'error';
  return 'default';
}

export function SupervisorsPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Supervisor | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [statusTarget, setStatusTarget] = useState<{ id: string; nextStatus: 'ACTIVE' | 'INACTIVE' } | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [toastError, setToastError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['supervisors'],
    queryFn: () => supervisorsService.list({ limit: 50 }),
  });

  const { data: roles } = useQuery({
    queryKey: ['roles-list'],
    queryFn: () => rolesService.list({ limit: 100 }),
  });

  const createMut = useMutation({
    mutationFn: () => supervisorsService.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['supervisors'] });
      setOpen(false);
      setForm(emptyForm);
    },
    onError: (err: Error) => setToastError(err.message || t('common.error')),
  });

  const saveEditMut = useMutation({
    mutationFn: async () => {
      if (!editTarget) return;
      await supervisorsService.update(editTarget.id, { fullName: form.fullName });
      await supervisorsService.setRoles(editTarget.id, form.roleIds);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['supervisors'] });
      setEditTarget(null);
      setForm(emptyForm);
    },
    onError: (err: Error) => setToastError(err.message || t('common.error')),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => supervisorsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['supervisors'] });
      setDeleteId(null);
    },
    onError: (err: Error) => setToastError(err.message || t('common.error')),
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: SupervisorStatus }) =>
      supervisorsService.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ['supervisors'] });
      const previous = qc.getQueryData<SupervisorsQueryData>(['supervisors']);
      if (previous) {
        qc.setQueryData<SupervisorsQueryData>(['supervisors'], {
          ...previous,
          data: previous.data.map((row) => (row.id === id ? { ...row, status } : row)),
        });
      }
      return { previous };
    },
    onError: (err: Error, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(['supervisors'], context.previous);
      }
      setToastError(err.message || t('supervisors.statusUpdateError'));
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['supervisors'] });
      setStatusTarget(null);
    },
  });

  function openCreate() {
    setEditTarget(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(supervisor: Supervisor) {
    setOpen(false);
    setEditTarget(supervisor);
    setForm({
      fullName: supervisor.fullName,
      email: supervisor.email,
      password: '',
      roleIds: supervisor.roles?.map((r) => r.id) ?? [],
    });
  }

  function closeModal() {
    setOpen(false);
    setEditTarget(null);
    setForm(emptyForm);
  }

  function requestStatusToggle(supervisor: Supervisor) {
    const nextStatus: 'ACTIVE' | 'INACTIVE' = supervisor.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setStatusTarget({ id: supervisor.id, nextStatus });
  }

  const columns = [
    { key: 'name', header: t('common.name'), render: (r: Supervisor) => r.fullName },
    { key: 'email', header: t('common.email'), render: (r: Supervisor) => r.email },
    {
      key: 'roles',
      header: t('supervisors.colRoles'),
      render: (r: Supervisor) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {r.roles?.length
            ? r.roles.map((role) => <Badge key={role.id} label={role.nameAr || role.name} />)
            : '—'}
        </Box>
      ),
    },
    {
      key: 'login',
      header: t('supervisors.colLastLogin'),
      render: (r: Supervisor) => (r.lastLoginAt ? formatDateTime(r.lastLoginAt) : '—'),
    },
    {
      key: 'status',
      header: t('supervisors.colStatus'),
      render: (r: Supervisor) => {
        const isActive = r.status === 'ACTIVE';
        const toggling = statusMut.isPending && statusTarget?.id === r.id;
        return (
          <Tooltip title={t('supervisors.toggleStatus')}>
            <Chip
              size="small"
              label={t(`status.${r.status}`, r.status)}
              color={supervisorStatusColor(r.status)}
              variant={isActive ? 'filled' : 'outlined'}
              disabled={toggling}
              onClick={() => requestStatusToggle(r)}
              sx={{
                cursor: toggling ? 'default' : 'pointer',
                fontWeight: 600,
                '&:hover': toggling ? undefined : { opacity: 0.85, transform: 'scale(1.03)' },
                transition: 'opacity 0.15s ease, transform 0.15s ease',
              }}
            />
          </Tooltip>
        );
      },
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (r: Supervisor) => (
        <Stack direction="row" sx={{ gap: 0.25 }}>
          <Tooltip title={t('supervisors.edit')}>
            <IconButton size="small" color="primary" onClick={() => openEdit(r)} aria-label={t('supervisors.edit')}>
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('supervisors.delete')}>
            <IconButton size="small" color="error" onClick={() => setDeleteId(r.id)} aria-label={t('supervisors.delete')}>
              <DeleteOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const modalOpen = open || !!editTarget;
  const isEdit = !!editTarget;

  return (
    <Box>
      <PageHeader
        title={t('supervisors.title')}
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            {t('supervisors.addSupervisor')}
          </Button>
        }
      />
      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} keyExtractor={(r) => r.id} />

      <Modal
        open={modalOpen}
        title={isEdit ? t('supervisors.editSupervisor') : t('supervisors.addSupervisor')}
        onClose={closeModal}
        footer={
          <Button
            variant="contained"
            onClick={() => (isEdit ? saveEditMut.mutate() : createMut.mutate())}
            disabled={createMut.isPending || saveEditMut.isPending}
          >
            {t('common.save')}
          </Button>
        }
      >
        <Stack spacing={2}>
          <TextField
            size="small"
            fullWidth
            label={t('common.name')}
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
          {!isEdit && (
            <>
              <TextField
                size="small"
                fullWidth
                type="email"
                label={t('common.email')}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <TextField
                size="small"
                fullWidth
                type="password"
                label={t('common.password')}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </>
          )}
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {t('supervisors.selectRoles')}
            </Typography>
            <Box sx={{ maxHeight: 160, overflow: 'auto' }}>
              {(roles?.data ?? []).map((role) => (
                <FormControlLabel
                  key={role.id}
                  control={
                    <Checkbox
                      size="small"
                      checked={form.roleIds.includes(role.id)}
                      onChange={(e) => {
                        setForm({
                          ...form,
                          roleIds: e.target.checked
                            ? [...form.roleIds, role.id]
                            : form.roleIds.filter((id) => id !== role.id),
                        });
                      }}
                    />
                  }
                  label={role.nameAr || role.name}
                />
              ))}
            </Box>
          </Box>
        </Stack>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title={t('supervisors.deleteTitle')}
        message={t('supervisors.deleteMessage')}
        destructive
        confirmLoading={deleteMut.isPending}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMut.mutate(deleteId)}
      />

      <ConfirmDialog
        open={!!statusTarget}
        title={
          statusTarget?.nextStatus === 'ACTIVE'
            ? t('supervisors.activateTitle')
            : t('supervisors.deactivateTitle')
        }
        message={
          statusTarget?.nextStatus === 'ACTIVE'
            ? t('supervisors.activateConfirm')
            : t('supervisors.deactivateConfirm')
        }
        confirmLoading={statusMut.isPending}
        onCancel={() => setStatusTarget(null)}
        onConfirm={() => {
          if (statusTarget) {
            statusMut.mutate({ id: statusTarget.id, status: statusTarget.nextStatus });
          }
        }}
      />

      <Snackbar
        open={!!toastError}
        autoHideDuration={5000}
        onClose={() => setToastError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setToastError('')} sx={{ width: '100%' }}>
          {toastError}
        </Alert>
      </Snackbar>
    </Box>
  );
}
