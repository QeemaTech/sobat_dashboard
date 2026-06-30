import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { QuestionFormModal } from '@/components/onboarding/QuestionFormModal';
import { onboardingService } from '@/services/onboarding.service';
import type { OnboardingQuestion } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';
import {
  adminTableActionsSx,
  adminTableAlign,
  adminTableClass,
  adminTableHeadCellSx,
  adminTableShellSx,
  adminTableSx,
  adminTableWrapperClass,
  pickLocalizedField,
} from '@/utils/tableStyles';

const QUERY_KEY = ['onboarding-questions'];
const CONFIG_KEY = ['onboarding-config'];

export function OnboardingPage() {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const qc = useQueryClient();
  const [questionModal, setQuestionModal] = useState<OnboardingQuestion | null | 'new'>(null);

  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: CONFIG_KEY,
    queryFn: () => onboardingService.getConfig(),
  });

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => onboardingService.listQuestions(),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: QUERY_KEY });
    qc.invalidateQueries({ queryKey: CONFIG_KEY });
  };

  const toggleMut = useMutation({
    mutationFn: (enabled: boolean) => onboardingService.updateConfig(enabled),
    onSuccess: () => invalidate(),
  });

  const saveQuestionMut = useMutation({
    mutationFn: async (form: Parameters<NonNullable<Parameters<typeof QuestionFormModal>[0]['onSave']>>[0]) => {
      const isEdit = questionModal && questionModal !== 'new';
      if (isEdit && questionModal.id) {
        await onboardingService.updateQuestion(questionModal.id, {
          questionAr: form.questionAr,
          questionEn: form.questionEn || undefined,
          type: form.type,
          sortOrder: form.sortOrder,
          isActive: form.isActive,
          isRequired: form.isRequired,
        });

        for (const opt of form.options) {
          if (opt._deleted && opt.id) {
            await onboardingService.removeOption(opt.id);
          } else if (opt.id) {
            await onboardingService.updateOption(opt.id, {
              value: opt.value,
              labelAr: opt.labelAr,
              labelEn: opt.labelEn || undefined,
              sortOrder: opt.sortOrder,
              isActive: opt.isActive,
            });
          } else if (!opt._deleted) {
            await onboardingService.createOption(questionModal.id, {
              value: opt.value,
              labelAr: opt.labelAr,
              labelEn: opt.labelEn || undefined,
              sortOrder: opt.sortOrder,
              isActive: opt.isActive,
            });
          }
        }
        return;
      }

      const activeOptions = form.options.filter((o) => !o._deleted);
      await onboardingService.createQuestion({
        key: form.key,
        questionAr: form.questionAr,
        questionEn: form.questionEn || undefined,
        type: form.type,
        sortOrder: form.sortOrder,
        isActive: form.isActive,
        isRequired: form.isRequired,
        options:
          form.type === 'time'
            ? undefined
            : activeOptions.map((o) => ({
                value: o.value,
                labelAr: o.labelAr,
                labelEn: o.labelEn || undefined,
                sortOrder: o.sortOrder,
              })),
      });
    },
    onSuccess: () => {
      invalidate();
      setQuestionModal(null);
    },
  });

  const questions = data?.questions ?? [];
  const sleepQuestion = config?.sleepSystemQuestion;

  return (
    <Box>
      <PageHeader
        title={t('onboarding.title')}
        description={t('onboarding.pageSubtitle')}
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setQuestionModal('new')}
          >
            {t('onboarding.addQuestion')}
          </Button>
        }
      />

      <Paper sx={{ p: 2.5, mb: 3 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {t('onboarding.segmentedSleepTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {t('onboarding.segmentedSleepHint')}
            </Typography>
          </Box>
          {configLoading ? (
            <Skeleton width={52} height={32} />
          ) : (
            <Switch
              checked={config?.segmentedSleepEnabled ?? false}
              onChange={(e) => toggleMut.mutate(e.target.checked)}
              disabled={toggleMut.isPending}
            />
          )}
        </Stack>

        {config?.segmentedSleepEnabled && sleepQuestion && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              borderRadius: 1,
              bgcolor: 'action.hover',
              border: 1,
              borderColor: 'divider',
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
              <Chip size="small" label={t('onboarding.systemQuestion')} color="info" variant="outlined" />
              <Typography variant="caption" color="text.secondary">
                {sleepQuestion.key}
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {pickLocalizedField(lang, sleepQuestion.questionAr, sleepQuestion.questionEn)}
            </Typography>
            {sleepQuestion.options.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mt: 1 }}>
                {sleepQuestion.options.map((opt) => (
                  <Chip
                    key={opt.id}
                    size="small"
                    label={pickLocalizedField(lang, opt.labelAr, opt.labelEn)}
                    variant="outlined"
                  />
                ))}
              </Stack>
            )}
          </Box>
        )}
      </Paper>

      <Box className={adminTableWrapperClass} sx={adminTableShellSx}>
        <TableContainer component={Paper} className={adminTableClass} sx={adminTableSx}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={adminTableHeadCellSx}>{t('onboarding.colKey')}</TableCell>
                <TableCell sx={adminTableHeadCellSx}>{t('onboarding.colQuestion')}</TableCell>
                <TableCell sx={{ ...adminTableHeadCellSx, ...adminTableAlign.center }}>
                  {t('onboarding.colType')}
                </TableCell>
                <TableCell sx={{ ...adminTableHeadCellSx, ...adminTableAlign.center }}>
                  {t('onboarding.colRequired')}
                </TableCell>
                <TableCell sx={{ ...adminTableHeadCellSx, ...adminTableAlign.center }}>
                  {t('common.status')}
                </TableCell>
                <TableCell sx={{ ...adminTableHeadCellSx, ...adminTableAlign.center }}>
                  {t('common.actions')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

              {!isLoading && questions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <EmptyState message={t('onboarding.emptyDesc')} />
                  </TableCell>
                </TableRow>
              )}

              {!isLoading &&
                questions.map((q) => (
                  <TableRow key={q.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {q.key}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {pickLocalizedField(lang, q.questionAr, q.questionEn)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip size="small" label={t(`onboarding.types.${q.type}`, { defaultValue: q.type })} />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        size="small"
                        color={q.isRequired ? 'warning' : 'default'}
                        variant="outlined"
                        label={q.isRequired ? t('common.yes') : t('common.no')}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        size="small"
                        color={q.isActive ? 'success' : 'default'}
                        variant="outlined"
                        label={q.isActive ? t('common.active') : t('common.inactive')}
                      />
                    </TableCell>
                    <TableCell align="center" sx={adminTableActionsSx}>
                      <Tooltip title={t('common.edit')}>
                        <IconButton size="small" onClick={() => setQuestionModal(q)}>
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <QuestionFormModal
        open={questionModal !== null}
        question={questionModal === 'new' || questionModal === null ? null : questionModal}
        saving={saveQuestionMut.isPending}
        onClose={() => setQuestionModal(null)}
        onSave={(form) => saveQuestionMut.mutate(form)}
      />
    </Box>
  );
}
