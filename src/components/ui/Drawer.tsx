import { Box, Drawer as MuiDrawer, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';

interface DrawerProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: number | string;
}

export function Drawer({ open, title, onClose, children, width = 480 }: DrawerProps) {
  const { t } = useTranslation();

  return (
    <MuiDrawer anchor="right" open={open} onClose={onClose} slotProps={{ paper: { sx: { width: { xs: '100%', sm: width } } } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <IconButton aria-label={t('common.cancel')} onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto', px: 2.5, py: 2 }}>{children}</Box>
    </MuiDrawer>
  );
}
