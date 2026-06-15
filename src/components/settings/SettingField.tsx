import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import {
  Autocomplete,
  Box,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  inferFieldKind,
  isValidEmail,
  phoneFullValue,
  phoneLocalPart,
  TIMEZONE_OPTIONS,
  type SettingFieldKind,
} from '@/config/settingsFields';
import type { AppSetting } from '@/types';

interface SettingFieldProps {
  setting: AppSetting;
  value: string;
  onChange: (value: string) => void;
}

function fieldLabel(t: (k: string) => string, key: string) {
  const label = t(`settings.fields.${key}.label`);
  if (!label.startsWith('settings.fields.')) return label;
  return key
    .split(/[._]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function fieldHelper(t: (k: string) => string, key: string) {
  const h = t(`settings.fields.${key}.helper`);
  return h.startsWith('settings.fields.') ? undefined : h;
}

export function SettingField({ setting, value, onChange }: SettingFieldProps) {
  const { t } = useTranslation();
  const kind: SettingFieldKind = inferFieldKind(setting);
  const label = fieldLabel(t, setting.key);
  const helper = fieldHelper(t, setting.key);

  if (kind === 'boolean') {
    const on = value === 'true';
    return (
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
          {label}
        </Typography>
        {helper && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            {helper}
          </Typography>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Switch
            checked={on}
            onChange={(e) => onChange(e.target.checked ? 'true' : 'false')}
            color={setting.key === 'maintenance_mode' ? 'warning' : 'primary'}
          />
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: setting.key === 'maintenance_mode' ? (on ? 'warning.main' : 'success.main') : 'text.primary',
            }}
          >
            {setting.key === 'maintenance_mode'
              ? on
                ? t('settings.maintenanceOn')
                : t('settings.maintenanceOff')
              : on
                ? t('common.yes')
                : t('common.no')}
          </Typography>
        </Box>
      </Box>
    );
  }

  if (kind === 'locale') {
    return (
      <FormControl size="small" fullWidth>
        <InputLabel>{label}</InputLabel>
        <Select label={label} value={value || 'AR'} onChange={(e) => onChange(e.target.value)}>
          <MenuItem value="AR">{t('settings.localeAr')}</MenuItem>
          <MenuItem value="EN">{t('settings.localeEn')}</MenuItem>
        </Select>
        {helper && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
            {helper}
          </Typography>
        )}
      </FormControl>
    );
  }

  if (kind === 'timezone') {
    return (
      <Box>
        <Autocomplete
          size="small"
          options={[...TIMEZONE_OPTIONS]}
          value={value || 'Asia/Riyadh'}
          onChange={(_, v) => onChange(v ?? 'Asia/Riyadh')}
          renderInput={(params) => <TextField {...params} label={label} />}
          freeSolo
          selectOnFocus
          clearOnBlur
          handleHomeEndKeys
        />
        {helper && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
            {helper}
          </Typography>
        )}
      </Box>
    );
  }

  if (kind === 'phone') {
    const local = phoneLocalPart(value);
    return (
      <Box>
        <TextField
          size="small"
          fullWidth
          label={label}
          value={local}
          onChange={(e) => onChange(phoneFullValue(e.target.value))}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    +966
                  </Typography>
                </InputAdornment>
              ),
            },
          }}
          placeholder="5XXXXXXXX"
        />
        {helper && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
            {helper}
          </Typography>
        )}
      </Box>
    );
  }

  if (kind === 'email') {
    const valid = !value.trim() || isValidEmail(value);
    return (
      <Box>
        <TextField
          size="small"
          fullWidth
          type="email"
          label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          error={!valid}
          slotProps={{
            input: {
              endAdornment: value.trim() ? (
                <InputAdornment position="end">
                  {valid ? (
                    <CheckCircleOutlinedIcon sx={{ fontSize: 20, color: 'success.main' }} />
                  ) : (
                    <ErrorOutlineOutlinedIcon sx={{ fontSize: 20, color: 'error.main' }} />
                  )}
                </InputAdornment>
              ) : undefined,
            },
          }}
        />
        {helper && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
            {helper}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box>
      <TextField
        size="small"
        fullWidth
        type={kind === 'number' ? 'number' : 'text'}
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        slotProps={{
          htmlInput: {
            dir: setting.key === 'app_name_ar' ? 'rtl' : setting.key === 'app_name_en' ? 'ltr' : undefined,
          },
        }}
      />
      {helper && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
          {helper}
        </Typography>
      )}
    </Box>
  );
}
