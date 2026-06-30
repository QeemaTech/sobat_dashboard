import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select as MuiSelect,
  Stack,
  TextField,
} from '@mui/material';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@mui/material';
import type { OnboardingQuestion, OnboardingQuestionType } from '@/types';
import { OptionsEditor, type OptionDraft } from './OptionsEditor';

const QUESTION_TYPES: OnboardingQuestionType[] = ['single_choice', 'multi_choice', 'time'];

function emptyForm() {
  return {
    key: '',
    questionAr: '',
    questionEn: '',
    type: 'single_choice' as OnboardingQuestionType,
    sortOrder: 0,
    isActive: true,
    isRequired: true,
    options: [] as OptionDraft[],
  };
}

function questionToForm(q: OnboardingQuestion) {
  return {
    key: q.key,
    questionAr: q.questionAr,
    questionEn: q.questionEn ?? '',
    type: (q.type as OnboardingQuestionType) || 'single_choice',
    sortOrder: q.sortOrder,
    isActive: q.isActive,
    isRequired: q.isRequired,
    options: q.options.map((o) => ({
      id: o.id,
      value: o.value,
      labelAr: o.labelAr,
      labelEn: o.labelEn ?? '',
      sortOrder: o.sortOrder,
      isActive: o.isActive,
    })),
  };
}

interface QuestionFormModalProps {
  open: boolean;
  question: OnboardingQuestion | null;
  saving: boolean;
  onClose: () => void;
  onSave: (form: ReturnType<typeof emptyForm>) => void;
}

export function QuestionFormModal({ open, question, saving, onClose, onSave }: QuestionFormModalProps) {
  const { t } = useTranslation();
  const isEdit = Boolean(question?.id);
  const [form, setForm] = useState(emptyForm());

  useEffect(() => {
    if (open) {
      setForm(question ? questionToForm(question) : emptyForm());
    }
  }, [open, question]);

  const showOptions = form.type === 'single_choice' || form.type === 'multi_choice';

  return (
    <Modal
      open={open}
      title={isEdit ? t('onboarding.editQuestion') : t('onboarding.addQuestion')}
      onClose={onClose}
      size="lg"
      footer={
        <Button variant="contained" onClick={() => onSave(form)} disabled={saving}>
          {t('common.save')}
        </Button>
      }
    >
      <Stack spacing={2}>
        <TextField
          label={t('onboarding.colKey')}
          value={form.key}
          onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
          disabled={isEdit}
          required
          fullWidth
        />
        <TextField
          label={t('onboarding.questionAr')}
          value={form.questionAr}
          onChange={(e) => setForm((f) => ({ ...f, questionAr: e.target.value }))}
          required
          fullWidth
        />
        <TextField
          label={t('onboarding.questionEn')}
          value={form.questionEn}
          onChange={(e) => setForm((f) => ({ ...f, questionEn: e.target.value }))}
          fullWidth
        />
        <FormControl fullWidth>
          <InputLabel>{t('onboarding.colType')}</InputLabel>
          <MuiSelect
            label={t('onboarding.colType')}
            value={form.type}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                type: e.target.value as OnboardingQuestionType,
                options: e.target.value === 'time' ? [] : f.options,
              }))
            }
          >
            {QUESTION_TYPES.map((type) => (
              <MenuItem key={type} value={type}>
                {t(`onboarding.types.${type}`)}
              </MenuItem>
            ))}
          </MuiSelect>
        </FormControl>
        <TextField
          type="number"
          label={t('onboarding.colOrder')}
          value={form.sortOrder}
          onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
          fullWidth
        />
        <Stack direction="row" spacing={2}>
          <FormControlLabel
            control={
              <Checkbox
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              />
            }
            label={t('common.active')}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={form.isRequired}
                onChange={(e) => setForm((f) => ({ ...f, isRequired: e.target.checked }))}
              />
            }
            label={t('onboarding.colRequired')}
          />
        </Stack>

        {showOptions && (
          <OptionsEditor
            options={form.options}
            onChange={(options) => setForm((f) => ({ ...f, options }))}
          />
        )}
      </Stack>
    </Modal>
  );
}
