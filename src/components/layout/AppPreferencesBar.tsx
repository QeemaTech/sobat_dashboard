import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { IconButton, Stack, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/hooks/useLanguage';
import { useThemeMode } from '@/hooks/useThemeMode';

interface AppPreferencesBarProps {
  dense?: boolean;
}

export function AppPreferencesBar({ dense }: AppPreferencesBarProps) {
  const { t } = useTranslation();
  const { lang, setLanguage } = useLanguage();
  const { mode, toggleMode } = useThemeMode();

  return (
    <Stack direction="row" spacing={dense ? 0.5 : 1} sx={{ alignItems: 'center' }}>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={lang}
        onChange={(_, value: 'ar' | 'en' | null) => value && setLanguage(value)}
        aria-label={t('common.language')}
      >
        <ToggleButton value="ar" sx={{ px: dense ? 1.25 : 1.75, py: 0.5, fontSize: '0.75rem' }}>
          {t('common.arabic')}
        </ToggleButton>
        <ToggleButton value="en" sx={{ px: dense ? 1.25 : 1.75, py: 0.5, fontSize: '0.75rem' }}>
          {t('common.english')}
        </ToggleButton>
      </ToggleButtonGroup>

      <Tooltip title={mode === 'dark' ? t('theme.light') : t('theme.dark')}>
        <IconButton size="small" onClick={toggleMode} aria-label={t('theme.toggle')}>
          {mode === 'dark' ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
