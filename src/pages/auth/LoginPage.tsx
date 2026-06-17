import { FormEvent, useState } from 'react';
import { Eye, EyeOff, Moon, Sun } from 'lucide-react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useThemeMode } from '@/hooks/useThemeMode';
import { getRememberedEmail } from '@/store/authStore';
import { STORAGE_REMEMBER } from '@/utils/constants';

type Lang = 'ar' | 'en';

const COPY = {
  ar: {
    title: 'لوحة السوبر أدمن',
    subtitle: 'شبات — تسجيل دخول المشرف',
    email: 'البريد الإلكتروني *',
    password: 'كلمة المرور *',
    rememberMe: 'تذكرني',
    submit: 'دخول',
    submitting: 'جاري الدخول…',
    showPassword: 'إظهار كلمة المرور',
    hidePassword: 'إخفاء كلمة المرور',
    toggleTheme: 'تبديل الوضع',
    loginFailed: 'فشل تسجيل الدخول',
  },
  en: {
    title: 'Super Admin Panel',
    subtitle: 'Sobat — Admin sign in',
    email: 'Email *',
    password: 'Password *',
    rememberMe: 'Remember me',
    submit: 'Sign in',
    submitting: 'Signing in…',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    toggleTheme: 'Toggle theme',
    loginFailed: 'Sign in failed',
  },
} as const;

const inputClass = (isRtl: boolean, extra = '') =>
  [
    'h-12 w-full rounded-lg border border-[#e0e0e0] bg-[#f0f0f8] px-3 py-3 text-sm text-[#111827] outline-none transition-colors',
    'focus:border-[#4338CA] focus:bg-[#f5f5fc]',
    'dark:border-sobat-border dark:bg-[#1a2048] dark:text-sobat-text dark:focus:border-[#6366F1] dark:focus:bg-[#1e2654]',
    isRtl ? 'text-right' : 'text-left',
    extra,
  ].join(' ');

const staticLabelClass =
  'mb-1.5 block text-sm font-medium text-[#374151] dark:text-sobat-text-muted';

function LanguageToggle({ lang, onChange }: { lang: Lang; onChange: (lang: Lang) => void }) {
  return (
    <div className="flex items-center gap-0.5 rounded-full bg-[#f0f0f8] p-0.5 dark:bg-[#1a2048]">
      <button
        type="button"
        onClick={() => onChange('ar')}
        className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
          lang === 'ar'
            ? 'bg-[#4338CA] text-white'
            : 'text-[#6b7280] hover:text-[#4338CA] dark:text-sobat-text-muted dark:hover:text-[#818CF8]'
        }`}
      >
        عربي
      </button>
      <button
        type="button"
        onClick={() => onChange('en')}
        className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
          lang === 'en'
            ? 'bg-[#4338CA] text-white'
            : 'text-[#6b7280] hover:text-[#4338CA] dark:text-sobat-text-muted dark:hover:text-[#818CF8]'
        }`}
      >
        ENGLISH
      </button>
    </div>
  );
}

export default function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const { isDark, toggleMode } = useThemeMode();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? '/admin';

  const [lang, setLang] = useState<Lang>('ar');
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem(STORAGE_REMEMBER) !== 'false');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState(() => getRememberedEmail() || 'admin@sabat.app');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const t = COPY[lang];
  const isRtl = lang === 'ar';

  if (!loading && isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email, password, rememberMe);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.loginFailed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f4f6] p-4 transition-colors dark:bg-sobat-bg">
      <div className="relative w-full max-w-[440px] overflow-hidden rounded-2xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-colors dark:bg-sobat-card dark:shadow-[0_4px_32px_rgba(0,0,0,0.45)]">
        <div className="h-1 w-full bg-[#5C0A14]" />

        <div className="relative px-6 pb-8 pt-5 sm:px-8">
          <div
            className={`absolute top-5 flex items-center gap-2 ${isRtl ? 'left-6 sm:left-8' : 'right-6 sm:right-8'}`}
          >
            <LanguageToggle lang={lang} onChange={setLang} />
            <button
              type="button"
              onClick={toggleMode}
              aria-label={t.toggleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#6b7280] transition-colors hover:bg-[#f0f0f8] hover:text-[#4338CA] dark:text-sobat-text-muted dark:hover:bg-[#1a2048] dark:hover:text-[#818CF8]"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>

          <div className="mb-8 mt-10 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#4338CA] text-2xl font-bold text-white">
              س
            </div>
            <h1 className="text-[22px] font-bold text-[#111827] dark:text-sobat-text">{t.title}</h1>
            <p className="mt-1 text-[13px] text-[#6b7280] dark:text-sobat-text-muted">{t.subtitle}</p>
          </div>

          <form
            onSubmit={handleSubmit}
            dir={isRtl ? 'rtl' : 'ltr'}
            className={`space-y-5 ${isRtl ? 'text-right' : 'text-left'}`}
          >
            <div>
              <label htmlFor="email" className={staticLabelClass}>
                {t.email}
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass(isRtl)}
              />
            </div>

            <div>
              <label htmlFor="password" className={staticLabelClass}>
                {t.password}
              </label>
              <div className="relative">
                {isRtl && (
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? t.hidePassword : t.showPassword}
                    className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[#6b7280] transition-colors hover:text-[#4338CA] dark:text-sobat-text-muted dark:hover:text-[#818CF8]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                )}

                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass(isRtl, isRtl ? 'pl-10' : 'pr-10')}
                />

                {!isRtl && (
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? t.hidePassword : t.showPassword}
                    className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-[#6b7280] transition-colors hover:text-[#4338CA] dark:text-sobat-text-muted dark:hover:text-[#818CF8]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                )}
              </div>
            </div>

            <label
              className={`flex cursor-pointer items-center gap-2 text-sm text-[#374151] dark:text-sobat-text-muted ${
                isRtl ? 'flex-row-reverse justify-end' : 'flex-row'
              }`}
            >
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-[#d1d5db] accent-[#4338CA] dark:border-sobat-border"
              />
              <span>{t.rememberMe}</span>
            </label>

            {error && (
              <p
                className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400"
                role="alert"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="h-12 w-full rounded-lg bg-[#4338CA] text-sm font-semibold text-white transition-colors hover:bg-[#3730a3] disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-[#4F46E5]"
            >
              {busy ? t.submitting : t.submit}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export { LoginPage };
