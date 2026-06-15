import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { Box, Button, Paper } from '@mui/material';
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
  type GridRowParams,
  GridToolbarContainer,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import { EmptyState } from '@/components/ui/EmptyState';
import { tokens } from '@/theme/tokens';

function CustomToolbar({ onExport }: { onExport?: () => void }) {
  const { t } = useTranslation();
  return (
    <GridToolbarContainer sx={{ p: 1.5, gap: 1, borderBottom: 1, borderColor: 'divider' }}>
      <GridToolbarQuickFilter />
      {onExport && (
        <Button size="small" variant="outlined" startIcon={<FileDownloadOutlinedIcon />} onClick={onExport}>
          {t('audit.export')}
        </Button>
      )}
    </GridToolbarContainer>
  );
}

export interface AppDataGridProps<T extends { id: string }> {
  rows: T[];
  columns: GridColDef<T>[];
  loading?: boolean;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  onExport?: () => void;
  height?: number | string;
  hideToolbar?: boolean;
}

export function AppDataGrid<T extends { id: string }>({
  rows,
  columns,
  loading,
  pageSize = 10,
  onRowClick,
  onExport,
  height = 420,
  hideToolbar,
}: AppDataGridProps<T>) {
  const paginationModel: GridPaginationModel = useMemo(() => ({ page: 0, pageSize }), [pageSize]);

  if (!loading && !rows.length) {
    return (
      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: tokens.radius.md }}>
        <EmptyState />
      </Paper>
    );
  }

  return (
    <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: tokens.radius.md, overflow: 'hidden' }}>
      <Box sx={{ width: '100%', height }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          pageSizeOptions={[5, 10, 25]}
          initialState={{ pagination: { paginationModel } }}
          onRowClick={onRowClick ? (params: GridRowParams<T>) => onRowClick(params.row) : undefined}
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: (theme) => (theme.palette.mode === 'light' ? '#F8FAFC' : '#111535'),
              borderBottom: 1,
              borderColor: 'divider',
            },
            '& .MuiDataGrid-row': { cursor: onRowClick ? 'pointer' : 'default' },
            '& .MuiDataGrid-row:hover': { bgcolor: 'action.hover' },
            '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': { outline: 'none' },
          }}
          slots={{
            toolbar: hideToolbar ? undefined : () => <CustomToolbar onExport={onExport} />,
          }}
          showToolbar={!hideToolbar}
        />
      </Box>
    </Paper>
  );
}
