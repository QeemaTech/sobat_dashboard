import WatchRoundedIcon from '@mui/icons-material/WatchRounded';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { SyncLog } from '@/types';
import { syncLogSourceKind } from '@/utils/syncLogUtils';

const SOURCE_ICON = {
  apple: WatchRoundedIcon,
  manual: EditNoteOutlinedIcon,
  integration: HubOutlinedIcon,
} as const;

const SOURCE_ACCENT = {
  apple: '#22c55e',
  manual: '#f97316',
  integration: '#6366f1',
} as const;

interface SyncLogSourceCellProps {
  log: SyncLog;
}

export function SyncLogSourceCell({ log }: SyncLogSourceCellProps) {
  const { t, i18n } = useTranslation();
  const type = log.source?.type;
  const kind = syncLogSourceKind(type);
  const Icon = SOURCE_ICON[kind];
  const label =
    kind === 'apple'
      ? t('syncLogs.sourceApple')
      : kind === 'manual'
        ? t('syncLogs.sourceManual')
        : i18n.language === 'en'
          ? log.source?.nameEn || t('syncLogs.sourceOther')
          : log.source?.nameAr || log.source?.nameEn || t('syncLogs.sourceOther');

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: `${SOURCE_ACCENT[kind]}18`,
          color: SOURCE_ACCENT[kind],
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 18 }} />
      </Box>
      <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
        {label}
      </Typography>
    </Box>
  );
}
