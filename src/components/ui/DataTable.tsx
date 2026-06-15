import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useTheme } from '@mui/material';
import { EmptyState } from './EmptyState';
import { LoadingSpinner } from './LoadingSpinner';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
  width?: number | string;
  minWidth?: number | string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  footer?: React.ReactNode;
}

const cellSx = (col: Pick<Column<unknown>, 'align' | 'width' | 'minWidth'>) => ({
  textAlign: col.align ?? 'start',
  ...(col.width !== undefined ? { width: col.width } : {}),
  ...(col.minWidth !== undefined ? { minWidth: col.minWidth } : {}),
});

export function DataTable<T>({ columns, data, loading, keyExtractor, onRowClick, footer }: DataTableProps<T>) {
  const theme = useTheme();

  if (loading) {
    return (
      <Paper sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <LoadingSpinner />
      </Paper>
    );
  }

  if (!data.length) return <EmptyState />;

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      className="admin-data-table-wrapper"
      sx={{ border: 1, borderColor: 'divider', borderRadius: 3, overflowX: 'auto' }}
    >
      <Table size="small" dir={theme.direction} className="admin-data-table" sx={{ minWidth: 960, tableLayout: 'auto' }}>
        <TableHead>
          <TableRow sx={{ bgcolor: 'action.hover' }}>
            {columns.map((col) => (
              <TableCell
                key={col.key}
                className={col.className}
                sx={{ fontWeight: 600, color: 'text.secondary', whiteSpace: 'nowrap', ...cellSx(col) }}
              >
                {col.header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow
              key={keyExtractor(row)}
              hover
              onClick={() => onRowClick?.(row)}
              sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {columns.map((col) => (
                <TableCell key={col.key} className={col.className} sx={cellSx(col)}>
                  {col.render(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
        {footer}
      </Table>
    </TableContainer>
  );
}
