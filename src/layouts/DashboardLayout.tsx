import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box, Fade } from '@mui/material';
import { AppSidebar, SIDEBAR_WIDTH_PX } from '@/components/layout/AppSidebar';
import { AppTopbar } from '@/components/layout/AppTopbar';
import { PageContainer } from '@/components/layout/PageContainer';

export function DashboardLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [fadeKey, setFadeKey] = useState(location.pathname);

  useEffect(() => {
    setMobileOpen(false);
    setFadeKey(location.pathname);
  }, [location.pathname]);

  const isDashboardHome = location.pathname === '/admin' || location.pathname === '/admin/';

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'background.default',
        overflowX: 'hidden',
        width: '100%',
      }}
    >
      <AppSidebar mobile open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <AppSidebar />

      {/* Spacer reserves inline-start space for the fixed sidebar (LTR: left, RTL: right) */}
      <Box
        aria-hidden
        sx={{
          display: { xs: 'none', lg: 'block' },
          width: SIDEBAR_WIDTH_PX,
          flexShrink: 0,
        }}
      />

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        <AppTopbar onMenuClick={() => setMobileOpen(true)} />

        <Box component="main" sx={{ flex: 1, minWidth: 0, overflowX: 'hidden', overflowY: 'auto' }}>
          <Fade in key={fadeKey} timeout={300}>
            <Box sx={{ minWidth: 0 }}>
              {isDashboardHome ? (
                <Outlet />
              ) : (
                <PageContainer>
                  <Outlet />
                </PageContainer>
              )}
            </Box>
          </Fade>
        </Box>
      </Box>
    </Box>
  );
}
