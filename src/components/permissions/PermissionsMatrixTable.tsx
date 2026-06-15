import {
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/hooks/useLanguage';
import { tokens } from '@/theme/tokens';
import { getPermissionActionLabel, getPermissionModuleLabel, getRoleLabel } from '@/utils/permissionLabels';
import type { Permission, Role } from '@/types';

interface PermissionsMatrixTableProps {
  roles: Role[];
  modules: [string, Permission[]][];
  roleKeys: (role: Role) => string[];
  onToggle: (role: Role, permKey: string) => void;
  disabled?: boolean;
}

export function PermissionsMatrixTable({
  roles,
  modules,
  roleKeys,
  onToggle,
  disabled,
}: PermissionsMatrixTableProps) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const stickyBg = isDark ? tokens.dark.stickyCol : theme.palette.background.paper;
  const headerBg = isDark ? tokens.dark.sidebar : theme.palette.action.hover;
  const borderColor = isDark ? tokens.dark.border : theme.palette.divider;

  return (
    <TableContainer
      sx={{
        border: 1,
        borderColor,
        borderRadius: 2,
        overflowX: 'auto',
        overflowY: 'hidden',
        bgcolor: isDark ? tokens.dark.card : 'background.paper',
        boxShadow: 'none',
        '&::-webkit-scrollbar': { height: 10 },
        '&::-webkit-scrollbar-thumb': {
          borderRadius: 5,
          backgroundColor: isDark ? '#2A4058' : '#CBD5E1',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: isDark ? tokens.dark.background : '#F1F5F9',
        },
      }}
    >
      <Table size="small" sx={{ minWidth: 960, borderCollapse: 'separate', borderSpacing: 0 }}>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                position: 'sticky',
                insetInlineStart: 0,
                zIndex: 3,
                bgcolor: headerBg,
                minWidth: 168,
                maxWidth: 200,
                fontWeight: 600,
                color: 'text.primary',
                borderBottom: `1px solid ${borderColor}`,
                borderInlineEnd: `1px solid ${borderColor}`,
                py: 1.75,
                px: 2,
              }}
            >
              {t('permissions.role')}
            </TableCell>
            {modules.map(([module, perms]) =>
              perms.map((p) => (
                <TableCell
                  key={p.key}
                  align="center"
                  title={p.key}
                  sx={{
                    minWidth: 80,
                    maxWidth: 96,
                    bgcolor: headerBg,
                    borderBottom: `1px solid ${borderColor}`,
                    borderInlineEnd: `1px solid ${borderColor}`,
                    py: 1.25,
                    px: 0.75,
                    verticalAlign: 'bottom',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      fontSize: '0.625rem',
                      lineHeight: 1.3,
                      color: 'text.secondary',
                      textTransform: lang === 'en' ? 'lowercase' : 'none',
                      mb: 0.25,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {getPermissionModuleLabel(module, t)}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      color: 'text.primary',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {getPermissionActionLabel(p, t)}
                  </Typography>
                </TableCell>
              ))
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {roles.map((role, rowIndex) => {
            const rowBg = isDark
              ? rowIndex % 2 === 0
                ? tokens.dark.card
                : tokens.dark.rowAlt
              : rowIndex % 2 === 0
                ? 'background.paper'
                : 'action.hover';

            const roleLabel = getRoleLabel(role, lang as 'ar' | 'en', t);

            return (
              <TableRow key={role.id} hover={false}>
                <TableCell
                  sx={{
                    position: 'sticky',
                    insetInlineStart: 0,
                    zIndex: 2,
                    bgcolor: stickyBg,
                    fontWeight: 600,
                    color: 'text.primary',
                    borderBottom: `1px solid ${borderColor}`,
                    borderInlineEnd: `1px solid ${borderColor}`,
                    py: 1.25,
                    px: 2,
                    whiteSpace: 'nowrap',
                    boxShadow: isDark ? '4px 0 12px rgba(0,0,0,0.25)' : '4px 0 8px rgba(0,0,0,0.04)',
                  }}
                >
                  {roleLabel}
                </TableCell>
                {modules.map(([, perms]) =>
                  perms.map((p) => {
                    const checked = roleKeys(role).includes(p.key);
                    return (
                      <TableCell
                        key={p.key}
                        align="center"
                        sx={{
                          bgcolor: rowBg,
                          borderBottom: `1px solid ${borderColor}`,
                          borderInlineEnd: `1px solid ${borderColor}`,
                          py: 0.75,
                          px: 0.5,
                        }}
                      >
                        <Checkbox
                          size="small"
                          checked={checked}
                          disabled={role.isSystem || disabled}
                          onChange={() => onToggle(role, p.key)}
                          slotProps={{
                            input: {
                              'aria-label': `${roleLabel} — ${getPermissionModuleLabel(p.module, t)} ${getPermissionActionLabel(p, t)}`,
                            },
                          }}
                          sx={{
                            p: 0.5,
                            '& .MuiSvgIcon-root': { fontSize: 20 },
                          }}
                        />
                      </TableCell>
                    );
                  })
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
