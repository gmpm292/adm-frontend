import { useCallback, useRef, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import GenericDataTable from "../../../../components/BaseTable";
import { getErrorMessage } from "../../../../utils/errors";
import {
  GET_WORK_SCHEDULES,
  REMOVE_WORK_SCHEDULES,
  RESTORE_WORK_SCHEDULES,
} from "../graphql/queries";
import { formatDay, workingDaysText } from "../../format";
import { useHasRole } from "../../useHasRole";
import { WorkScheduleForm } from "./WorkScheduleForm";

const columns = [
  {
    field: "name",
    header: "Nombre",
    sortable: true,
    filter: true,
    body: (row) => (
      <span className="flex flex-column">
        <span className="font-medium text-900">{row.name}</span>
        {row.notes && (
          <small className="text-color-secondary">{row.notes}</small>
        )}
      </span>
    ),
  },
  {
    field: "startDate",
    header: "Fechas",
    sortable: true,
    bodyClassName: "white-space-nowrap",
    body: (row) => `${formatDay(row.startDate)} – ${formatDay(row.endDate)}`,
  },
  {
    field: "workingDays",
    header: "Días laborables",
    sortable: false,
    body: (row) => workingDaysText(row.workingDays),
  },
  {
    field: "office.name",
    header: "Oficina",
    sortable: true,
    filter: true,
    body: (row) =>
      row.office?.name ?? (
        <span className="text-color-secondary">Toda la empresa</span>
      ),
  },
];

export function WorkScheduleTable() {
  const toast = useRef(null);
  const lastParams = useRef(null);
  const hasRole = useHasRole();
  const canEdit = hasRole("SUPER", "PRINCIPAL", "ADMIN");
  const canDelete = hasRole("SUPER", "PRINCIPAL");
  const canRestore = hasRole("SUPER");
  const [fetchSchedules, { loading, data, error }] = useLazyQuery(
    GET_WORK_SCHEDULES,
    { fetchPolicy: "network-only" },
  );
  const [removeSchedules] = useMutation(REMOVE_WORK_SCHEDULES);
  const [restoreSchedules] = useMutation(RESTORE_WORK_SCHEDULES);
  // { schedule } al editar, {} al crear
  const [form, setForm] = useState(null);

  const handleFetchData = useCallback(
    async (params) => {
      lastParams.current = params;
      try {
        const { data: response } = await fetchSchedules({
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
          data: response?.workSchedules?.data,
          totalCount: response?.workSchedules?.totalCount,
        };
      } catch {
        return { data: [], totalCount: 0 };
      }
    },
    [fetchSchedules],
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
      created ? "Horario creado" : "Horario actualizado",
      saved?.name,
    );
  };

  const handleDelete = (row) =>
    confirmDialog({
      header: "Eliminar horario",
      message: `Se eliminará el horario "${row.name}". Puedes restaurarlo después.`,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Eliminar",
      rejectLabel: "Cancelar",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await removeSchedules({ variables: { ids: [row.id] } });
          notify("success", "Horario eliminado", row.name);
          handleRefresh();
        } catch (err) {
          notify("error", "No se pudo eliminar", getErrorMessage(err));
        }
      },
    });

  const handleRestore = async (row) => {
    try {
      await restoreSchedules({ variables: { ids: [row.id] } });
      notify("success", "Horario restaurado", row.name);
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
            tooltip="Restaurar horario"
            tooltipOptions={{ position: "top" }}
            aria-label="Restaurar horario"
            onClick={() => handleRestore(row)}
          />
        )}
      </div>
    ) : (
      <div className="actions-column">
        {canEdit && (
          <Button
            icon="pi pi-pencil"
            text
            rounded
            tooltip="Editar horario"
            tooltipOptions={{ position: "top" }}
            aria-label="Editar horario"
            onClick={() => setForm({ schedule: row })}
          />
        )}
        {canDelete && (
          <Button
            icon="pi pi-trash"
            text
            rounded
            severity="danger"
            tooltip="Eliminar horario"
            tooltipOptions={{ position: "top" }}
            aria-label="Eliminar horario"
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
        data={data?.workSchedules?.data}
        totalRecords={data?.workSchedules?.totalCount}
        loading={loading}
        error={error}
        globalFilterFields={["name", "notes", "office.name"]}
        emptyMessage="No hay horarios"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} horarios"
        onRefresh={handleRefresh}
        onFetchData={handleFetchData}
        initialPageSize={10}
        initialSorts={[{ field: "startDate", order: -1 }]}
        header={
          canEdit && (
            <Button
              label="Nuevo horario"
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
          className="w-8rem"
        />
      </GenericDataTable>

      {form && (
        <WorkScheduleForm
          schedule={form.schedule}
          onHide={() => setForm(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
