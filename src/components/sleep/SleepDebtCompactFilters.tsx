import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import { Autocomplete, Box, Button, TextField } from '@mui/material';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { usersService } from '@/services/users.service';
import type { SleepFilters } from './SleepFilterBar';

interface SleepDebtCompactFiltersProps {
  filters: SleepFilters;
  onChange: (patch: Partial<SleepFilters>) => void;
  onReset: () => void;
}

export function SleepDebtCompactFilters({ filters, onChange, onReset }: SleepDebtCompactFiltersProps) {
  const { t } = useTranslation();
  const [userSearch, setUserSearch] = useState('');
  const debouncedSearch = useDebouncedValue(userSearch, 400);

  const { data: userResults } = useQuery({
    queryKey: ['user-search-debt-filter', debouncedSearch],
    queryFn: () => usersService.list({ search: debouncedSearch, limit: 8 }),
    enabled: debouncedSearch.length >= 2,
  });

  useEffect(() => {
    if (!filters.userId) setUserSearch('');
  }, [filters.userId]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
        gap: 1.5,
        mb: 2.5,
        p: 2,
        borderRadius: 2,
        border: 1,
        borderColor: 'divider',
        bgcolor: '#0f1535',
      }}
    >
      <Autocomplete
        size="small"
        sx={{ flex: 1, minWidth: 200, maxWidth: 320 }}
        options={userResults?.data ?? []}
        getOptionLabel={(u) => `${u.fullName} (${u.email})`}
        inputValue={userSearch}
        onInputChange={(_, v) => setUserSearch(v)}
        onChange={(_, u) => {
          onChange({ userId: u?.id ?? '' });
          if (u) setUserSearch(`${u.fullName} (${u.email})`);
        }}
        renderInput={(params) => (
          <TextField {...params} label={t('filters.user')} placeholder={t('filters.userSearch')} />
        )}
        noOptionsText={debouncedSearch.length < 2 ? t('filters.userSearch') : t('common.noData')}
      />
      <TextField
        size="small"
        label={t('filters.dateFrom')}
        type="date"
        value={filters.dateFrom}
        onChange={(e) => onChange({ dateFrom: e.target.value })}
        slotProps={{ inputLabel: { shrink: true } }}
        sx={{ width: 160 }}
      />
      <TextField
        size="small"
        label={t('filters.dateTo')}
        type="date"
        value={filters.dateTo}
        onChange={(e) => onChange({ dateTo: e.target.value })}
        slotProps={{ inputLabel: { shrink: true } }}
        sx={{ width: 160 }}
      />
      <Button size="small" variant="outlined" startIcon={<RotateLeftIcon />} onClick={onReset}>
        {t('filters.reset')}
      </Button>
    </Box>
  );
}
