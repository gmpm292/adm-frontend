import { ColumnProps } from 'primereact/column';
import { DataTableProps } from 'primereact/datatable';

export interface GenericColumn extends Omit<ColumnProps, 'header'> {
  field: string;
  header: string;
  filter?: boolean;
  sortField?: string;
}

export interface GenericDataTableProps extends Omit<DataTableProps, 'value' | 'header'> {
  columns: GenericColumn[];
  data: any[];
  totalRecords?: number;
  loading?: boolean;
  error?: Error;
  emptyMessage?: string;
  currentPageReportTemplate?: string;
  pageSizeOptions?: number[];
  initialPageSize?: number;
  globalFilterFields?: string[];
  refreshable?: boolean;
  onRefresh?: () => void;
  rowActions?: (rowData: any) => React.ReactNode;
}