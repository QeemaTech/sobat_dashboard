import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SmartphoneOutlinedIcon from '@mui/icons-material/SmartphoneOutlined';
import BedtimeOutlinedIcon from '@mui/icons-material/BedtimeOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import {
  Alert,
  Box,
  Button,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SettingField } from '@/components/settings/SettingField';
import { SettingsSectionCard } from '@/components/settings/SettingsSectionCard';
import { SETTINGS_SECTIONS, isValidEmail } from '@/config/settingsFields';
import { settingsService } from '@/services/settings.service';
import type { AppSetting } from '@/types';
import { formatRelativeTime } from '@/utils/formatters';

const SECTION_ICONS = {
  app: SmartphoneOutlinedIcon,
  contact: PhoneOutlinedIcon,
  localization: LanguageOutlinedIcon,
  system: SettingsOutlinedIcon,
  sleep: BedtimeOutlinedIcon,
  notifications: NotificationsActiveOutlinedIcon,
  subscription: PaymentsOutlinedIcon,
  other: TuneOutlinedIcon,
} as const;

function baselineFromSettings(settings: AppSetting[]) {
  return Object.fromEntries(settings.map((s) => [s.key, s.value]));
}

export function SettingsPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [baseline, setBaseline] = useState<Record<string, string>>({});
  const [sectionSavedAt, setSectionSavedAt] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ msg: string; severity: 'success' | 'error' } | null>(null);
  const [savingSection, setSavingSection] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.list(),
  });

  const settings = data?.data ?? [];

  useEffect(() => {
    if (settings.length) {
      const base = baselineFromSettings(settings);
      setBaseline(base);
      setDraft(base);
    }
  }, [settings]);

  const settingsMap = useMemo(
    () => Object.fromEntries(settings.map((s) => [s.key, s])) as Record<string, AppSetting>,
    [settings]
  );

  const assignedKeys = useMemo(() => new Set(SETTINGS_SECTIONS.flatMap((s) => s.keys)), []);

  const otherSettings = useMemo(
    () => settings.filter((s) => !assignedKeys.has(s.key)),
    [settings, assignedKeys]
  );

  const hasUnsaved = useMemo(
    () => Object.keys(draft).some((k) => draft[k] !== baseline[k]),
    [draft, baseline]
  );

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsaved) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsaved]);

  const setValue = useCallback((key: string, value: string) => {
    setDraft((d) => ({ ...d, [key]: value }));
  }, []);

  function sectionDirty(keys: string[]) {
    return keys.some((k) => settingsMap[k] && draft[k] !== baseline[k]);
  }

  function validateSection(keys: string[]) {
    for (const key of keys) {
      if (key === 'app_support_email' && draft[key]?.trim() && !isValidEmail(draft[key])) {
        return false;
      }
    }
    return true;
  }

  const saveSection = async (sectionId: string, keys: string[]) => {
    if (!validateSection(keys)) {
      setToast({ msg: t('settings.saveError'), severity: 'error' });
      return;
    }
    setSavingSection(sectionId);
    try {
      const payload = keys
        .filter((k) => settingsMap[k])
        .map((k) => ({ key: k, value: draft[k] ?? baseline[k] }));
      if (!payload.length) return;
      await settingsService.saveBulk(payload);
      const nextBase = { ...baseline };
      payload.forEach((p) => {
        nextBase[p.key] = p.value;
      });
      setBaseline(nextBase);
      setSectionSavedAt((s) => ({ ...s, [sectionId]: new Date().toISOString() }));
      await qc.invalidateQueries({ queryKey: ['settings'] });
      setToast({ msg: t('settings.saveSuccess'), severity: 'success' });
    } catch (e) {
      setToast({ msg: (e as Error).message || t('settings.saveError'), severity: 'error' });
    } finally {
      setSavingSection(null);
    }
  };

  const saveAllMut = useMutation({
    mutationFn: async () => {
      const payload = Object.keys(draft)
        .filter((k) => draft[k] !== baseline[k] && settingsMap[k])
        .map((k) => ({ key: k, value: draft[k] }));
      if (!payload.length) return;
      if (!validateSection(payload.map((p) => p.key))) {
        throw new Error(t('settings.saveError'));
      }
      await settingsService.saveBulk(payload);
    },
    onSuccess: () => {
      setBaseline({ ...draft });
      setSectionSavedAt({});
      qc.invalidateQueries({ queryKey: ['settings'] });
      setToast({ msg: t('settings.saveSuccess'), severity: 'success' });
    },
    onError: (e: Error) => {
      setToast({ msg: e.message || t('settings.saveError'), severity: 'error' });
    },
  });

  function renderFields(keys: string[]) {
    return keys
      .filter((k) => settingsMap[k])
      .map((key) => (
        <SettingField
          key={key}
          setting={settingsMap[key]}
          value={draft[key] ?? baseline[key] ?? ''}
          onChange={(v) => setValue(key, v)}
        />
      ));
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <LoadingSpinner />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box>
        <PageHeader title={t('settings.title')} />
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              {t('common.retry')}
            </Button>
          }
        >
          {(error as Error).message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader title={t('settings.title')} description={t('settings.pageSubtitle')} />

      <Stack spacing={3}>
        {SETTINGS_SECTIONS.map((section) => {
          const fields = section.keys.filter((k) => settingsMap[k]);
          if (!fields.length) return null;
          const Icon = SECTION_ICONS[section.icon];
          const title =
            section.id === 'sleep' ||
            section.id === 'notifications' ||
            section.id === 'subscription'
              ? t(section.titleKey)
              : t(section.titleKey);

          return (
            <SettingsSectionCard
              key={section.id}
              title={title}
              subtitle={t(section.subtitleKey)}
              accent={section.accent}
              icon={<Icon sx={{ fontSize: 22 }} />}
              dirty={sectionDirty(section.keys)}
              saving={savingSection === section.id}
              lastSaved={
                sectionSavedAt[section.id] ? formatRelativeTime(sectionSavedAt[section.id]) : null
              }
              onSave={() => saveSection(section.id, section.keys)}
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: section.id === 'identity' ? { xs: '1fr', sm: '1fr 1fr' } : '1fr',
                  gap: 2.5,
                }}
              >
                {renderFields(section.keys)}
              </Box>
            </SettingsSectionCard>
          );
        })}

        {otherSettings.length > 0 && (
          <SettingsSectionCard
            title={t('settings.sections.other.title')}
            subtitle={t('settings.sections.other.subtitle')}
            accent="#94a3b8"
            icon={<TuneOutlinedIcon sx={{ fontSize: 22 }} />}
            dirty={otherSettings.some((s) => draft[s.key] !== baseline[s.key])}
            saving={savingSection === 'other'}
            lastSaved={sectionSavedAt.other ? formatRelativeTime(sectionSavedAt.other) : null}
            onSave={() => saveSection('other', otherSettings.map((s) => s.key))}
          >
            {otherSettings.map((s) => (
              <SettingField
                key={s.key}
                setting={s}
                value={draft[s.key] ?? baseline[s.key] ?? ''}
                onChange={(v) => setValue(s.key, v)}
              />
            ))}
          </SettingsSectionCard>
        )}
      </Stack>

      {hasUnsaved && (
        <Box
          sx={{
            mt: 3,
            p: 2,
            borderRadius: 3,
            border: 1,
            borderColor: 'warning.main',
            bgcolor: 'rgba(245, 158, 11, 0.08)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="warning.main" sx={{ fontWeight: 600 }}>
            {t('settings.unsavedChanges')}
          </Typography>
          <Button
            variant="contained"
            onClick={() => saveAllMut.mutate()}
            disabled={saveAllMut.isPending}
          >
            {saveAllMut.isPending ? t('settings.saving') : t('settings.saveAll')}
          </Button>
        </Box>
      )}

      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast?.severity ?? 'success'} onClose={() => setToast(null)} sx={{ width: '100%' }}>
          {toast?.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
