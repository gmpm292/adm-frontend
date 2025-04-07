import { ColumnProps } from 'primereact/column';
import { DataTableProps } from 'primereact/datatable';

export enum ConditionalOperator {
  EQUAL = 'EQUAL',
  DISTINCT = 'DISTINCT',
  GREATER_THAN = 'GREATER_THAN',
  GREATER_EQUAL_THAN = 'GREATER_EQUAL_THAN',
  LESS_THAN = 'LESS_THAN',
  LESS_EQUAL_THAN = 'LESS_EQUAL_THAN',
  START_WITH = 'START_WITH',
  END_WITH = 'END_WITH',
  CONTAINS = 'CONTAINS',
  NOT_CONTAINS = 'NOT_CONTAINS',
  IS_NULL = 'IS_NULL',
  IS_NOT_NULL = 'IS_NOT_NULL',
  ANY = 'ANY',
  ANY_OPERATOR_AND_VALUE = 'ANY_OPERATOR_AND_VALUE'
}

export enum LogicalOperator {
  AND = 'AND',
  OR = 'OR'
}

export interface ListFilter {
  property: string;
  operator: ConditionalOperator;
  value?: string;
  logicalOperator?: LogicalOperator;
  filters?: ListFilter[];
}

export interface GenericColumn extends Omit<ColumnProps, 'header'> {
  field: string;
  header: string;
  filter?: boolean;
  sortField?: string;
  maxFilters?: number;
}

export interface FetchParams {
  skip: number;
  take: number;
  sorts?: {
    property: string;
    direction: 'ASC' | 'DESC';
  }[];
  filters?: ListFilter[];
}

export interface GenericDataTableProps extends Omit<DataTableProps, 'value' | 'header'> {
  columns: GenericColumn[];
  onFetchData: (params: FetchParams) => Promise<{ data: any[]; totalCount: number }>;
  globalFilterFields?: string[];
  emptyMessage?: string;
  currentPageReportTemplate?: string;
  pageSizeOptions?: number[];
  initialPageSize?: number;
  refreshable?: boolean;
  onRowClick?: (event: any) => void;
  rowClassName?: string | ((data: any) => string);
  scrollable?: boolean;
  scrollHeight?: string;
}