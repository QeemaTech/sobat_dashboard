import { Box, Paper, Typography, type PaperProps } from '@mui/material';
import { tokens } from '@/theme/tokens';

interface ChartCardProps extends PaperProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export function ChartCard({ title, subtitle, action, children, sx, ...props }: ChartCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: (theme) => (theme.palette.mode === 'light' ? '#E5E7EB' : 'divider'),
        borderRadius: `${tokens.radius.sm}px`,
        boxShadow: (theme) => (theme.palette.mode === 'light' ? tokens.shadow.cardSubtle : 'none'),
        height: '100%',
        width: '100%',
        minWidth: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        ...sx,
      }}
      {...props}
    >
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexShrink: 0 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 600,
              lineHeight: 1.4,
              color: 'text.primary',
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontSize: 13 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>{children}</Box>
    </Paper>
  );
}
