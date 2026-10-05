import React, { useCallback, useState, useMemo } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { ToggleButton } from "primereact/togglebutton";
import { MultiSelect } from "primereact/multiselect";
import PropTypes from "prop-types";
import { FilterMatchMode, FilterOperator } from "primereact/api";
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
  globalFilterFields = [],
  initialFilters = {},
  initialSorts = [],
  refreshable = true,
  onRefresh,
  onFetchData,
  onRowClick,
  rowClassName,
  scrollable,
  scrollHeight,
  children,
  header,
  showDeleted = false,
}) => {
  const [showDeletedState, setShowDeletedState] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState(
    columns.filter((col) => col.visible !== false).map((col) => col.field)
  );

  const {
    lazyState,
    globalFilterValue,
    multiSortMeta,
    onPage,
    onSort,
    onGlobalFilterChange,
    onFilter,
    loadData,
  } = useDataTable(
    onFetchData,
    globalFilterFields,
    showDeleted ? showDeletedState : undefined,
    initialFilters,
    initialSorts
  );

  const initFilters = () => {
    const filters = {};
    columns.forEach((col) => {
      if (col.filter) {
        const initialMatchMode =
          col.filterMatchMode ||
          col.filterMatchModeOptions?.[0]?.value ||
          FilterMatchMode.EQUALS;

        filters[col.field] = {
          operator: FilterOperator.AND,
          constraints: [{ value: null, matchMode: initialMatchMode }],
        };
      }
    });
    return filters;
  };

  const [filters] = useState({
    ...initFilters(), // Solo añade filtros para columnas no especificadas
    ...initialFilters,
  });

  React.useEffect(() => {
    if (onRefresh) {
      loadData();
    }
  }, [onRefresh, loadData]);

  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh(showDeleted ? showDeletedState : undefined);
    } else {
      loadData();
    }
  }, [onRefresh, loadData, showDeleted, showDeletedState]);

  const handleToggleDeleted = () => {
    setShowDeletedState(!showDeletedState);
  };

  const columnOptions = useMemo(() => {
    return columns.map((col) => ({
      label: col.header,
      value: col.field,
    }));
  }, [columns]);

  // Barra de la tabla: acciones de la pantalla a la izquierda, búsqueda y
  // opciones de vista a la derecha
  const combinedHeader = (
    <div className="ui-table-toolbar">
      <div className="ui-table-toolbar__group">{header}</div>
      <div className="ui-table-toolbar__group">
        <IconField iconPosition="left" className="ui-table-toolbar__search">
          <InputIcon className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Buscar..."
          />
        </IconField>
        <MultiSelect
          value={selectedColumns}
          options={columnOptions}
          onChange={(e) => setSelectedColumns(e.value)}
          optionLabel="label"
          placeholder="Columnas"
          maxSelectedLabels={0}
          selectedItemsLabel="{0} columnas"
        />
        {showDeleted && (
          <ToggleButton
            checked={showDeletedState}
            onChange={handleToggleDeleted}
            onLabel=""
            offLabel=""
            onIcon="pi pi-eye"
            offIcon="pi pi-eye-slash"
            tooltip={
              showDeletedState
                ? "Ocultar registros eliminados"
                : "Mostrar registros eliminados"
            }
            tooltipOptions={{ position: "bottom" }}
          />
        )}
        {refreshable && (
          <Button
            icon="pi pi-refresh"
            onClick={handleRefresh}
            text
            severity="secondary"
            tooltip="Recargar datos"
            tooltipOptions={{ position: "bottom" }}
          />
        )}
      </div>
    </div>
  );

  const getRowClassName = (data) => {
    const baseClass = rowClassName ? rowClassName(data) : "";
    return data[0].deletedAt ? `${baseClass} deleted-row` : baseClass;
  };

  const visibleColumns = useMemo(() => {
    return columns.filter((col) => selectedColumns.includes(col.field));
  }, [columns, selectedColumns]);

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
        rowClassName={getRowClassName}
        filters={filters}
        onFilter={onFilter}
        filterDisplay="menu"
        globalFilter={globalFilterValue}
        globalFilterFields={globalFilterFields}
        header={combinedHeader}
      >
        {visibleColumns.map((column) => (
          <Column
            key={column.field}
            field={column.field}
            header={renderColumnHeader(column.field, column.header)}
            body={column.body}
            sortable={column.sortable !== false}
            sortField={column.sortField || column.field}
            filter={column.filter}
            filterField={column.filterField || column.field}
            dataType={column.dataType}
            filterMatchModeOptions={
              column.filterMatchModeOptions ??
              (column.dataType === "date"
                ? [
                    { label: "Igual a", value: FilterMatchMode.EQUALS },
                    {
                      label: "Antes de",
                      value: FilterMatchMode.LESS_THAN_OR_EQUAL_TO,
                    },
                    {
                      label: "Después de",
                      value: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO,
                    },
                  ]
                : [
                    {
                      label: "Empieza con",
                      value: FilterMatchMode.STARTS_WITH,
                    },
                    { label: "Contiene", value: FilterMatchMode.CONTAINS },
                    { label: "Termina con", value: FilterMatchMode.ENDS_WITH },
                    { label: "Igual a", value: FilterMatchMode.EQUALS },
                    { label: "Diferente a", value: FilterMatchMode.NOT_EQUALS },
                  ])
            }
            filterElement={column.filterElement}
            showFilterMatchModes={column.filter}
            //showFilterMenuOptions={column.filterElement ? false : column.filter}
            showFilterMenuOptions={column.filter}
            showFilterMenu={column.filter}
            className={column.className}
            headerClassName={column.headerClassName}
            bodyClassName={column.bodyClassName}
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
      className: PropTypes.string,
      headerClassName: PropTypes.string,
      bodyClassName: PropTypes.string,
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
  header: PropTypes.node,
  showDeleted: PropTypes.bool,
};

export default GenericDataTable;
