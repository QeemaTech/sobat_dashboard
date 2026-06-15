import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  IconButton,
  InputAdornment,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
  Toolbar,
  Tooltip,
  alpha,
  useTheme,
} from '@mui/material';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { useAuth } from '@/hooks/useAuth';
import { useThemeMode } from '@/hooks/useThemeMode';
import { tokens } from '@/theme/tokens';

interface AppTopbarProps {
  onMenuClick: () => void;
}

export function AppTopbar({ onMenuClick }: AppTopbarProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { admin, logout } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [search, setSearch] = useState('');

  const glassBg =
    theme.palette.mode === 'light'
      ? alpha('#FFFFFF', 0.82)
      : alpha(tokens.dark.card, 0.85);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: glassBg,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: 1,
        borderColor: 'divider',
        color: 'text.primary',
        width: '100%',
        insetInlineStart: 0,
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          minHeight: 64,
          height: 64,
          paddingInline: { xs: 2, sm: 3 },
          minWidth: 0,
          width: '100%',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 1.5,
            flex: 1,
            minWidth: 0,
          }}
        >
          <IconButton edge="start" onClick={onMenuClick} sx={{ display: { lg: 'none' }, flexShrink: 0 }}>
            <MenuIcon />
          </IconButton>

          <TextField
            size="small"
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              flex: 1,
              minWidth: 0,
              maxWidth: { sm: 420 },
              display: { xs: 'none', sm: 'block' },
              '& .MuiOutlinedInput-root': {
                bgcolor: theme.palette.mode === 'light' ? alpha('#F1F5F9', 0.8) : alpha(tokens.dark.sidebar, 0.9),
                borderRadius: 3,
              },
              '& .MuiOutlinedInput-input': {
                textAlign: 'start',
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: { xs: 0.5, sm: 0.75 },
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <LanguageSwitcher />
          </Box>

          <Tooltip title={mode === 'dark' ? t('theme.light') : t('theme.dark')}>
            <IconButton size="small" onClick={toggleMode}>
              {mode === 'dark' ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          <Tooltip title={t('nav.notifications')}>
            <IconButton size="small">
              <Badge variant="dot" color="error" overlap="circular">
                <NotificationsNoneRoundedIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} sx={{ p: 0.5 }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
              {admin?.fullName?.charAt(0) ?? <PersonOutlinedIcon fontSize="small" />}
            </Avatar>
          </IconButton>
        </Box>

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: theme.direction === 'rtl' ? 'left' : 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: theme.direction === 'rtl' ? 'left' : 'right' }}
          slotProps={{ paper: { sx: { borderRadius: 2.5, minWidth: 200, mt: 1 } } }}
        >
          <MenuItem disabled>
            <ListItemText primary={admin?.fullName} secondary={admin?.email} />
          </MenuItem>
          <MenuItem
            onClick={() => {
              setMenuAnchor(null);
              logout();
            }}
          >
            <ListItemIcon>
              <LogoutOutlinedIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText sx={{ color: 'error.main' }}>{t('common.logout')}</ListItemText>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
