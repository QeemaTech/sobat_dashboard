import { Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
  confirmLoading?: boolean;
}

export function ConfirmDialog({ open, title, message, onConfirm, onCancel, destructive, confirmLoading }: ConfirmDialogProps) {
  const { t } = useTranslation();

  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      footer={
        <>
          <Button variant="outlined" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button variant="contained" color={destructive ? 'error' : 'primary'} onClick={onConfirm} disabled={confirmLoading}>
            {t('common.confirm')}
          </Button>
        </>
      }
    >
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Modal>
  );
}
