import { useCallback, useRef, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import GenericDataTable from "../../../../components/BaseTable";
import { getErrorMessage } from "../../../../utils/errors";
import { GET_WORKERS, REMOVE_WORKERS, RESTORE_WORKERS } from "../graphql/queries";
import {
  formatMoney,
  workerContact,
  workerName,
  workerTypeLabel,
} from "../../format";
import { useHasRole } from "../../../../hooks/useHasRole";
import { WorkerForm } from "./WorkerForm";
import { WorkerDetailForm } from "./WorkerDetailForm";

const EMPTY = <span className="text-color-secondary">—</span>;

const columns = [
  {
    field: "tempFirstName",
    header: "Trabajador",
    sortable: true,
    body: (row) => (
      <span className="flex flex-column">
        <span className="font-medium text-900">{workerName(row)}</span>
        <small className="text-color-secondary">
          {workerContact(row).join(" · ") || "Sin contacto"}
        </small>
      </span>
    ),
  },
  {
    field: "workerType",
    header: "Tipo",
    sortable: true,
    body: (row) =>
      row.workerType === "OTHER" && row.otherType
        ? row.otherType
        : workerTypeLabel(row.workerType),
  },
  {
    field: "office.name",
    header: "Oficina",
    sortable: true,
    filter: true,
    body: (row) => (
      <span className="flex flex-column">
        <span>{row.office?.name ?? "Sin oficina"}</span>
        {row.department?.name && (
          <small className="text-color-secondary">{row.department.name}</small>
        )}
      </span>
    ),
  },
  {
    field: "baseSalary",
    header: "Salario base",
    sortable: true,
    bodyClassName: "white-space-nowrap",
    body: (row) => (row.baseSalary ? formatMoney(row.baseSalary) : EMPTY),
  },
  {
    field: "user.email",
    header: "Cuenta",
    sortable: false,
    body: (row) =>
      row.user ? (
        <Tag
          severity={row.user.enabled ? "success" : "warning"}
          value={row.user.enabled ? "Con acceso" : "Cuenta inactiva"}
        />
      ) : (
        <span className="text-color-secondary">Sin cuenta</span>
      ),
  },
  {
    field: "business.name",
    header: "Empresa",
    sortable: true,
    visible: false,
    body: (row) => row.business?.name ?? EMPTY,
  },
];

export function WorkerTable() {
  const toast = useRef(null);
  const lastParams = useRef(null);
  const hasRole = useHasRole();
  const canEdit = hasRole("SUPER", "PRINCIPAL", "ADMIN");
  const canDelete = hasRole("SUPER", "PRINCIPAL");
  const canRestore = hasRole("SUPER");
  const [fetchWorkers, { loading, data, error }] = useLazyQuery(GET_WORKERS, {
    fetchPolicy: "network-only",
  });
  const [removeWorkers] = useMutation(REMOVE_WORKERS);
  const [restoreWorkers] = useMutation(RESTORE_WORKERS);
  // { worker } al editar, {} al crear
  const [form, setForm] = useState(null);
  const [detail, setDetail] = useState(null);

  const handleFetchData = useCallback(
    async (params) => {
      lastParams.current = params;
      try {
        const { data: response } = await fetchWorkers({
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
          data: response?.workers?.data,
          totalCount: response?.workers?.totalCount,
        };
      } catch {
        return { data: [], totalCount: 0 };
      }
    },
    [fetchWorkers],
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
      created ? "Trabajador creado" : "Trabajador actualizado",
      saved?.name,
    );
  };

  const handleDelete = (row) =>
    confirmDialog({
      header: "Eliminar trabajador",
      message: `Se eliminará a ${workerName(row)}. Sus ventas, asistencia y pagos se conservan, y puedes restaurarlo después.`,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Eliminar",
      rejectLabel: "Cancelar",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await removeWorkers({ variables: { ids: [row.id] } });
          notify("success", "Trabajador eliminado", workerName(row));
          handleRefresh();
        } catch (err) {
          notify("error", "No se pudo eliminar", getErrorMessage(err));
        }
      },
    });

  const handleRestore = async (row) => {
    try {
      await restoreWorkers({ variables: { ids: [row.id] } });
      notify("success", "Trabajador restaurado", workerName(row));
      handleRefresh();
    } catch (err) {
      notify("error", "No se pudo restaurar", getErrorMessage(err));
    }
  };

  const actionBodyTemplate = (row) =>
    row.deletedAt ? (
      <div className="actions-column">
        {canRestore && (
          <Button
            icon="pi pi-history"
            text
            rounded
            severity="success"
            tooltip="Restaurar trabajador"
            tooltipOptions={{ position: "top" }}
            aria-label="Restaurar trabajador"
            onClick={() => handleRestore(row)}
          />
        )}
      </div>
    ) : (
      <div className="actions-column">
        <Button
          icon="pi pi-eye"
          text
          rounded
          severity="secondary"
          tooltip="Ver ficha"
          tooltipOptions={{ position: "top" }}
          aria-label="Ver ficha"
          onClick={() => setDetail(row)}
        />
        {canEdit && (
          <Button
            icon="pi pi-pencil"
            text
            rounded
            tooltip="Editar trabajador"
            tooltipOptions={{ position: "top" }}
            aria-label="Editar trabajador"
            onClick={() => setForm({ worker: row })}
          />
        )}
        {canDelete && (
          <Button
            icon="pi pi-trash"
            text
            rounded
            severity="danger"
            tooltip="Eliminar trabajador"
            tooltipOptions={{ position: "top" }}
            aria-label="Eliminar trabajador"
            onClick={() => handleDelete(row)}
          />
        )}
      </div>
    );

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <GenericDataTable
        columns={columns}
        data={data?.workers?.data}
        totalRecords={data?.workers?.totalCount}
        loading={loading}
        error={error}
        globalFilterFields={[
          "tempFirstName",
          "tempLastName",
          "user.name",
          "user.lastName",
          "tempPhone",
          "office.name",
        ]}
        emptyMessage="No se encontraron trabajadores"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} trabajadores"
        onRefresh={handleRefresh}
        onFetchData={handleFetchData}
        initialPageSize={10}
        header={
          canEdit && (
            <Button
              label="Nuevo trabajador"
              icon="pi pi-plus"
              onClick={() => setForm({})}
            />
          )
        }
        showDeleted={canRestore}
      >
        <Column
          body={actionBodyTemplate}
          header="Acciones"
          className="w-10rem"
        />
      </GenericDataTable>

      {form && (
        <WorkerForm
          worker={form.worker}
          onHide={() => setForm(null)}
          onSaved={handleSaved}
        />
      )}
      {detail && (
        <WorkerDetailForm
          workerId={detail.id}
          onHide={() => setDetail(null)}
          onEdit={
            canEdit
              ? () => {
                  setForm({ worker: detail });
                  setDetail(null);
                }
              : undefined
          }
        />
      )}
    </>
  );
}
