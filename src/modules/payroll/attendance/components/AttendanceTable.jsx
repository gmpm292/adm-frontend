import { useCallback, useEffect, useRef, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Column } from "primereact/column";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import GenericDataTable from "../../../../components/BaseTable";
import { getErrorMessage } from "../../../../utils/errors";
import {
  GET_ATTENDANCES,
  MARK_ATTENDANCES_AS_PAID,
  REMOVE_ATTENDANCES,
  RESTORE_ATTENDANCES,
  UPDATE_ATTENDANCE,
} from "../graphql/queries";
import {
  ATTENDANCE_STATUS,
  currentTime,
  dayKey,
  formatHours,
  formatTime,
  today,
  workerName,
  workerTypeLabel,
} from "../../format";
import { useHasRole } from "../../../../hooks/useHasRole";
import { AttendanceForm } from "./AttendanceForm";

const EMPTY = <span className="text-color-secondary">—</span>;

const columns = [
  {
    field: "worker.tempFirstName",
    header: "Trabajador",
    sortable: true,
    body: (row) => (
      <span className="flex flex-column">
        <span className="font-medium text-900">{workerName(row.worker)}</span>
        <small className="text-color-secondary">
          {[workerTypeLabel(row.worker?.workerType), row.office?.name]
            .filter(Boolean)
            .join(" · ")}
        </small>
      </span>
    ),
  },
  {
    field: "status",
    header: "Estado",
    sortable: true,
    body: (row) => {
      const status = ATTENDANCE_STATUS[row.status];
      return status ? (
        <Tag severity={status.severity} value={status.label} />
      ) : (
        EMPTY
      );
    },
  },
  {
    field: "checkInTime",
    header: "Entrada",
    sortable: true,
    body: (row) => (row.checkInTime ? formatTime(row.checkInTime) : EMPTY),
  },
  {
    field: "checkOutTime",
    header: "Salida",
    sortable: true,
    body: (row) => (row.checkOutTime ? formatTime(row.checkOutTime) : EMPTY),
  },
  {
    field: "hoursWorked",
    header: "Horas",
    sortable: true,
    body: (row) =>
      Number(row.hoursWorked) > 0 ? formatHours(row.hoursWorked) : EMPTY,
  },
  {
    field: "notes",
    header: "Notas",
    sortable: false,
    body: (row) =>
      row.isPaid ? (
        <Tag severity="success" value="Pagado" />
      ) : (
        row.notes || EMPTY
      ),
  },
];

const shiftDay = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export function AttendanceTable() {
  const toast = useRef(null);
  const lastParams = useRef(null);
  const hasRole = useHasRole();
  const canEdit = hasRole("SUPER", "PRINCIPAL", "ADMIN", "MANAGER");
  const canDelete = hasRole("SUPER", "PRINCIPAL", "ADMIN");
  const canRestore = hasRole("SUPER");
  const canMarkPaid = hasRole("SUPER", "PRINCIPAL", "ADMIN");
  const [day, setDay] = useState(today);
  const dayRef = useRef(day);
  const [fetchAttendances, { loading, data, error }] = useLazyQuery(
    GET_ATTENDANCES,
    { fetchPolicy: "network-only" },
  );
  const [updateAttendance] = useMutation(UPDATE_ATTENDANCE);
  const [removeAttendances] = useMutation(REMOVE_ATTENDANCES);
  const [restoreAttendances] = useMutation(RESTORE_ATTENDANCES);
  const [markAttendancesAsPaid] = useMutation(MARK_ATTENDANCES_AS_PAID);
  // { attendance } al editar, {} al crear
  const [form, setForm] = useState(null);
  const isToday = dayKey(day) === dayKey(today());

  const handleFetchData = useCallback(
    async (params) => {
      lastParams.current = params;
      // Del inicio al final del día local, en ISO (el formato que admite)
      const start = new Date(dayRef.current);
      const end = shiftDay(start, 1);
      end.setMilliseconds(-1);
      try {
        const { data: response } = await fetchAttendances({
          variables: {
            options: {
              skip: params.skip,
              take: params.take,
              withDeleted: params.showDeleted,
              filters: [
                ...(params.filters ?? []),
                {
                  property: "attendanceDate",
                  operator: "GREATER_EQUAL_THAN",
                  value: start.toISOString(),
                },
                {
                  property: "attendanceDate",
                  operator: "LESS_EQUAL_THAN",
                  value: end.toISOString(),
                },
              ],
              sorts: params.sorts,
            },
          },
        });
        return {
          data: response?.attendances?.data,
          totalCount: response?.attendances?.totalCount,
        };
      } catch {
        return { data: [], totalCount: 0 };
      }
    },
    [fetchAttendances],
  );

  const handleRefresh = useCallback(() => {
    if (lastParams.current) handleFetchData(lastParams.current);
  }, [handleFetchData]);

  // Al cambiar de día se vuelve a la primera página
  useEffect(() => {
    dayRef.current = day;
    if (lastParams.current) {
      handleFetchData({ ...lastParams.current, skip: 0 });
    }
  }, [day, handleFetchData]);

  const notify = (severity, summary, detail) =>
    toast.current?.show({ severity, summary, detail, life: 6000 });

  const handleSaved = (saved, { created }) => {
    setForm(null);
    handleRefresh();
    notify(
      "success",
      created ? "Registro creado" : "Asistencia actualizada",
      saved?.name,
    );
  };

  // Entrada o salida con la hora de este momento
  const markNow = async (row, field) => {
    try {
      await updateAttendance({
        variables: { attendance: { id: row.id, [field]: currentTime() } },
      });
      notify(
        "success",
        field === "checkInTime" ? "Entrada registrada" : "Salida registrada",
        `${workerName(row.worker)} · ${currentTime()}`,
      );
      handleRefresh();
    } catch (err) {
      notify("error", "No se pudo registrar", getErrorMessage(err));
    }
  };

  const handleDelete = (row) =>
    confirmDialog({
      header: "Eliminar registro",
      message: `Se eliminará la asistencia de ${workerName(row.worker)} de este día.`,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Eliminar",
      rejectLabel: "Cancelar",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await removeAttendances({ variables: { ids: [row.id] } });
          notify("success", "Registro eliminado", workerName(row.worker));
          handleRefresh();
        } catch (err) {
          notify("error", "No se pudo eliminar", getErrorMessage(err));
        }
      },
    });

  const handleMarkPaid = (row) =>
    confirmDialog({
      header: "Marcar como pagada",
      message: `Se marcará como pagada la asistencia de ${workerName(row.worker)} de este día. No se puede deshacer desde aquí.`,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Marcar pagada",
      rejectLabel: "Cancelar",
      accept: async () => {
        try {
          await markAttendancesAsPaid({ variables: { ids: [row.id] } });
          notify("success", "Asistencia marcada como pagada", workerName(row.worker));
          handleRefresh();
        } catch (err) {
          notify("error", "No se pudo marcar como pagada", getErrorMessage(err));
        }
      },
    });

  const handleRestore = async (row) => {
    try {
      await restoreAttendances({ variables: { ids: [row.id] } });
      notify("success", "Registro restaurado", workerName(row.worker));
      handleRefresh();
    } catch (err) {
      notify("error", "No se pudo restaurar", getErrorMessage(err));
    }
  };

  const actionBodyTemplate = (row) => {
    if (row.deletedAt) {
      return (
        <div className="actions-column">
          {canRestore && (
            <Button
              icon="pi pi-history"
              text
              rounded
              severity="success"
              tooltip="Restaurar registro"
              tooltipOptions={{ position: "top" }}
              aria-label="Restaurar registro"
              onClick={() => handleRestore(row)}
            />
          )}
        </div>
      );
    }
    const editable = canEdit && !row.isPaid;
    return (
      <div className="actions-column">
        {editable && isToday && !row.checkInTime && (
          <Button
            icon="pi pi-sign-in"
            text
            rounded
            severity="success"
            tooltip="Registrar la entrada ahora"
            tooltipOptions={{ position: "top" }}
            aria-label="Registrar la entrada ahora"
            onClick={() => markNow(row, "checkInTime")}
          />
        )}
        {editable && isToday && row.checkInTime && !row.checkOutTime && (
          <Button
            icon="pi pi-sign-out"
            text
            rounded
            severity="danger"
            tooltip="Registrar la salida ahora"
            tooltipOptions={{ position: "top" }}
            aria-label="Registrar la salida ahora"
            onClick={() => markNow(row, "checkOutTime")}
          />
        )}
        {editable && (
          <Button
            icon="pi pi-pencil"
            text
            rounded
            tooltip="Editar"
            tooltipOptions={{ position: "top" }}
            aria-label="Editar asistencia"
            onClick={() => setForm({ attendance: row })}
          />
        )}
        {canMarkPaid && !row.isPaid && (
          <Button
            icon="pi pi-dollar"
            text
            rounded
            severity="success"
            tooltip="Marcar como pagada"
            tooltipOptions={{ position: "top" }}
            aria-label="Marcar como pagada"
            onClick={() => handleMarkPaid(row)}
          />
        )}
        {canDelete && !row.isPaid && (
          <Button
            icon="pi pi-trash"
            text
            rounded
            severity="danger"
            tooltip="Eliminar"
            tooltipOptions={{ position: "top" }}
            aria-label="Eliminar registro"
            onClick={() => handleDelete(row)}
          />
        )}
      </div>
    );
  };

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <GenericDataTable
        columns={columns}
        data={data?.attendances?.data}
        totalRecords={data?.attendances?.totalCount}
        loading={loading}
        error={error}
        globalFilterFields={[
          "worker.tempFirstName",
          "worker.tempLastName",
          "user.name",
          "user.lastName",
          "office.name",
        ]}
        emptyMessage={
          isToday
            ? "Aún no hay registros de hoy: se crean de madrugada o con «Nuevo registro»"
            : "No hay registros de este día"
        }
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
        onRefresh={handleRefresh}
        onFetchData={handleFetchData}
        initialPageSize={25}
        header={
          <div className="flex flex-wrap align-items-center gap-2">
            {canEdit && (
              <Button
                label="Nuevo registro"
                icon="pi pi-plus"
                onClick={() => setForm({})}
              />
            )}
            <Button
              icon="pi pi-chevron-left"
              text
              rounded
              severity="secondary"
              tooltip="Día anterior"
              aria-label="Día anterior"
              onClick={() => setDay((d) => shiftDay(d, -1))}
            />
            <Calendar
              value={day}
              onChange={(e) => e.value && setDay(e.value)}
              dateFormat="DD, dd/mm/yy"
              maxDate={today()}
              aria-label="Día"
            />
            <Button
              icon="pi pi-chevron-right"
              text
              rounded
              severity="secondary"
              tooltip="Día siguiente"
              aria-label="Día siguiente"
              disabled={isToday}
              onClick={() => setDay((d) => shiftDay(d, 1))}
            />
            {!isToday && (
              <Button
                label="Hoy"
                text
                severity="secondary"
                onClick={() => setDay(today())}
              />
            )}
          </div>
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
        <AttendanceForm
          attendance={form.attendance}
          day={day}
          onHide={() => setForm(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
