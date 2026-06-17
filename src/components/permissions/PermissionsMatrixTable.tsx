import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/hooks/useLanguage';
import { tokens } from '@/theme/tokens';
import { getPermissionModuleLabel, getRoleLabel } from '@/utils/permissionLabels';
import { buildModuleMatrix, getMatrixColumnLabelKey, type MatrixAction } from '@/utils/permissionMatrix';
import type { Permission, Role } from '@/types';

interface PermissionsMatrixTableProps {
  roles: Role[];
  modules: [string, Permission[]][];
  selectedRoleId: string | null;
  onSelectRole: (id: string) => void;
  roleKeys: (role: Role) => string[];
  onToggle: (role: Role, permKey: string) => void;
  roleNameDraft: { name: string; nameAr: string };
  onRoleNameChange: (field: 'name' | 'nameAr', value: string) => void;
  onAddRole: (name: string) => void;
  onDeleteRole: (id: string) => void;
  disabled?: boolean;
  addRolePending?: boolean;
}

function MatrixCell({
  permission,
  checked,
  disabled,
  onToggle,
  ariaLabel,
}: {
  permission: Permission | undefined;
  checked: boolean;
  disabled?: boolean;
  onToggle: () => void;
  ariaLabel: string;
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (!permission) {
    return (
      <Typography
        component="span"
        sx={{
          color: 'text.disabled',
          fontSize: '1.125rem',
          lineHeight: 1,
          userSelect: 'none',
        }}
        aria-hidden
      >
        —
      </Typography>
    );
  }

  return (
    <Checkbox
      size="small"
      checked={checked}
      disabled={disabled}
      onChange={onToggle}
      slotProps={{ input: { 'aria-label': ariaLabel } }}
      sx={{
        p: 0.5,
        color: isDark ? 'grey.600' : 'grey.400',
        '&.Mui-checked': {
          color: isDark ? tokens.dark.checkbox : 'primary.main',
        },
        '& .MuiSvgIcon-root': { fontSize: 22 },
      }}
    />
  );
}

export function PermissionsMatrixTable({
  roles,
  modules,
  selectedRoleId,
  onSelectRole,
  roleKeys,
  onToggle,
  roleNameDraft,
  onRoleNameChange,
  onAddRole,
  onDeleteRole,
  disabled,
  addRolePending,
}: PermissionsMatrixTableProps) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [newRoleName, setNewRoleName] = useState('');

  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? roles[0] ?? null;
  const { byModule, columns } = useMemo(() => buildModuleMatrix(modules), [modules]);

  const borderColor = isDark ? tokens.dark.border : 'divider';
  const panelBg = isDark ? tokens.dark.card : 'background.paper';
  const sidebarBg = isDark ? tokens.dark.rowAlt : 'grey.50';
  const selectedBg = isDark ? 'rgba(79, 110, 247, 0.12)' : 'grey.100';

  function handleAddRole() {
    const trimmed = newRoleName.trim();
    if (!trimmed || addRolePending) return;
    onAddRole(trimmed);
    setNewRoleName('');
  }

  const roleLabel = selectedRole ? getRoleLabel(selectedRole, lang as 'ar' | 'en', t) : '';
  const keys = selectedRole ? roleKeys(selectedRole) : [];
  const isSystemRole = selectedRole?.isSystem ?? false;
  const matrixDisabled = disabled || isSystemRole;
  const nameField = lang === 'ar' ? 'nameAr' : 'name';
  const nameValue = lang === 'ar' ? roleNameDraft.nameAr : roleNameDraft.name;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        gap: 2.5,
        alignItems: 'stretch',
      }}
    >
      {/* Roles sidebar — first in DOM: right in RTL, left in LTR */}
      <Paper
        elevation={0}
        sx={{
          width: { xs: '100%', lg: 280 },
          flexShrink: 0,
          borderRadius: 3,
          border: 1,
          borderColor,
          bgcolor: panelBg,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ px: 2.5, py: 2, borderBottom: 1, borderColor }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {t('roles.title')}
          </Typography>
        </Box>

        <Box sx={{ p: 2, borderBottom: 1, borderColor }}>
          <TextField
            size="small"
            fullWidth
            placeholder={t('permissions.newRoleName')}
            value={newRoleName}
            disabled={addRolePending}
            onChange={(e) => setNewRoleName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddRole();
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <IconButton
                      size="small"
                      edge="start"
                      aria-label={t('roles.add')}
                      disabled={!newRoleName.trim() || addRolePending}
                      onClick={handleAddRole}
                    >
                      <AddOutlinedIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: sidebarBg },
            }}
          />
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', maxHeight: { xs: 240, lg: 'calc(100vh - 280px)' } }}>
          {roles.map((role) => {
            const isSelected = role.id === selectedRole?.id;
            const label = getRoleLabel(role, lang as 'ar' | 'en', t);
            return (
              <Box
                key={role.id}
                component="button"
                type="button"
                onClick={() => onSelectRole(role.id)}
                sx={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                  px: 2.5,
                  py: 1.75,
                  border: 0,
                  borderBottom: 1,
                  borderColor,
                  bgcolor: isSelected ? selectedBg : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'start',
                  transition: 'background-color 0.15s',
                  '&:hover': {
                    bgcolor: isSelected ? selectedBg : isDark ? 'rgba(255,255,255,0.04)' : 'action.hover',
                  },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: isSelected ? 700 : 500,
                    color: 'text.primary',
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                </Typography>
                {role.isSystem ? (
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', flexShrink: 0 }}>
                    <LockOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      {t('permissions.system')}
                    </Typography>
                  </Stack>
                ) : null}
              </Box>
            );
          })}
        </Box>
      </Paper>

      {/* Permissions matrix */}
      <Paper
        elevation={0}
        sx={{
          flex: 1,
          minWidth: 0,
          borderRadius: 3,
          border: 1,
          borderColor,
          bgcolor: panelBg,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {selectedRole ? (
          <>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{
                alignItems: { xs: 'stretch', sm: 'center' },
                justifyContent: 'space-between',
                px: 2.5,
                py: 2,
                borderBottom: 1,
                borderColor,
                gap: 2,
              }}
            >
              <TextField
                size="small"
                label={t('permissions.roleName')}
                value={nameValue}
                disabled={matrixDisabled}
                onChange={(e) => onRoleNameChange(nameField, e.target.value)}
                sx={{
                  minWidth: { sm: 220 },
                  maxWidth: { sm: 320 },
                  '& .MuiOutlinedInput-root': { borderRadius: 2.5 },
                }}
              />

              {!isSystemRole ? (
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<DeleteOutlineOutlinedIcon fontSize="small" />}
                  disabled={disabled}
                  onClick={() => onDeleteRole(selectedRole.id)}
                  sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, borderRadius: 2, flexShrink: 0 }}
                >
                  {t('permissions.deleteRole')}
                </Button>
              ) : null}
            </Stack>

            {isSystemRole ? (
              <Box sx={{ px: 2.5, py: 1.25, bgcolor: sidebarBg, borderBottom: 1, borderColor }}>
                <Typography variant="caption" color="text.secondary">
                  {t('permissions.systemRole')}
                </Typography>
              </Box>
            ) : null}

            <TableContainer sx={{ flex: 1 }}>
              <Table size="small" sx={{ minWidth: 520 }}>
                <TableHead>
                  <TableRow
                    sx={{
                      bgcolor: sidebarBg,
                      '& th': {
                        fontWeight: 700,
                        color: 'text.secondary',
                        fontSize: '0.8125rem',
                        py: 1.75,
                        borderBottom: 1,
                        borderColor,
                        whiteSpace: 'nowrap',
                      },
                    }}
                  >
                    <TableCell>{t('permissions.columns.module')}</TableCell>
                    {columns.map((action) => (
                      <TableCell key={action} align="center">
                        {t(getMatrixColumnLabelKey(action))}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {modules.map(([module]) => {
                    const actionMap = byModule.get(module) ?? new Map<MatrixAction, Permission>();
                    const moduleLabel = getPermissionModuleLabel(module, t);

                    return (
                      <TableRow
                        key={module}
                        sx={{
                          '& td': {
                            py: 1.25,
                            borderColor,
                          },
                          '&:last-child td': { borderBottom: 0 },
                          '&:hover': {
                            bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'action.hover',
                          },
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {moduleLabel}
                          </Typography>
                        </TableCell>
                        {columns.map((action) => {
                          const permission = actionMap.get(action);
                          const checked = permission ? keys.includes(permission.key) : false;
                          const actionLabel = t(getMatrixColumnLabelKey(action));

                          return (
                            <TableCell key={action} align="center">
                              <MatrixCell
                                permission={permission}
                                checked={checked}
                                disabled={matrixDisabled}
                                onToggle={() => permission && onToggle(selectedRole, permission.key)}
                                ariaLabel={`${roleLabel} — ${moduleLabel} — ${actionLabel}`}
                              />
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography color="text.secondary">{t('permissions.noRoleSelected')}</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
