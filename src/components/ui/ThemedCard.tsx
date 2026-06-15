import { Paper, type PaperProps } from '@mui/material';

/** Surface card that follows MUI light/dark theme. */
export function ThemedCard({ children, sx, ...props }: PaperProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 3,
        p: { xs: 2, sm: 2.5 },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Paper>
  );
}
