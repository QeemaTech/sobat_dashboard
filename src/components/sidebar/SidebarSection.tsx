import { Box, Typography } from '@mui/material';

interface SidebarSectionProps {
  title: string;
  collapsed?: boolean;
  children: React.ReactNode;
}

export function SidebarSection({ title, collapsed, children }: SidebarSectionProps) {
  return (
    <Box sx={{ mb: 2 }}>
      {!collapsed && (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mb: 1,
            px: 1.5,
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'text.disabled',
          }}
        >
          {title}
        </Typography>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>{children}</Box>
    </Box>
  );
}
