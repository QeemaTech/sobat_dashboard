import { Fade, Box, Typography, type BoxProps } from '@mui/material';
import { AppBreadcrumbs } from './AppBreadcrumbs';

interface PageContainerProps extends BoxProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function PageContainer({ title, subtitle, actions, children, ...props }: PageContainerProps) {
  return (
    <Fade in timeout={350}>
      <Box
        sx={{
          maxWidth: 1600,
          mx: 'auto',
          width: '100%',
          minWidth: 0,
          overflow: 'hidden',
          boxSizing: 'border-box',
          paddingInline: 3,
          paddingBlock: 3,
          ...props.sx,
        }}
        {...props}
      >
        <Box sx={{ mb: 3 }}>
          <AppBreadcrumbs />
          {(title || actions) && (
            <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
              <Box>
                {title && (
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {title}
                  </Typography>
                )}
                {subtitle && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {subtitle}
                  </Typography>
                )}
              </Box>
              {actions}
            </Box>
          )}
        </Box>
        {children}
      </Box>
    </Fade>
  );
}
