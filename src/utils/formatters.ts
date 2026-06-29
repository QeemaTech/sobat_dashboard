import i18n from '@/i18n';

function locale() {
  return i18n.language === 'en' ? 'en-SA' : 'ar-SA';
}

export function formatCurrency(amount: number, currency = 'SAR'): string {
  const formatted = new Intl.NumberFormat(locale(), {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${currency} ${formatted}`;
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat(locale()).format(n);
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(locale(), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat(locale(), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat(locale(), { month: 'short', day: 'numeric' }).format(new Date(iso));
}

export function formatSleepHours(hours: number, unitLabel: string): string {
  return `${hours.toFixed(1)} ${unitLabel}`;
}

export function formatDebtHHMM(totalMinutes: number): string {
  const value = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(value / 60);
  let minutes = value % 60;

  if (minutes > 0 && minutes % 10 === 0) {
    const tens = Math.floor(minutes / 10);
    minutes = tens % 2 === 1 ? tens * 10 + 4 : (tens - 1) * 10 + 5;
  }

  const rounded = hours * 60 + minutes;
  const roundedHours = Math.floor(rounded / 60);
  const roundedMinutes = rounded % 60;
  return `${roundedHours}:${String(roundedMinutes).padStart(2, '0')}`;
}

export function formatDurationMinutes(totalMinutes: number, minuteLabel?: string): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const hr = i18n.language === 'en' ? 'h' : 'ساعة';
  const min = minuteLabel ?? (i18n.language === 'en' ? 'min' : 'دقيقة');
  if (h === 0) return `${m} ${min}`;
  if (m === 0) return `${h} ${hr}`;
  return `${h} ${hr} ${m} ${min}`;
}

export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  return new Intl.DateTimeFormat(locale(), { month: 'short', year: '2-digit' }).format(
    new Date(year, month - 1, 1)
  );
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value}%`;
}

export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diffSec = Math.round((date.getTime() - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale(), { numeric: 'auto' });
  const abs = Math.abs(diffSec);
  if (abs < 60) return rtf.format(diffSec, 'second');
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), 'hour');
  if (abs < 86400 * 30) return rtf.format(Math.round(diffSec / 86400), 'day');
  return formatDateTime(iso);
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat(locale(), { hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

export function shortId(id: string, length = 8): string {
  return id.replace(/-/g, '').slice(0, length).toUpperCase();
}

export function exportCsv(filename: string, headers: string[], rows: string[][]) {
  const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))];
  const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
