import { Box, IconButton, Typography } from '@mui/material';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/hooks/useLanguage';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const { t } = useTranslation();
  const { isRtl } = useLanguage();
  const Prev = isRtl ? ChevronRight : ChevronLeft;
  const Next = isRtl ? ChevronLeft : ChevronRight;

  if (totalPages <= 1) return null;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, pt: 2 }}>
      <IconButton size="small" disabled={page <= 1} onClick={() => onPageChange(page - 1)} sx={{ border: 1, borderColor: 'divider' }}>
        <Prev size={16} />
      </IconButton>
      <Typography variant="body2" color="text.secondary">
        {t('pagination.page', { page, total: totalPages })}
      </Typography>
      <IconButton size="small" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} sx={{ border: 1, borderColor: 'divider' }}>
        <Next size={16} />
      </IconButton>
    </Box>
  );
}
