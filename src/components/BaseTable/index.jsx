import React from "react";
import { useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import PropTypes from "prop-types";
import "./styles.css";
import useDataTable from "./useDataTable";

const ColumnFilter = React.memo(
  ({ field, header, columnFilters, handleColumnFilterChange }) => {
    const inputRef = useRef(null);

    return (
      <div className="p-fluid">
        <div className="p-inputgroup">
          <InputText
            ref={inputRef}
            value={columnFilters[field] || ""}
            onChange={(e) => handleColumnFilterChange(field, e.target.value)}
            placeholder={`Filtrar ${header.toLowerCase()}...`}
          />
          <Button
            icon="pi pi-times"
            className="p-button-text"
            onClick={() => {
              handleColumnFilterChange(field, "");
              if (inputRef.current) {
                inputRef.current.value = "";
              }
            }}
            tooltip="Limpiar filtro"
            tooltipOptions={{ position: "top" }}
          />
        </div>
      </div>
    );
  }
);

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
}) => {
  const {
    lazyState,
    globalFilterValue,
    columnFilters,
    multiSortMeta,
    onPage,
    onSort,
    onGlobalFilterChange,
    handleColumnFilterChange,
    loadData,
  } = useDataTable(onFetchData);

  // Efecto para manejar el refresh manual
  React.useEffect(() => {
    if (onRefresh) {
      loadData();
    }
  }, [onRefresh, loadData]);

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
        header={
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
        }
        globalFilter={globalFilterValue}
        globalFilterFields={globalFilterFields}
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
            filterElement={
              column.filter && (
                <ColumnFilter
                  field={column.field}
                  header={column.header}
                  columnFilters={columnFilters}
                  handleColumnFilterChange={handleColumnFilterChange}
                />
              )
            }
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
};

export default GenericDataTable;