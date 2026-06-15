import { CircularProgress } from '@mui/material';

export function LoadingSpinner({ className }: { className?: string }) {
  return <CircularProgress size={32} className={className} />;
}
