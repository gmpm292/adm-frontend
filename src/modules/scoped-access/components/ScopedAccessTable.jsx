import { useCallback, useRef, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import GenericDataTable from "../../../components/BaseTable";
import { ConditionalOperator } from "../../../components/BaseTable/types";
import { getErrorMessage } from "../../../utils/errors";
import { TYPE_LABELS } from "../../role-guard/labels";
import { accessLevelLabel, isEnabled } from "../accessLevels";
import {
  GET_SCOPED_ACCESSES,
  REMOVE_SCOPED_ACCESSES,
  RESTORE_SCOPED_ACCESSES,
} from "../graphql/queries";
import { BusinessTabs } from "./BusinessTabs";
import { ScopedAccessForm } from "./ScopedAccessForm";

const columns = [
  {
    field: "roleGuard.queryOrEndPointURL",
    header: "Operación",
    sortable: true,
    filter: true,
    body: (row) => (
      <span className="flex flex-column">
        <span className="font-medium text-900">
          {row.roleGuard?.queryOrEndPointURL}
        </span>
        <small className="text-color-secondary">
          {TYPE_LABELS[row.roleGuard?.type] ?? row.roleGuard?.type}
        </small>
      </span>
    ),
  },
  {
    field: "business.name",
    header: "Empresa",
    sortable: true,
    filter: true,
    body: (row) => row.business?.name,
  },
  {
    field: "accessLevels",
    header: "Qué registros ve",
    sortable: false,
    body: (row) => (
      <div className="flex flex-wrap gap-1">
        {row.accessLevels.map((level) => (
          <Tag key={level} value={accessLevelLabel(level)} severity="info" />
        ))}
      </div>
    ),
  },
  {
    field: "entityStatus",
    header: "Estado",
    sortable: true,
    body: (row) =>
      isEnabled(row) ? (
        <Tag value="Activo" severity="success" />
      ) : (
        <Tag value="Inactivo" severity="secondary" />
      ),
  },
];

export function ScopedAccessTable() {
  const toast = useRef(null);
  const lastParams = useRef(null);
  const [businessId, setBusinessId] = useState(null);
  // { scopedAccess } al editar, {} al crear
  const [form, setForm] = useState(null);
  const [fetchScopedAccesses, { loading, data, error }] = useLazyQuery(
    GET_SCOPED_ACCESSES,
    { fetchPolicy: "network-only" }
  );
  const [removeScopedAccesses] = useMutation(REMOVE_SCOPED_ACCESSES);
  const [restoreScopedAccesses] = useMutation(RESTORE_SCOPED_ACCESSES);

  const handleFetchData = useCallback(
    async (params) => {
      lastParams.current = params;
      try {
        const { data: response } = await fetchScopedAccesses({
          variables: {
            options: {
              skip: params.skip,
              take: params.take,
              withDeleted: params.showDeleted,
              sorts: params.sorts,
              filters: [
                ...(params.filters ?? []),
                ...(businessId
                  ? [
                      {
                        property: "business.id",
                        operator: ConditionalOperator.EQUAL,
                        value: String(businessId),
                      },
                    ]
                  : []),
              ],
            },
          },
        });
        return {
          data: response?.scopedAccesses?.data,
          totalCount: response?.scopedAccesses?.totalCount,
        };
      } catch {
        return { data: [], totalCount: 0 };
      }
    },
    [fetchScopedAccesses, businessId]
  );

  const handleRefresh = useCallback(() => {
    if (lastParams.current) handleFetchData(lastParams.current);
  }, [handleFetchData]);

  const notify = (severity, summary, detail) =>
    toast.current?.show({ severity, summary, detail, life: 6000 });

  const describe = (row) =>
    `${row?.roleGuard?.queryOrEndPointURL} · ${row?.business?.name}`;

  const handleSaved = (saved, { created }) => {
    setForm(null);
    handleRefresh();
    notify(
      "success",
      created ? "Nivel de acceso creado" : "Nivel de acceso actualizado",
      describe(saved)
    );
  };

  const handleDelete = (row) =>
    confirmDialog({
      header: "Eliminar nivel de acceso",
      message: `${describe(row)} volverá a aplicar el nivel que trae la operación. Puedes restaurarlo después.`,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Eliminar",
      rejectLabel: "Cancelar",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await removeScopedAccesses({ variables: { ids: [row.id] } });
          notify("success", "Nivel de acceso eliminado", describe(row));
          handleRefresh();
        } catch (err) {
          notify("error", "No se pudo eliminar", getErrorMessage(err));
        }
      },
    });

  const handleRestore = async (row) => {
    try {
      await restoreScopedAccesses({ variables: { ids: [row.id] } });
      notify("success", "Nivel de acceso restaurado", describe(row));
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
          tooltip="Restaurar"
          tooltipOptions={{ position: "top" }}
          aria-label="Restaurar"
          onClick={() => handleRestore(row)}
        />
      </div>
    ) : (
      <div className="actions-column">
        <Button
          icon="pi pi-pencil"
          text
          rounded
          tooltip="Editar"
          tooltipOptions={{ position: "top" }}
          aria-label="Editar"
          onClick={() => setForm({ scopedAccess: row })}
        />
        <Button
          icon="pi pi-trash"
          text
          rounded
          severity="danger"
          tooltip="Eliminar"
          tooltipOptions={{ position: "top" }}
          aria-label="Eliminar"
          onClick={() => handleDelete(row)}
        />
      </div>
    );

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <GenericDataTable
        // Cambiar de empresa vuelve a la primera página
        key={businessId ?? "all"}
        columns={columns}
        data={data?.scopedAccesses?.data}
        totalRecords={data?.scopedAccesses?.totalCount}
        loading={loading}
        error={error}
        globalFilterFields={["roleGuard.queryOrEndPointURL", "business.name"]}
        emptyMessage="No hay niveles de acceso: cada operación aplica el suyo"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} niveles"
        onRefresh={handleRefresh}
        onFetchData={handleFetchData}
        initialPageSize={10}
        header={
          <div className="flex flex-wrap align-items-center justify-content-between gap-2 w-full">
            <BusinessTabs
              selectedBusiness={businessId}
              onBusinessChange={setBusinessId}
            />
            <Button
              label="Nuevo nivel"
              icon="pi pi-plus"
              onClick={() => setForm({})}
            />
          </div>
        }
        showDeleted
      >
        <Column body={actionBodyTemplate} header="Acciones" className="w-8rem" />
      </GenericDataTable>

      {form && (
        <ScopedAccessForm
          scopedAccess={form.scopedAccess}
          businessId={businessId}
          onHide={() => setForm(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}

export default ScopedAccessTable;
