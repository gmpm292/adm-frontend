import { FilterMatchMode, FilterOperator } from "primereact/api";
import { ColumnProps } from "primereact/column";
import { DataTableProps } from "primereact/datatable";

export enum ConditionalOperator {
  EQUAL = "EQUAL",
  DISTINCT = "DISTINCT",
  GREATER_THAN = "GREATER_THAN",
  GREATER_EQUAL_THAN = "GREATER_EQUAL_THAN",
  LESS_THAN = "LESS_THAN",
  LESS_EQUAL_THAN = "LESS_EQUAL_THAN",
  START_WITH = "START_WITH",
  END_WITH = "END_WITH",
  CONTAINS = "CONTAINS",
  NOT_CONTAINS = "NOT_CONTAINS",
  IS_NULL = "IS_NULL",
  IS_NOT_NULL = "IS_NOT_NULL",
  ANY = "ANY",
  ANY_OPERATOR_AND_VALUE = "ANY_OPERATOR_AND_VALUE",
}

export enum LogicalOperator {
  AND = "AND",
  OR = "OR",
}

export interface ListFilter {
  property: string;
  operator: ConditionalOperator;
  value?: string;
  logicalOperator?: LogicalOperator;
  filters?: ListFilter[];
}

export interface ListSort {
  property: string;
  direction: "ASC" | "DESC";
}

// Tipos para los filtros de PrimeReact
export interface PrimeReactFilterConstraint {
  value: any;
  matchMode: FilterMatchMode;
}

export interface PrimeReactFilter {
  operator?: FilterOperator;
  constraints: PrimeReactFilterConstraint[];
}

export interface PrimeReactFilters {
  [field: string]: PrimeReactFilter;
}

export interface PrimeReactSortMeta {
  field: string;
  order: 1 | -1;
}

// Tipos extendidos para las columnas
export interface GenericColumn extends Omit<ColumnProps, "header"> {
  field: string;
  header: string;
  filter?: boolean;
  sortField?: string;
  filterMatchMode?: FilterMatchMode;
  filterMatchModeOptions?: { label: string; value: FilterMatchMode }[];
  filterElement?: React.ReactNode;
}

// Parámetros para fetchData
export interface FetchParams {
  skip: number;
  take: number;
  sorts?: ListSort[];
  filters?: ListFilter[];
  showDeleted?: boolean;
}

// Props para GenericDataTable
export interface GenericDataTableProps
  extends Omit<DataTableProps, "value" | "header" | "filters"> {
  columns: GenericColumn[];
  data?: any[];
  totalRecords?: number;
  loading?: boolean;
  error?: Error;
  onFetchData?: (
    params: FetchParams
  ) => Promise<{ data: any[]; totalCount: number }>;
  globalFilterFields?: string[];
  emptyMessage?: string;
  currentPageReportTemplate?: string;
  pageSizeOptions?: number[];
  initialPageSize?: number;
  initialFilters?: PrimeReactFilters;
  initialSorts?: PrimeReactSortMeta[];
  refreshable?: boolean;
  onRefresh?: (showDeleted?: boolean) => void;
  onRowClick?: (event: any) => void;
  rowClassName?: string | ((data: any) => string);
  scrollable?: boolean;
  scrollHeight?: string;
  children?: React.ReactNode;
  header?: React.ReactNode;
  showDeleted?: boolean;
}

export interface UseDataTableParams {
  onFetchData?: (params: FetchParams) => void;
  globalFilterFields?: string[];
  showDeleted?: boolean;
  initialFilters?: PrimeReactFilters;
  initialSorts?: PrimeReactSortMeta[];
}
