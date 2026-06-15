import type { SvgIconComponent } from '@mui/icons-material';
import { Box, Paper, Typography, alpha } from '@mui/material';

interface StatCardProps {
  label: string;
  value: string;
  icon: SvgIconComponent;
  color?: string;
}

export function StatCard({ label, value, icon: Icon, color = '#6366F1' }: StatCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: (theme) => (theme.palette.mode === 'light' ? '#E5E7EB' : 'divider'),
        borderRadius: '12px',
        boxShadow: (theme) => (theme.palette.mode === 'light' ? '0 1px 3px rgba(0,0,0,0.07)' : 'none'),
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        minWidth: 0,
        transition: 'box-shadow 0.2s ease',
        '&:hover': {
          boxShadow: (theme) => (theme.palette.mode === 'light' ? '0 4px 12px rgba(0,0,0,0.08)' : 'none'),
        },
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha(color, 0.12),
          color,
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 24 }} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'text.secondary', lineHeight: 1.4, mb: 0.5 }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: 28, fontWeight: 700, color: 'text.primary', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
          {value}
        </Typography>
      </Box>
    </Paper>
  );
}
