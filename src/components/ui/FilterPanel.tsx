import { Paper, type PaperProps } from '@mui/material';

/** Filter / toolbar panel — follows light/dark MUI theme. */
export function FilterPanel({ children, sx, ...props }: PaperProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        mb: 3,
        p: { xs: 2, sm: 2.5 },
        border: 1,
        borderColor: 'divider',
        borderRadius: 3,
        ...sx,
      }}
      {...props}
    >
      {children}
    </Paper>
  );
}
