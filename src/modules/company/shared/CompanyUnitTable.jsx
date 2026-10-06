import { useCallback, useMemo, useRef, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import GenericDataTable from "../../../components/BaseTable";
import { getErrorMessage } from "../../../utils/errors";
import { CompanyUnitForm } from "./CompanyUnitForm";

const EMPTY = <span className="text-color-secondary">—</span>;

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

/**
 * Listado de un nivel de la estructura de la empresa (`unit`, ver `units.js`):
 * buscar, crear, editar, eliminar y restaurar.
 */
export function CompanyUnitTable({ unit }) {
  const toast = useRef(null);
  const [fetchRows, { loading, data, error }] = useLazyQuery(unit.query, {
    fetchPolicy: "network-only",
  });
  const [removeRows] = useMutation(unit.remove);
  const [restoreRows] = useMutation(unit.restore);
  // { row } al editar, {} al crear
  const [form, setForm] = useState(null);
  const lastParams = useRef(null);

  const Name = capitalize(unit.singular);
  // Concordancia de género: «empresa creada», «equipo creado»
  const end = unit.article === "el" ? "o" : "a";

  const columns = useMemo(
    () =>
      unit.columns.map((column) => ({
        field: column.field,
        header: column.header,
        sortable: column.sortable,
        filter: column.filter,
        body: (row) => {
          const value = column.value ? column.value(row) : row[column.field];
          if (value === null || value === undefined || value === "") {
            return EMPTY;
          }
          return column.main ? (
            <span className="font-medium text-900">{value}</span>
          ) : (
            value
          );
        },
      })),
    [unit],
  );

  const handleFetchData = useCallback(
    async (params) => {
      lastParams.current = params;
      try {
        const { data: response } = await fetchRows({
          variables: {
            options: {
              skip: params.skip,
              take: params.take,
              withDeleted: params.showDeleted,
              filters: params.filters,
              sorts: params.sorts,
            },
          },
        });
        return {
          data: response?.[unit.list]?.data,
          totalCount: response?.[unit.list]?.totalCount,
        };
      } catch {
        return { data: [], totalCount: 0 };
      }
    },
    [fetchRows, unit],
  );

  const handleRefresh = useCallback(() => {
    if (lastParams.current) handleFetchData(lastParams.current);
  }, [handleFetchData]);

  const notify = (severity, summary, detail) =>
    toast.current?.show({ severity, summary, detail, life: 6000 });

  const handleSaved = (saved, created) => {
    setForm(null);
    handleRefresh();
    notify(
      "success",
      `${Name} ${created ? "cread" : "actualizad"}${end}`,
      saved?.name,
    );
  };

  const handleDelete = (row) =>
    confirmDialog({
      header: `Eliminar ${unit.singular}`,
      message: `Se eliminará ${unit.article} ${unit.singular} "${row.name}". Solo es posible si ya no tiene nada dentro, y puedes restaurarl${end} después.`,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Eliminar",
      rejectLabel: "Cancelar",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await removeRows({ variables: { ids: [row.id] } });
          notify("success", `${Name} eliminad${end}`, row.name);
          handleRefresh();
        } catch (err) {
          notify("error", "No se pudo eliminar", getErrorMessage(err));
        }
      },
    });

  const handleRestore = async (row) => {
    try {
      await restoreRows({ variables: { ids: [row.id] } });
      notify("success", `${Name} restaurad${end}`, row.name);
      handleRefresh();
    } catch (err) {
      notify("error", "No se pudo restaurar", getErrorMessage(err));
    }
  };

  const actionBodyTemplate = (row) =>
    row.deletedAt ? (
      <div className="actions-column">
        <Button
          icon="pi pi-history"
          text
          rounded
          severity="success"
          tooltip={`Restaurar ${unit.singular}`}
          tooltipOptions={{ position: "top" }}
          aria-label={`Restaurar ${unit.singular}`}
          onClick={() => handleRestore(row)}
        />
      </div>
    ) : (
      <div className="actions-column">
        <Button
          icon="pi pi-pencil"
          text
          rounded
          tooltip={`Editar ${unit.singular}`}
          tooltipOptions={{ position: "top" }}
          aria-label={`Editar ${unit.singular}`}
          onClick={() => setForm({ row })}
        />
        <Button
          icon="pi pi-trash"
          text
          rounded
          severity="danger"
          tooltip={`Eliminar ${unit.singular}`}
          tooltipOptions={{ position: "top" }}
          aria-label={`Eliminar ${unit.singular}`}
          onClick={() => handleDelete(row)}
        />
      </div>
    );

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <GenericDataTable
        columns={columns}
        data={data?.[unit.list]?.data}
        totalRecords={data?.[unit.list]?.totalCount}
        loading={loading}
        error={error}
        globalFilterFields={unit.searchFields}
        emptyMessage={`No se encontraron ${unit.totalLabel}`}
        currentPageReportTemplate={`Mostrando {first} a {last} de {totalRecords} ${unit.totalLabel}`}
        onRefresh={handleRefresh}
        onFetchData={handleFetchData}
        initialPageSize={10}
        header={
          <Button
            label={unit.newLabel}
            icon="pi pi-plus"
            onClick={() => setForm({})}
          />
        }
        showDeleted={true}
      >
        <Column
          body={actionBodyTemplate}
          header="Acciones"
          className="w-8rem"
        />
      </GenericDataTable>

      {form && (
        <CompanyUnitForm
          unit={unit}
          row={form.row}
          onHide={() => setForm(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
