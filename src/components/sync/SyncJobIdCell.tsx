import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { shortId } from '@/utils/formatters';

interface SyncJobIdCellProps {
  id: string;
  onViewDetails: () => void;
}

export function SyncJobIdCell({ id, onViewDetails }: SyncJobIdCellProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const label = shortId(id);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
      <Tooltip title={id}>
        <Typography
          component="button"
          variant="body2"
          onClick={onViewDetails}
          sx={{
            fontFamily: 'monospace',
            fontWeight: 600,
            color: 'primary.main',
            border: 0,
            bgcolor: 'transparent',
            cursor: 'pointer',
            p: 0,
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          #{label}
        </Typography>
      </Tooltip>
      <Tooltip title={copied ? t('syncLogs.copied') : t('syncLogs.copyId')}>
        <IconButton size="small" onClick={copy} aria-label={t('syncLogs.copyId')}>
          <ContentCopyOutlinedIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
