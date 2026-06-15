import { Box, Chip, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/Modal';
import { ContentStatusBadge } from '@/components/content/ContentStatusBadge';
import { ContentTypeBadge } from '@/components/content/ContentTypeBadge';
import type { ContentPageItem, ContentStatus, SleepTipItem } from '@/types';

type PreviewItem =
  | (ContentPageItem & { kind: 'page' })
  | (SleepTipItem & { kind: 'tip' });

interface ContentPreviewModalProps {
  item: PreviewItem | null;
  onClose: () => void;
}

export function ContentPreviewModal({ item, onClose }: ContentPreviewModalProps) {
  const { t } = useTranslation();
  if (!item) return null;

  const type = item.kind === 'tip' ? 'TIP' : item.type;
  const status = item.status as ContentStatus;

  return (
    <Modal open={!!item} title={t('content.previewTitle')} onClose={onClose} size="lg">
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
          <ContentTypeBadge type={type} />
          <ContentStatusBadge status={status} />
          {item.kind === 'page' && (
            <Chip size="small" variant="outlined" label={`/${item.slug}`} sx={{ fontFamily: 'monospace', fontSize: 11 }} />
          )}
          {item.kind === 'tip' && item.category && (
            <Chip size="small" variant="outlined" label={item.category} />
          )}
        </Stack>

        <Typography variant="h6" sx={{ fontWeight: 700 }} dir="auto">
          {item.titleAr}
        </Typography>
        {item.titleEn && (
          <Typography variant="body2" color="text.secondary" dir="auto">
            {item.titleEn}
          </Typography>
        )}

        <Box
          dir="auto"
          sx={{
            p: 2,
            borderRadius: 2,
            border: 1,
            borderColor: 'divider',
            bgcolor: 'action.hover',
            '& p': { m: 0, mb: 1 },
            typography: 'body2',
            lineHeight: 1.7,
          }}
          dangerouslySetInnerHTML={{ __html: item.contentAr }}
        />

        {item.kind === 'tip' && item.imageUrl && (
          <Box
            component="img"
            src={item.imageUrl}
            alt={item.titleAr}
            sx={{ maxWidth: '100%', maxHeight: 200, borderRadius: 2, objectFit: 'cover' }}
          />
        )}
      </Stack>
    </Modal>
  );
}
