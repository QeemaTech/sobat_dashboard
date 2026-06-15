import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Box, IconButton, Typography } from '@mui/material';

interface ContentOrderCellProps {
  sortOrder: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  disabled?: boolean;
}

export function ContentOrderCell({
  sortOrder,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  disabled,
}: ContentOrderCellProps) {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
      <DragIndicatorIcon sx={{ fontSize: 18, color: 'text.disabled', cursor: 'grab' }} />
      <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 20, textAlign: 'center' }}>
        {sortOrder}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', ml: 0.25 }}>
        <IconButton
          size="small"
          disabled={disabled || !canMoveUp}
          onClick={onMoveUp}
          sx={{ p: 0.25, '&:disabled': { opacity: 0.3 } }}
        >
          <KeyboardArrowUpIcon sx={{ fontSize: 16 }} />
        </IconButton>
        <IconButton
          size="small"
          disabled={disabled || !canMoveDown}
          onClick={onMoveDown}
          sx={{ p: 0.25, '&:disabled': { opacity: 0.3 } }}
        >
          <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
    </Box>
  );
}
