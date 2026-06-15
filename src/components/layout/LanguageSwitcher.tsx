import { useTranslation } from 'react-i18next';
import { ToggleButton, ToggleButtonGroup, alpha, useTheme } from '@mui/material';
import { useLanguage } from '@/hooks/useLanguage';
import { tokens } from '@/theme/tokens';

export function LanguageSwitcher() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { lang, setLanguage } = useLanguage();
  const isDark = theme.palette.mode === 'dark';

  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={lang}
      onChange={(_, value: 'ar' | 'en' | null) => value && setLanguage(value)}
      aria-label={t('common.language')}
      sx={{
        bgcolor: isDark ? alpha(tokens.dark.sidebar, 0.85) : alpha('#F1F5F9', 0.9),
        borderRadius: 999,
        border: `1px solid ${theme.palette.divider}`,
        p: 0.25,
        gap: 0,
        flexDirection: 'row',
        '& .MuiToggleButtonGroup-grouped': {
          border: 0,
          borderRadius: '999px !important',
          mx: 0,
          px: 1.5,
          py: 0.625,
          minWidth: 72,
          fontSize: '0.6875rem',
          fontWeight: 600,
          letterSpacing: '0.04em',
          lineHeight: 1.2,
          color: 'text.secondary',
          transition: 'background-color 0.2s, color 0.2s',
          '&:not(:first-of-type)': { marginInlineStart: 0 },
          '&.Mui-selected': {
            bgcolor: isDark ? alpha(tokens.dark.checkbox, 0.28) : alpha(tokens.primary, 0.14),
            color: isDark ? '#F8FAFC' : tokens.primary,
            boxShadow: isDark ? `inset 0 0 0 1px ${alpha(tokens.dark.checkbox, 0.35)}` : 'none',
            '&:hover': {
              bgcolor: isDark ? alpha(tokens.dark.checkbox, 0.34) : alpha(tokens.primary, 0.2),
            },
          },
          '&:hover': {
            bgcolor: isDark ? alpha('#fff', 0.04) : alpha(tokens.primary, 0.06),
          },
        },
      }}
    >
      <ToggleButton value="en" sx={{ textTransform: 'uppercase' }}>
        {t('common.englishLabel')}
      </ToggleButton>
      <ToggleButton value="ar" sx={{ textTransform: 'none', fontFamily: 'inherit' }}>
        {t('common.arabic')}
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
