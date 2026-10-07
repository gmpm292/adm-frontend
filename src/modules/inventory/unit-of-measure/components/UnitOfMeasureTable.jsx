import { useCallback, useRef, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import GenericDataTable from "../../../../components/BaseTable";
import { ConditionalOperator } from "../../../../components/BaseTable/types";
import { getErrorMessage } from "../../../../utils/errors";
import { useHasRole } from "../../../../hooks/useHasRole";
import { UNIT_CATEGORIES, unitCategoryLabel } from "../categories";
import {
  GET_UNITS_OF_MEASURE,
  REMOVE_UNITS_OF_MEASURE,
  RESTORE_UNITS_OF_MEASURE,
} from "../graphql/queries";
import { UnitOfMeasureForm } from "./UnitOfMeasureForm";

const columns = [
  {
    field: "name",
    header: "Nombre",
    sortable: true,
    filter: true,
    body: (row) => (
      <span className="flex flex-column">
        <span className="font-medium text-900">{row.name}</span>
        {row.description && (
          <small className="text-color-secondary">{row.description}</small>
        )}
      </span>
    ),
  },
  { field: "symbol", header: "Símbolo", sortable: true, filter: true },
  {
    field: "category",
    header: "Categoría",
    sortable: true,
    body: (row) =>
      row.category ? (
        unitCategoryLabel(row.category)
      ) : (
        <span className="text-color-secondary">Sin categoría</span>
      ),
  },
  {
    field: "isActive",
    header: "Estado",
    sortable: true,
    body: (row) =>
      row.isActive ? (
        <Tag value="Activa" severity="success" />
      ) : (
        <Tag value="Inactiva" severity="secondary" />
      ),
  },
];

/** Unidades de medida: catálogo común a todas las empresas, lo mantiene SUPER */
export function UnitOfMeasureTable() {
  const toast = useRef(null);
  const lastParams = useRef(null);
  const hasRole = useHasRole();
  const canEdit = hasRole("SUPER");
  const [category, setCategory] = useState(null);
  // { unit } al editar, {} al crear
  const [form, setForm] = useState(null);
  const [fetchUnits, { loading, data, error }] = useLazyQuery(
    GET_UNITS_OF_MEASURE,
    { fetchPolicy: "network-only" }
  );
  const [removeUnits] = useMutation(REMOVE_UNITS_OF_MEASURE);
  const [restoreUnits] = useMutation(RESTORE_UNITS_OF_MEASURE);

  const handleFetchData = useCallback(
    async (params) => {
      lastParams.current = params;
      try {
        const { data: response } = await fetchUnits({
          variables: {
            options: {
              skip: params.skip,
              take: params.take,
              withDeleted: params.showDeleted,
              sorts: params.sorts,
              filters: [
                ...(params.filters ?? []),
                ...(category
                  ? [
                      {
                        property: "category",
                        operator: ConditionalOperator.EQUAL,
                        value: category,
                      },
                    ]
                  : []),
              ],
            },
          },
        });
        return {
          data: response?.unitOfMeasures?.data,
          totalCount: response?.unitOfMeasures?.totalCount,
        };
      } catch {
        return { data: [], totalCount: 0 };
      }
    },
    [fetchUnits, category]
  );

  const handleRefresh = useCallback(() => {
    if (lastParams.current) handleFetchData(lastParams.current);
  }, [handleFetchData]);

  const notify = (severity, summary, detail) =>
    toast.current?.show({ severity, summary, detail, life: 6000 });

  const handleSaved = (saved, { created }) => {
    setForm(null);
    handleRefresh();
    notify(
      "success",
      created ? "Unidad creada" : "Unidad actualizada",
      `${saved?.name} (${saved?.symbol})`
    );
  };

  const handleDelete = (row) =>
    confirmDialog({
      header: "Eliminar unidad",
      message: `Se eliminará la unidad «${row.name}». Si la usan productos o materiales no se podrá: desactívala en su lugar.`,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Eliminar",
      rejectLabel: "Cancelar",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await removeUnits({ variables: { ids: [row.id] } });
          notify("success", "Unidad eliminada", row.name);
          handleRefresh();
        } catch (err) {
          notify("error", "No se pudo eliminar", getErrorMessage(err));
        }
      },
    });

  const handleRestore = async (row) => {
    try {
      await restoreUnits({ variables: { ids: [row.id] } });
      notify("success", "Unidad restaurada", row.name);
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
          tooltip="Restaurar unidad"
          tooltipOptions={{ position: "top" }}
          aria-label="Restaurar unidad"
          onClick={() => handleRestore(row)}
        />
      </div>
    ) : (
      <div className="actions-column">
        <Button
          icon="pi pi-pencil"
          text
          rounded
          tooltip="Editar unidad"
          tooltipOptions={{ position: "top" }}
          aria-label="Editar unidad"
          onClick={() => setForm({ unit: row })}
        />
        <Button
          icon="pi pi-trash"
          text
          rounded
          severity="danger"
          tooltip="Eliminar unidad"
          tooltipOptions={{ position: "top" }}
          aria-label="Eliminar unidad"
          onClick={() => handleDelete(row)}
        />
      </div>
    );

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <GenericDataTable
        // Cambiar de categoría vuelve a la primera página
        key={category ?? "all"}
        columns={columns}
        data={data?.unitOfMeasures?.data}
        totalRecords={data?.unitOfMeasures?.totalCount}
        loading={loading}
        error={error}
        globalFilterFields={["name", "symbol"]}
        emptyMessage="No hay unidades"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} unidades"
        onRefresh={handleRefresh}
        onFetchData={handleFetchData}
        initialPageSize={10}
        initialSorts={[{ field: "name", order: 1 }]}
        header={
          <div className="flex flex-wrap align-items-center gap-2">
            <Dropdown
              value={category}
              options={UNIT_CATEGORIES}
              optionLabel="label"
              optionValue="value"
              onChange={(e) => setCategory(e.value ?? null)}
              placeholder="Todas las categorías"
              aria-label="Categoría"
              showClear
            />
            {canEdit && (
              <Button
                label="Nueva unidad"
                icon="pi pi-plus"
                onClick={() => setForm({})}
              />
            )}
          </div>
        }
        showDeleted={canEdit}
      >
        {canEdit && (
          <Column
            body={actionBodyTemplate}
            header="Acciones"
            className="w-8rem"
          />
        )}
      </GenericDataTable>

      {form && (
        <UnitOfMeasureForm
          unit={form.unit}
          onHide={() => setForm(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}

export default UnitOfMeasureTable;
