import { NavLink } from 'react-router-dom';
import { Box } from '@mui/material';

interface SidebarItemProps {
  to: string;
  label: string;
  collapsed?: boolean;
}

export function SidebarItem({ to, label, collapsed }: SidebarItemProps) {
  return (
    <Box
      component={NavLink}
      to={to}
      end={to === '/admin'}
      title={collapsed ? label : undefined}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        borderRadius: 2,
        px: collapsed ? 1 : 1.5,
        py: 1.25,
        fontSize: '0.875rem',
        fontWeight: 500,
        textDecoration: 'none',
        color: 'text.secondary',
        justifyContent: collapsed ? 'center' : 'flex-start',
        transition: 'background-color 0.15s, color 0.15s',
        '&:hover': {
          bgcolor: 'action.hover',
          color: 'text.primary',
        },
        '&.active': {
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          '&:hover': {
            bgcolor: 'primary.dark',
          },
        },
      }}
    >
      {!collapsed && (
        <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {label}
        </Box>
      )}
      {collapsed && (
        <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'currentColor', opacity: 0.6 }} />
      )}
    </Box>
  );
}
