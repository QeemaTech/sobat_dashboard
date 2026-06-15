import type { ReactNode } from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface SettingsSectionCardProps {
  title: string;
  subtitle: string;
  accent: string;
  icon: ReactNode;
  children: ReactNode;
  onSave: () => void;
  saving?: boolean;
  lastSaved?: string | null;
  dirty?: boolean;
}

export function SettingsSectionCard({
  title,
  subtitle,
  accent,
  icon,
  children,
  onSave,
  saving,
  lastSaved,
  dirty,
}: SettingsSectionCardProps) {
  const { t } = useTranslation();

  return (
    <Paper
      elevation={0}
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ display: 'flex', borderLeft: 4, borderColor: accent }}>
        <Box sx={{ flex: 1, p: { xs: 2, sm: 2.5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: `${accent}22`,
                color: accent,
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                {subtitle}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>{children}</Box>

          <Box
            sx={{
              mt: 3,
              pt: 2,
              borderTop: 1,
              borderColor: 'divider',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {lastSaved
                ? t('settings.lastSaved', { time: lastSaved })
                : dirty
                  ? t('settings.unsavedChanges')
                  : t('settings.noChanges')}
            </Typography>
            <Button variant="contained" size="small" onClick={onSave} disabled={saving || !dirty}>
              {saving ? t('settings.saving') : t('settings.saveSection')}
            </Button>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}
