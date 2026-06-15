import { Box, Typography } from '@mui/material';
import { Inbox } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function EmptyState({ message }: { message?: string }) {
  const { t } = useTranslation();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, color: 'text.secondary' }}>
      <Inbox size={40} style={{ opacity: 0.45, marginBottom: 12 }} />
      <Typography variant="body2">{message ?? t('common.noData')}</Typography>
    </Box>
  );
}
