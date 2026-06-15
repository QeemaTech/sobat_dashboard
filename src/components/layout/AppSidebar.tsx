import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import NightsStayRoundedIcon from '@mui/icons-material/NightsStayRounded';
import {
  Box,
  Collapse,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { NAV_SECTIONS } from '@/config/navigation';
import { tokens } from '@/theme/tokens';

const SIDEBAR_WIDTH = 280;

interface AppSidebarProps {
  mobile?: boolean;
  open?: boolean;
  onClose?: () => void;
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const location = useLocation();
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(NAV_SECTIONS.map((s) => [s.id, true]))
  );

  const toggle = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: SIDEBAR_WIDTH,
        bgcolor: theme.palette.mode === 'light' ? '#FFFFFF' : tokens.dark.sidebar,
        borderInlineEnd: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 1.5,
          paddingInline: 2,
          py: 2,
          minHeight: 64,
          borderBottom: 1,
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: 2.5,
            background: tokens.gradient.primary,
            boxShadow: tokens.shadow.sidebarActive,
            color: '#fff',
            flexShrink: 0,
          }}
        >
          <NightsStayRoundedIcon />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>
            {t('common.appName')}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {t('common.pageTitle')}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 1.5, paddingInline: 1 }}>
        {NAV_SECTIONS.map((section) => {
          const isOpen = expanded[section.id] ?? true;
          const hasActive = section.items.some((item) =>
            item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
          );

          return (
            <Box key={section.id} sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => toggle(section.id)}
                sx={{
                  borderRadius: 2,
                  py: 0.75,
                  paddingInline: 1.5,
                  mb: 0.25,
                  color: hasActive ? 'primary.main' : 'text.secondary',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <ListItemText
                  primary={t(section.titleKey)}
                  slotProps={{
                    primary: {
                      variant: 'caption',
                      sx: { fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' },
                    },
                  }}
                  sx={{ m: 0, flex: 1, minWidth: 0, textAlign: 'start' }}
                />
                {isOpen ? (
                  <ExpandLessRoundedIcon className="sidebar-section-chevron" sx={{ fontSize: 18, flexShrink: 0 }} />
                ) : (
                  <ExpandMoreRoundedIcon className="sidebar-section-chevron" sx={{ fontSize: 18, flexShrink: 0 }} />
                )}
              </ListItemButton>
              <Collapse in={isOpen}>
                <List disablePadding sx={{ paddingInline: 0.5 }}>
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <ListItemButton
                        key={item.to}
                        component={NavLink}
                        to={item.to}
                        end={item.end}
                        onClick={onNavigate}
                        sx={{
                          borderRadius: 2.5,
                          py: 1,
                          paddingInline: 1.5,
                          mb: 0.25,
                          color: 'text.secondary',
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 1,
                          borderInlineStart: '3px solid transparent',
                          transition: 'all 0.2s ease',
                          '& .MuiListItemIcon-root': {
                            color: 'inherit',
                            minWidth: 36,
                            justifyContent: 'center',
                            flexShrink: 0,
                          },
                          '& .MuiListItemText-root': { minWidth: 0, textAlign: 'start' },
                          '& .MuiListItemText-primary': {
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          },
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.06),
                            color: 'text.primary',
                          },
                          '&.active': {
                            background: tokens.gradient.primary,
                            color: '#fff',
                            borderInlineStartColor: '#fff',
                            boxShadow: tokens.shadow.sidebarActive,
                            '& .MuiListItemIcon-root': { color: '#fff' },
                            '&:hover': {
                              background: tokens.gradient.primary,
                              filter: 'brightness(1.05)',
                            },
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Icon sx={{ fontSize: 22, display: 'block' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={t(item.labelKey)}
                          slotProps={{ primary: { variant: 'body2', sx: { fontWeight: 500 } } }}
                        />
                      </ListItemButton>
                    );
                  })}
                </List>
              </Collapse>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export function AppSidebar({ mobile, open, onClose }: AppSidebarProps) {
  const theme = useTheme();
  const drawerAnchor = theme.direction === 'rtl' ? 'right' : 'left';

  if (mobile) {
    return (
      <>
        {open && (
          <Box
            onClick={onClose}
            sx={{
              position: 'fixed',
              inset: 0,
              zIndex: 1200,
              bgcolor: 'rgba(0,0,0,0.5)',
              display: { lg: 'none' },
            }}
          />
        )}
        <Drawer
          anchor={drawerAnchor}
          open={!!open}
          onClose={onClose}
          slotProps={{
            paper: {
              sx: { width: SIDEBAR_WIDTH, border: 'none' },
            },
          }}
          sx={{ display: { lg: 'none' } }}
        >
          <SidebarContent onNavigate={onClose} />
        </Drawer>
      </>
    );
  }

  return (
    <Box
      component="aside"
      sx={{
        display: { xs: 'none', lg: 'flex' },
        flexShrink: 0,
        position: 'fixed',
        top: 0,
        bottom: 0,
        zIndex: 1100,
        insetInlineStart: 0,
      }}
    >
      <SidebarContent />
    </Box>
  );
}

export const SIDEBAR_WIDTH_PX = SIDEBAR_WIDTH;
