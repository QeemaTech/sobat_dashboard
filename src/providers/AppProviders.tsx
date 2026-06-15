import { useMemo, useEffect } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { createAppTheme } from '@/theme/muiTheme';
import { applyDocumentLanguage } from '@/i18n';
import { useThemeStore } from '@/store/themeStore';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const mode = useThemeStore((s) => s.mode);
  const lang = i18n.language === 'en' ? 'en' : 'ar';

  useEffect(() => {
    applyDocumentLanguage(lang);
  }, [lang]);

  const theme = useMemo(() => createAppTheme(mode, lang), [mode, lang]);

  return (
    <ThemeProvider theme={theme} key={`${mode}-${lang}`}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
