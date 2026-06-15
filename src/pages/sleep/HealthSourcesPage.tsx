import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import WatchRoundedIcon from '@mui/icons-material/WatchRounded';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import { Alert, Box, Button, Grid, Skeleton } from '@mui/material';
import { PageHeader } from '@/components/ui/PageHeader';
import { SleepInputMethodCard } from '@/components/health/SleepInputMethodCard';
import { SleepInputMethodsSummary } from '@/components/health/SleepInputMethodsSummary';
import { sleepService } from '@/services/sleep.service';
import { settingsService } from '@/services/settings.service';
import i18n from '@/i18n';

export function HealthSourcesPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['sleep-input-methods'],
    queryFn: () => sleepService.inputMethods(),
  });

  const appleToggleMut = useMutation({
    mutationFn: async (active: boolean) => {
      const source = data?.apple.source;
      if (!source) throw new Error(t('healthSources.appleNotConfigured'));
      return sleepService.updateHealthSource(source.id, {
        type: source.type,
        nameAr: source.nameAr,
        nameEn: source.nameEn,
        descriptionAr: source.descriptionAr,
        descriptionEn: source.descriptionEn,
        iconUrl: source.iconUrl,
        sortOrder: source.sortOrder,
        isActive: active,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sleep-input-methods'] }),
  });

  const manualToggleMut = useMutation({
    mutationFn: (active: boolean) =>
      settingsService.saveOne({
        key: 'sleep.manual_entry_enabled',
        value: String(active),
        valueType: 'boolean',
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sleep-input-methods'] }),
  });

  const isEn = i18n.language === 'en';
  const appleSource = data?.apple.source;

  return (
    <Box>
      <PageHeader title={t('sleep.healthTitle')} description={t('healthSources.pageSubtitle')} />

      {isLoading ? (
        <Box>
          <Skeleton variant="rounded" height={120} sx={{ mb: 3, borderRadius: 3 }} />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Skeleton variant="rounded" height={220} sx={{ borderRadius: 3 }} />
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Skeleton variant="rounded" height={220} sx={{ borderRadius: 3 }} />
            </Grid>
          </Grid>
        </Box>
      ) : isError || !data ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              {t('common.retry')}
            </Button>
          }
        >
          {(error as Error)?.message ?? t('common.error')}
        </Alert>
      ) : (
        <>
          <SleepInputMethodsSummary stats={data} />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <SleepInputMethodCard
                variant="auto"
                icon={WatchRoundedIcon}
                name={
                  isEn
                    ? appleSource?.nameEn || t('healthSources.appleName')
                    : appleSource?.nameAr || t('healthSources.appleName')
                }
                description={t('healthSources.appleDescription')}
                isActive={data.apple.isActive}
                onToggle={(active) => appleToggleMut.mutate(active)}
                toggleDisabled={!appleSource || appleToggleMut.isPending}
                recordCount={data.apple.recordCount}
                sharePercent={data.apple.sharePercent}
                lastUpdatedAt={data.apple.lastUpdatedAt}
              />
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <SleepInputMethodCard
                variant="manual"
                icon={EditNoteOutlinedIcon}
                name={t('healthSources.manualName')}
                description={t('healthSources.manualDescription')}
                isActive={data.manual.isActive}
                onToggle={(active) => manualToggleMut.mutate(active)}
                toggleDisabled={manualToggleMut.isPending}
                recordCount={data.manual.recordCount}
                sharePercent={data.manual.sharePercent}
                lastUpdatedAt={data.manual.lastUpdatedAt}
              />
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}
