import { FormControl, InputLabel, MenuItem, Select as MuiSelect, type SelectProps as MuiSelectProps } from '@mui/material';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
  size?: MuiSelectProps['size'];
  fullWidth?: boolean;
}

export function Select({ label, value, onChange, options, className, size = 'small', fullWidth = true }: SelectProps) {
  const labelId = label ? `select-${label.replace(/\s/g, '-')}` : undefined;

  return (
    <FormControl size={size} fullWidth={fullWidth} className={className}>
      {label && <InputLabel id={labelId}>{label}</InputLabel>}
      <MuiSelect
        labelId={labelId}
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <MenuItem key={o.value || '__all'} value={o.value}>
            {o.label}
          </MenuItem>
        ))}
      </MuiSelect>
    </FormControl>
  );
}
