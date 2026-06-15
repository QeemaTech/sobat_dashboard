import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import { Box, Typography } from '@mui/material';

export function NotificationReadIndicator({ isRead }: { isRead: boolean }) {
  if (isRead) {
    return (
      <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'success.main' }}>
        <CheckOutlinedIcon sx={{ fontSize: 20 }} />
      </Box>
    );
  }

  return (
    <Typography component="span" variant="body2" color="text.disabled" sx={{ fontWeight: 500 }}>
      —
    </Typography>
  );
}

