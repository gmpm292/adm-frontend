import { useCallback, useRef, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import GenericDataTable from "../../../../components/BaseTable";
import { getErrorMessage } from "../../../../utils/errors";
import { useHasRole } from "../../../../hooks/useHasRole";
import { formatMoney } from "../../../sales/format";
import {
  GET_MATERIAL_COSTS,
  REMOVE_MATERIAL_COSTS,
  RESTORE_MATERIAL_COSTS,
} from "../graphql/queries";
import { MaterialCostForm } from "./MaterialCostForm";

const nameColumn = {
  field: "name",
  header: "Material",
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
};

const costColumn = {
  field: "costPrice",
  header: "Costo",
  sortable: true,
  bodyClassName: "white-space-nowrap",
  body: (row) =>
    `${formatMoney(row.costPrice, row.currency?.code)} / ${
      row.unitOfMeasure?.symbol ?? "unidad"
    }`,
};

const businessColumn = {
  field: "business.name",
  header: "Empresa",
  sortable: true,
  filter: true,
  body: (row) => row.business?.name,
};

const usageColumns = [
  {
    field: "productCount",
    header: "Productos",
    sortable: false,
    bodyClassName: "text-right",
    headerClassName: "text-right",
    body: (row) => row.productCount ?? 0,
  },
  {
    field: "isActive",
    header: "Estado",
    sortable: true,
    body: (row) =>
      row.isActive ? (
        <Tag value="Activo" severity="success" />
      ) : (
        <Tag value="Inactivo" severity="secondary" />
      ),
  },
];

export function MaterialCostTable() {
  const toast = useRef(null);
  const lastParams = useRef(null);
  const hasRole = useHasRole();
  const canEdit = hasRole("SUPER", "PRINCIPAL");
  const isSuper = hasRole("SUPER");
  // { material } al editar, {} al crear
  const [form, setForm] = useState(null);
  const [fetchMaterials, { loading, data, error }] = useLazyQuery(
    GET_MATERIAL_COSTS,
    { fetchPolicy: "network-only" }
  );
  const [removeMaterials] = useMutation(REMOVE_MATERIAL_COSTS);
  const [restoreMaterials] = useMutation(RESTORE_MATERIAL_COSTS);

  const handleFetchData = useCallback(
    async (params) => {
      lastParams.current = params;
      try {
        const { data: response } = await fetchMaterials({
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
          data: response?.materialCosts?.data,
          totalCount: response?.materialCosts?.totalCount,
        };
      } catch {
        return { data: [], totalCount: 0 };
      }
    },
    [fetchMaterials]
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
      created ? "Material creado" : "Material actualizado",
      saved?.name
    );
  };

  const handleDelete = (row) => {
    if (row.productCount > 0) {
      notify(
        "warn",
        "No se puede eliminar",
        `«${row.name}» lo usan ${row.productCount} producto(s): desactívalo en su lugar`
      );
      return;
    }
    confirmDialog({
      header: "Eliminar material",
      message: `Se eliminará el material «${row.name}». Puedes restaurarlo después.`,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Eliminar",
      rejectLabel: "Cancelar",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await removeMaterials({ variables: { ids: [row.id] } });
          notify("success", "Material eliminado", row.name);
          handleRefresh();
        } catch (err) {
          notify("error", "No se pudo eliminar", getErrorMessage(err));
        }
      },
    });
  };

  const handleRestore = async (row) => {
    try {
      await restoreMaterials({ variables: { ids: [row.id] } });
      notify("success", "Material restaurado", row.name);
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
          tooltip="Restaurar material"
          tooltipOptions={{ position: "top" }}
          aria-label="Restaurar material"
          onClick={() => handleRestore(row)}
        />
      </div>
    ) : (
      <div className="actions-column">
        <Button
          icon="pi pi-pencil"
          text
          rounded
          tooltip="Editar material"
          tooltipOptions={{ position: "top" }}
          aria-label="Editar material"
          onClick={() => setForm({ material: row })}
        />
        <Button
          icon="pi pi-trash"
          text
          rounded
          severity="danger"
          tooltip="Eliminar material"
          tooltipOptions={{ position: "top" }}
          aria-label="Eliminar material"
          onClick={() => handleDelete(row)}
        />
      </div>
    );

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <GenericDataTable
        columns={[
          nameColumn,
          costColumn,
          ...(isSuper ? [businessColumn] : []),
          ...usageColumns,
        ]}
        data={data?.materialCosts?.data}
        totalRecords={data?.materialCosts?.totalCount}
        loading={loading}
        error={error}
        globalFilterFields={["name", "description", "unitOfMeasure.name"]}
        emptyMessage="No hay materiales"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} materiales"
        onRefresh={handleRefresh}
        onFetchData={handleFetchData}
        initialPageSize={10}
        initialSorts={[{ field: "name", order: 1 }]}
        header={
          canEdit && (
            <Button
              label="Nuevo material"
              icon="pi pi-plus"
              onClick={() => setForm({})}
            />
          )
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
        <MaterialCostForm
          material={form.material}
          onHide={() => setForm(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}

export default MaterialCostTable;
