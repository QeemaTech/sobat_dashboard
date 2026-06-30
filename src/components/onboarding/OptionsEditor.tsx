import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

export interface OptionDraft {
  id?: string;
  value: string;
  labelAr: string;
  labelEn: string;
  sortOrder: number;
  isActive: boolean;
  _deleted?: boolean;
}

interface OptionsEditorProps {
  options: OptionDraft[];
  onChange: (options: OptionDraft[]) => void;
  disabled?: boolean;
}

export function OptionsEditor({ options, onChange, disabled }: OptionsEditorProps) {
  const { t } = useTranslation();

  const visible = options.filter((o) => !o._deleted);

  const updateAt = (index: number, patch: Partial<OptionDraft>) => {
    const next = [...options];
    const realIndex = options.indexOf(visible[index]);
    next[realIndex] = { ...next[realIndex], ...patch };
    onChange(next);
  };

  const addOption = () => {
    onChange([
      ...options,
      {
        value: '',
        labelAr: '',
        labelEn: '',
        sortOrder: visible.length,
        isActive: true,
      },
    ]);
  };

  const removeAt = (index: number) => {
    const target = visible[index];
    if (target.id) {
      onChange(
        options.map((o) => (o === target ? { ...o, _deleted: true } : o))
      );
    } else {
      onChange(options.filter((o) => o !== target));
    }
  };

  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="subtitle2">{t('onboarding.optionsTitle')}</Typography>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={addOption}
          disabled={disabled}
        >
          {t('onboarding.addOption')}
        </Button>
      </Stack>

      {visible.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t('onboarding.noOptions')}
        </Typography>
      ) : (
        <Stack spacing={2}>
          {visible.map((opt, index) => (
            <Box
              key={opt.id ?? `draft-${index}`}
              sx={{
                p: 2,
                borderRadius: 1,
                border: 1,
                borderColor: 'divider',
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                <Stack spacing={1.5} sx={{ flex: 1 }}>
                  <TextField
                    size="small"
                    label={t('onboarding.optionValue')}
                    value={opt.value}
                    onChange={(e) => updateAt(index, { value: e.target.value })}
                    disabled={disabled}
                    fullWidth
                  />
                  <TextField
                    size="small"
                    label={t('onboarding.optionLabelAr')}
                    value={opt.labelAr}
                    onChange={(e) => updateAt(index, { labelAr: e.target.value })}
                    disabled={disabled}
                    fullWidth
                  />
                  <TextField
                    size="small"
                    label={t('onboarding.optionLabelEn')}
                    value={opt.labelEn}
                    onChange={(e) => updateAt(index, { labelEn: e.target.value })}
                    disabled={disabled}
                    fullWidth
                  />
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <TextField
                      size="small"
                      type="number"
                      label={t('onboarding.colOrder')}
                      value={opt.sortOrder}
                      onChange={(e) => updateAt(index, { sortOrder: Number(e.target.value) })}
                      disabled={disabled}
                      sx={{ width: 120 }}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={opt.isActive}
                          onChange={(e) => updateAt(index, { isActive: e.target.checked })}
                          disabled={disabled}
                        />
                      }
                      label={t('common.active')}
                    />
                  </Stack>
                </Stack>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => removeAt(index)}
                  disabled={disabled}
                  aria-label={t('common.delete')}
                >
                  <DeleteOutlinedIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}
