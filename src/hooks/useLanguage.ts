import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export function useLanguage() {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'ar';
  const isRtl = lang === 'ar';

  const toggleLanguage = useCallback(() => {
    const next = lang === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(next);
  }, [i18n, lang]);

  const setLanguage = useCallback(
    (next: 'ar' | 'en') => {
      i18n.changeLanguage(next);
    },
    [i18n]
  );

  return { lang, isRtl, toggleLanguage, setLanguage };
}
