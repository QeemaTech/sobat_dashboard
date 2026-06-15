import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import { Autocomplete, Box, Button, TextField } from '@mui/material';
import { FilterPanel } from '@/components/ui/FilterPanel';
import { Select } from '@/components/ui/Select';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { usersService } from '@/services/users.service';

export interface SleepFilters extends Record<string, string> {
  userId: string;
  dateFrom: string;
  dateTo: string;
  type: string;
  zone: string;
  source: string;
}

interface SleepFilterBarProps {
  filters: SleepFilters;
  onChange: (patch: Partial<SleepFilters>) => void;
  onReset: () => void;
  showUserFilter?: boolean;
  showTypeFilter?: boolean;
  showZoneFilter?: boolean;
  showSourceFilter?: boolean;
}

export function SleepFilterBar({
  filters,
  onChange,
  onReset,
  showUserFilter = true,
  showTypeFilter = false,
  showZoneFilter = false,
  showSourceFilter = false,
}: SleepFilterBarProps) {
  const { t } = useTranslation();
  const [userSearch, setUserSearch] = useState('');
  const debouncedSearch = useDebouncedValue(userSearch, 400);

  const { data: userResults } = useQuery({
    queryKey: ['user-search', debouncedSearch],
    queryFn: () => usersService.list({ search: debouncedSearch, limit: 8 }),
    enabled: showUserFilter && debouncedSearch.length >= 2,
  });

  useEffect(() => {
    if (!filters.userId) setUserSearch('');
  }, [filters.userId]);

  const userOptions = userResults?.data ?? [];

  return (
    <FilterPanel>
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)', xl: 'repeat(6, 1fr)' },
        }}
      >
        {showUserFilter && (
          <Box sx={{ gridColumn: { lg: 'span 2' } }}>
            <Autocomplete
              size="small"
              options={userOptions}
              getOptionLabel={(u) => `${u.fullName} (${u.email})`}
              inputValue={userSearch}
              onInputChange={(_, v) => setUserSearch(v)}
              onChange={(_, u) => {
                if (u) {
                  onChange({ userId: u.id });
                  setUserSearch(`${u.fullName} (${u.email})`);
                }
              }}
              renderInput={(params) => <TextField {...params} label={t('filters.user')} placeholder={t('filters.userSearch')} />}
              noOptionsText={debouncedSearch.length < 2 ? t('filters.userSearch') : t('common.noData')}
            />
          </Box>
        )}
        <TextField
          size="small"
          label={t('filters.dateFrom')}
          type="date"
          value={filters.dateFrom}
          onChange={(e) => onChange({ dateFrom: e.target.value })}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          size="small"
          label={t('filters.dateTo')}
          type="date"
          value={filters.dateTo}
          onChange={(e) => onChange({ dateTo: e.target.value })}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        {showTypeFilter && (
          <Select
            label={t('filters.sessionType')}
            value={filters.type}
            onChange={(v) => onChange({ type: v })}
            options={[
              { value: '', label: t('filters.all') },
              { value: 'MAIN', label: t('session.MAIN') },
              { value: 'NAP', label: t('session.NAP') },
            ]}
          />
        )}
        {showZoneFilter && (
          <Select
            label={t('filters.zone')}
            value={filters.zone}
            onChange={(v) => onChange({ zone: v })}
            options={[
              { value: '', label: t('filters.all') },
              { value: 'PEAK', label: t('zones.PEAK') },
              { value: 'COMFORT', label: t('zones.COMFORT') },
              { value: 'CAUTION', label: t('zones.CAUTION') },
              { value: 'DANGER', label: t('zones.DANGER') },
            ]}
          />
        )}
        {showSourceFilter && (
          <Select
            label={t('filters.source')}
            value={filters.source}
            onChange={(v) => onChange({ source: v })}
            options={[
              { value: '', label: t('filters.all') },
              { value: 'manual', label: t('source.manual') },
              { value: 'health_sync', label: t('source.health_sync') },
              { value: 'auto', label: t('source.auto') },
            ]}
          />
        )}
        <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
          <Button size="small" variant="outlined" startIcon={<RotateLeftIcon />} onClick={onReset}>
            {t('filters.reset')}
          </Button>
        </Box>
      </Box>
    </FilterPanel>
  );
}
