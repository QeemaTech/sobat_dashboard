import DownloadIcon from '@mui/icons-material/Download';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface ExportCsvButtonProps {
  onClick: () => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function ExportCsvButton({ onClick, disabled, size = 'small' }: ExportCsvButtonProps) {
  const { t } = useTranslation();

  return (
    <Button variant="outlined" startIcon={<DownloadIcon />} onClick={onClick} size={size} disabled={disabled}>
      {t('common.exportCsv')}
    </Button>
  );
}
