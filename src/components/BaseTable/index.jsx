import React, { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import PropTypes from "prop-types";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import "./styles.css";
import useDataTable from "./useDataTable";

const renderColumnHeader = (field, displayName) => (
  <div className="flex align-items-center">
    <span>{displayName}</span>
  </div>
);

const GenericDataTable = ({
  columns,
  data,
  totalRecords,
  loading,
  error,
  emptyMessage = "No se encontraron registros",
  currentPageReportTemplate = "Mostrando {first} a {last} de {totalRecords} registros",
  pageSizeOptions = [5, 10, 25, 50],
  initialPageSize = 10,
  globalFilterFields = [],
  refreshable = true,
  onRefresh,
  onFetchData,
  onRowClick,
  rowClassName,
  scrollable,
  scrollHeight,
  children,
  header, // Nuevo prop para el header personalizado
}) => {
  const {
    lazyState,
    globalFilterValue,
    columnFilters,
    multiSortMeta,
    onPage,
    onSort,
    onGlobalFilterChange,
    onFilter,
    loadData,
  } = useDataTable(onFetchData, globalFilterFields);

  // Initialize filters
  const initFilters = () => {
    const filters = {};
    columns.forEach((col) => {
      if (col.filter) {
        filters[col.field] = {
          operator: FilterOperator.AND,
          constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
        };
      }
    });
    return filters;
  };

  const [filters, setFilters] = useState(initFilters());

  React.useEffect(() => {
    if (onRefresh) {
      loadData();
    }
  }, [onRefresh, loadData]);

  // Header por defecto
  const defaultHeader = (
    <div className="flex justify-content-between align-items-center">
      {refreshable && (
        <Button
          icon="pi pi-refresh"
          onClick={onRefresh || loadData}
          className="p-button-text"
          tooltip="Recargar datos"
          tooltipOptions={{ position: "bottom" }}
        />
      )}
      <span className="p-input-icon-left w-full md:w-20rem">
        <i className="pi pi-search" />
        <InputText
          value={globalFilterValue}
          onChange={onGlobalFilterChange}
          placeholder="Buscar en todos los campos..."
        />
      </span>
    </div>
  );

  // Header combinado si se pasa el prop header
  const combinedHeader = header ? (
    <div className="flex justify-content-between align-items-center">
      <div className="flex align-items-center gap-2">
        {refreshable && (
          <Button
            icon="pi pi-refresh"
            onClick={onRefresh || loadData}
            className="p-button-text"
            tooltip="Recargar datos"
            tooltipOptions={{ position: "bottom" }}
          />
        )}
        {header}
      </div>
      <span className="p-input-icon-left w-full md:w-20rem">
        <i className="pi pi-search" />
        <InputText
          value={globalFilterValue}
          onChange={onGlobalFilterChange}
          placeholder="Buscar en todos los campos..."
        />
      </span>
    </div>
  ) : (
    defaultHeader
  );

  return (
    <div className="generic-data-table">
      <DataTable
        value={data || []}
        lazy
        paginator
        first={lazyState.first}
        rows={lazyState.rows}
        totalRecords={totalRecords || 0}
        onPage={onPage}
        onSort={onSort}
        sortMode="multiple"
        multiSortMeta={multiSortMeta}
        loading={loading}
        emptyMessage={emptyMessage}
        responsiveLayout="scroll"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate={currentPageReportTemplate}
        rowsPerPageOptions={pageSizeOptions}
        removableSort
        scrollable={scrollable}
        scrollHeight={scrollHeight}
        onRowClick={onRowClick}
        rowClassName={rowClassName}
        filters={filters}
        onFilter={onFilter}
        filterDisplay="menu"
        globalFilter={globalFilterValue}
        globalFilterFields={globalFilterFields}
        header={combinedHeader} // Usamos el header combinado
      >
        {columns.map((column) => (
          <Column
            key={column.field}
            field={column.field}
            header={renderColumnHeader(column.field, column.header)}
            body={column.body}
            sortable={column.sortable !== false}
            sortField={column.sortField || column.field}
            filter={column.filter}
            filterField={column.field}
            filterMatchModeOptions={[
              { label: "Empieza con", value: FilterMatchMode.STARTS_WITH },
              { label: "Contiene", value: FilterMatchMode.CONTAINS },
              { label: "Termina con", value: FilterMatchMode.ENDS_WITH },
              { label: "Igual a", value: FilterMatchMode.EQUALS },
              { label: "Diferente a", value: FilterMatchMode.NOT_EQUALS },
            ]}
            showFilterMatchModes={column.filter}
            showFilterMenuOptions={column.filter}
            showFilterMenu={column.filter}
            style={column.style}
            headerStyle={column.headerStyle}
            bodyStyle={column.bodyStyle}
            className={column.className}
            sortIcon="pi pi-sort-alt"
          />
        ))}
        {children}
      </DataTable>

      {error && (
        <div className="p-message p-message-error">
          Error al cargar datos: {error.message}
        </div>
      )}
    </div>
  );
};

GenericDataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      field: PropTypes.string.isRequired,
      header: PropTypes.string.isRequired,
      body: PropTypes.func,
      sortable: PropTypes.bool,
      sortField: PropTypes.string,
      filter: PropTypes.bool,
      style: PropTypes.object,
      headerStyle: PropTypes.object,
      bodyStyle: PropTypes.object,
      className: PropTypes.string,
    })
  ).isRequired,
  data: PropTypes.array,
  totalRecords: PropTypes.number,
  loading: PropTypes.bool,
  error: PropTypes.object,
  emptyMessage: PropTypes.string,
  currentPageReportTemplate: PropTypes.string,
  pageSizeOptions: PropTypes.arrayOf(PropTypes.number),
  initialPageSize: PropTypes.number,
  globalFilterFields: PropTypes.arrayOf(PropTypes.string),
  refreshable: PropTypes.bool,
  onRefresh: PropTypes.func,
  onFetchData: PropTypes.func,
  onRowClick: PropTypes.func,
  rowClassName: PropTypes.func,
  scrollable: PropTypes.bool,
  scrollHeight: PropTypes.string,
  header: PropTypes.node, // Nuevo prop para el header personalizado
};

export default GenericDataTable;
