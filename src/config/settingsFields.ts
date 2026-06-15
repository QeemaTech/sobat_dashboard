export type SettingFieldKind =
  | 'text'
  | 'email'
  | 'phone'
  | 'locale'
  | 'timezone'
  | 'boolean'
  | 'number';

export interface SettingsSectionConfig {
  id: string;
  titleKey: string;
  subtitleKey: string;
  accent: string;
  icon: 'app' | 'contact' | 'localization' | 'system' | 'sleep' | 'notifications' | 'subscription' | 'other';
  keys: string[];
}

export const SETTINGS_SECTIONS: SettingsSectionConfig[] = [
  {
    id: 'identity',
    titleKey: 'settings.sections.identity.title',
    subtitleKey: 'settings.sections.identity.subtitle',
    accent: '#6366f1',
    icon: 'app',
    keys: ['app_name_ar', 'app_name_en'],
  },
  {
    id: 'contact',
    titleKey: 'settings.sections.contact.title',
    subtitleKey: 'settings.sections.contact.subtitle',
    accent: '#3b82f6',
    icon: 'contact',
    keys: ['app_support_email', 'app_support_phone'],
  },
  {
    id: 'localization',
    titleKey: 'settings.sections.localization.title',
    subtitleKey: 'settings.sections.localization.subtitle',
    accent: '#14b8a6',
    icon: 'localization',
    keys: ['default_locale', 'default_timezone'],
  },
  {
    id: 'system',
    titleKey: 'settings.sections.system.title',
    subtitleKey: 'settings.sections.system.subtitle',
    accent: '#f59e0b',
    icon: 'system',
    keys: ['maintenance_mode', 'privacy_policy_version'],
  },
  {
    id: 'sleep',
    titleKey: 'settings.groupSleep',
    subtitleKey: 'settings.sections.sleep.subtitle',
    accent: '#8b5cf6',
    icon: 'sleep',
    keys: [
      'min_sleep_hours',
      'max_sleep_hours',
      'sleep.manual_entry_enabled',
      'fajr_offset_minutes_default',
      'analytics_retention_days',
    ],
  },
  {
    id: 'notifications',
    titleKey: 'settings.groupNotifications',
    subtitleKey: 'settings.sections.notifications.subtitle',
    accent: '#ec4899',
    icon: 'notifications',
    keys: ['fajr_reminder_default', 'push_notifications_enabled'],
  },
  {
    id: 'subscription',
    titleKey: 'settings.groupSubscription',
    subtitleKey: 'settings.sections.subscription.subtitle',
    accent: '#22c55e',
    icon: 'subscription',
    keys: ['subscription_trial_enabled', 'moyasar_enabled', 'stripe_enabled'],
  },
];

/** Field kind overrides — everything else inferred from valueType. */
export const FIELD_KIND: Record<string, SettingFieldKind> = {
  app_name_ar: 'text',
  app_name_en: 'text',
  app_support_email: 'email',
  app_support_phone: 'phone',
  default_locale: 'locale',
  default_timezone: 'timezone',
  maintenance_mode: 'boolean',
  fajr_reminder_default: 'boolean',
  push_notifications_enabled: 'boolean',
  subscription_trial_enabled: 'boolean',
  moyasar_enabled: 'boolean',
  stripe_enabled: 'boolean',
  'sleep.manual_entry_enabled': 'boolean',
  min_sleep_hours: 'number',
  max_sleep_hours: 'number',
  fajr_offset_minutes_default: 'number',
  analytics_retention_days: 'number',
  privacy_policy_version: 'text',
};

export const TIMEZONE_OPTIONS = [
  'Asia/Riyadh',
  'Asia/Dubai',
  'Asia/Kuwait',
  'Asia/Bahrain',
  'Asia/Qatar',
  'Asia/Muscat',
  'Asia/Amman',
  'Asia/Beirut',
  'Africa/Cairo',
  'Europe/London',
  'Europe/Paris',
  'America/New_York',
  'America/Los_Angeles',
  'UTC',
] as const;

export function inferFieldKind(setting: { key: string; valueType: string }): SettingFieldKind {
  if (FIELD_KIND[setting.key]) return FIELD_KIND[setting.key];
  if (setting.valueType === 'boolean') return 'boolean';
  if (setting.valueType === 'number') return 'number';
  return 'text';
}

export function phoneLocalPart(value: string) {
  const digits = value.replace(/\D/g, '');
  if (digits.startsWith('966')) return digits.slice(3);
  return digits;
}

export function phoneFullValue(local: string) {
  const digits = local.replace(/\D/g, '');
  if (!digits) return '+966';
  return `+966${digits}`;
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
