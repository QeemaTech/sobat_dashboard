import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  type DialogProps,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';

const maxWidthMap = {
  md: 'sm',
  lg: 'md',
  xl: 'lg',
  full: 'xl',
} as const satisfies Record<string, DialogProps['maxWidth']>;

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: keyof typeof maxWidthMap;
}

export function Modal({ open, title, onClose, children, footer, size = 'md' }: ModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidthMap[size]} fullWidth scroll="paper">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
        {title}
        <IconButton aria-label={t('common.cancel')} onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>{children}</DialogContent>
      {footer && <DialogActions sx={{ px: 3, py: 2 }}>{footer}</DialogActions>}
    </Dialog>
  );
}
