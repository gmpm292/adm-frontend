// attendance/components/AttendanceTable.tsx
import React, { useCallback, useState, useRef } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";

import GenericDataTable from "../../../../components/BaseTable/index";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";
import {
  GET_ATTENDANCES,
  REMOVE_ATTENDANCES,
  RESTORE_ATTENDANCES,
} from "../graphql/queries";
import { AttendanceCreateForm } from "./AttendanceCreateForm";
import { AttendanceEditForm } from "./AttendanceEditForm";
import { AttendanceDetailForm } from "./AttendanceDetailForm";
import { PrimeReactSortMeta } from "../../../../components/BaseTable/types";

// Ejemplo para pasar ordenamientos iniciales o por defecto.
const defaultSorts: PrimeReactSortMeta[] = [
  { field: "attendanceDate", order: -1 },
];

// Función para obtener el nombre completo del trabajador
const getWorkerFullName = (worker: any) => {
  if (!worker) return "Sin nombre";

  // 1. Prioridad: user.name y user.lastName
  if (worker.user && worker.user.name) {
    const fullName =
      `${worker.user.name || ""} ${worker.user.lastName || ""}`.trim();
    if (fullName) return fullName;
  }

  // 2. Si no, usar los campos temporales
  if (worker.tempFirstName || worker.tempLastName) {
    const tempFullName =
      `${worker.tempFirstName || ""} ${worker.tempLastName || ""}`.trim();
    if (tempFullName) return tempFullName;
  }

  // 3. Si hay user pero sin name/lastName, usar email
  if (worker.user && worker.user.email) {
    return worker.user.email;
  }

  // 4. Si hay tempEmail
  if (worker.tempEmail) {
    return worker.tempEmail;
  }

  // 5. Usar ID como último recurso
  if (worker.id) {
    return `Trabajador #${worker.id}`;
  }

  return "Sin nombre";
};

// Función para obtener información de contacto
const getWorkerContactInfo = (worker: any) => {
  if (!worker) return {};

  return {
    email: worker.user?.email || worker.tempEmail || null,
    phone: worker.user?.mobile || worker.tempPhone || null,
  };
};

// Función para obtener el tipo de trabajador en español
const getWorkerTypeLabel = (workerType: string) => {
  const types: Record<string, string> = {
    PUBLICIST: "Publicista",
    ECONOMIC: "Económico",
    SERVICE: "Servicio",
    COURIER: "Mensajero",
    TECHNICIAN: "Técnico",
    OPERATIVE: "Operativo",
    COMMUNITY_MANAGER: "Community Manager",
    PRINCIPAL: "Principal",
    ADMINISTRATIVE: "Administrativo",
    MANAGER: "Gerente",
    SUPERVISOR: "Supervisor",
    AGENT: "Agente",
    OTHER: "Otro",
  };
  return types[workerType] || workerType;
};

// Template para el estado de asistencia
const statusBodyTemplate = (rowData: any) => {
  const getSeverity = (status: string) => {
    switch (status) {
      case "present":
        return "success";
      case "absent":
        return "danger";
      case "late":
        return "warning";
      case "early_departure":
        return "warning";
      case "vacation":
        return "info";
      case "SICK_LEAVE":
        return "info";
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "present":
        return "Presente";
      case "absent":
        return "Ausente";
      case "late":
        return "Tardío";
      case "early_departure":
        return "Salida Temprana";
      case "vacation":
        return "Vacaciones";
      case "SICK_LEAVE":
        return "Enfermedad";
      default:
        return status;
    }
  };

  return (
    <Tag
      value={getStatusLabel(rowData.status)}
      severity={getSeverity(rowData.status)}
    />
  );
};

// Template para horarios
const timeBodyTemplate = (rowData: any, field: string) => {
  return rowData[field] ? (
    <span className="font-bold">{rowData[field]}</span>
  ) : (
    <span className="text-color-secondary">--:--</span>
  );
};

// Template para horas trabajadas
const hoursBodyTemplate = (rowData: any) => {
  return (
    <span className="font-bold">
      {rowData.hoursWorked ? `${rowData.hoursWorked.toFixed(1)}h` : "0h"}
    </span>
  );
};

// Template para estado de pago
const paidBodyTemplate = (rowData: any) => {
  return (
    <i
      className={`pi ${rowData.isPaid ? "pi-check-circle text-green-500" : "pi-times-circle text-red-500"}`}
      title={rowData.isPaid ? "Pagado" : "No pagado"}
    />
  );
};

// Template para día festivo
const holidayBodyTemplate = (rowData: any) => {
  return rowData.isHoliday ? <Tag value="Festivo" severity="info" /> : null;
};

// Template para información del trabajador (con iconos)
const workerInfoBodyTemplate = (rowData: any) => {
  const worker = rowData.worker;
  if (!worker)
    return <span className="text-color-secondary">Sin trabajador</span>;

  const fullName = getWorkerFullName(worker);
  const contactInfo = getWorkerContactInfo(worker);
  const workerType = getWorkerTypeLabel(worker.workerType);
  const departmentName = worker.department?.name || "Sin departamento";
  const officeName = worker.office?.name || "Sin oficina";

  return (
    <div className="flex align-items-start">
      <div className="worker-avatar-small mr-2 mt-1">
        <i className="pi pi-user text-sm"></i>
      </div>
      <div className="flex-1">
        <div className="font-bold">{fullName}</div>

        <div className="flex flex-wrap gap-2 mt-1">
          <div className="flex align-items-center gap-1">
            <i className="pi pi-briefcase text-xs text-color-secondary"></i>
            <span className="text-xs text-color-secondary">{workerType}</span>
          </div>

          {departmentName !== "Sin departamento" && (
            <div className="flex align-items-center gap-1">
              <i className="pi pi-building text-xs text-color-secondary"></i>
              <span className="text-xs text-color-secondary">
                {departmentName}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-1">
          {contactInfo.email && (
            <div className="flex align-items-center gap-1">
              <i className="pi pi-envelope text-xs text-color-secondary"></i>
              <span
                className="text-xs text-color-secondary truncate"
                style={{ maxWidth: "150px" }}
              >
                {contactInfo.email}
              </span>
            </div>
          )}

          {contactInfo.phone && (
            <div className="flex align-items-center gap-1">
              <i className="pi pi-phone text-xs text-color-secondary"></i>
              <span className="text-xs text-color-secondary">
                {contactInfo.phone}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Template para la fecha
const dateBodyTemplate = (rowData: any) => {
  const date = new Date(rowData.attendanceDate);
  const today = new Date();

  const isToday = date.toDateString() === today.toDateString();

  return (
    <div>
      <div className="font-bold">
        {date.toLocaleDateString("es-ES", {
          weekday: "short",
          day: "2-digit",
          month: "short",
        })}
      </div>
      <div className="text-sm text-color-secondary">{date.getFullYear()}</div>
      {isToday && <Tag value="Hoy" severity="info" className="mt-1" />}
    </div>
  );
};

// Template para el horario de trabajo
const workScheduleBodyTemplate = (rowData: any) => {
  const schedule = rowData.workSchedule;
  if (!schedule)
    return <span className="text-color-secondary">Sin horario</span>;

  const startDate = new Date(schedule.startDate);
  const endDate = new Date(schedule.endDate);

  return (
    <div className="text-sm">
      <div className="font-medium">
        {startDate.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "short",
        })}
        {" - "}
        {endDate.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "short",
        })}
      </div>
      <div className="text-xs text-color-secondary">
        {schedule.isRecurring ? "🔄 Recurrente" : "⏰ Único"}
      </div>
      {schedule.notes && (
        <div
          className="text-xs text-color-secondary truncate"
          title={schedule.notes}
          style={{ maxWidth: "150px" }}
        >
          <i className="pi pi-file"></i> {schedule.notes.substring(0, 30)}...
        </div>
      )}
    </div>
  );
};

// Template para la ubicación (business/office)
const locationBodyTemplate = (rowData: any) => {
  const businessName = rowData.business?.name;
  const officeName = rowData.office?.name;
  const departmentName = rowData.department?.name;

  return (
    <div className="text-sm">
      {businessName && (
        <div className="font-medium flex align-items-center gap-1">
          <i className="pi pi-building text-xs"></i>
          {businessName}
        </div>
      )}
      {officeName && (
        <div className="text-xs text-color-secondary flex align-items-center gap-1 mt-1">
          <i className="pi pi-map-marker text-xs"></i>
          {officeName}
        </div>
      )}
      {departmentName && (
        <div className="text-xs text-color-secondary flex align-items-center gap-1 mt-1">
          <i className="pi pi-sitemap text-xs"></i>
          {departmentName}
        </div>
      )}
    </div>
  );
};

export function AttendanceTable() {
  const [getAttendances, { loading, data, error }] = useLazyQuery(
    GET_ATTENDANCES,
    {
      fetchPolicy: "network-only",
    },
  );
  const [removeAttendances] = useMutation(REMOVE_ATTENDANCES);
  const [restoreAttendances] = useMutation(RESTORE_ATTENDANCES);
  const [selectedAttendanceId, setSelectedAttendanceId] = useState<
    number | null
  >(null);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [detailDialogVisible, setDetailDialogVisible] = useState(false);
  const toast = useRef<Toast>(null);
  const tableStateRef = useRef({
    filters: {},
    sorts: [],
    pagination: { first: 0, rows: 10 },
  });

  const handleFetchData = useCallback(
    async (params: any) => {
      try {
        tableStateRef.current = {
          filters: params.filters || {},
          sorts: params.sorts || [],
          pagination: {
            first: params.skip,
            rows: params.take,
          },
        };

        const { data: responseData } = await getAttendances({
          variables: {
            options: {
              skip: params.skip,
              take: params.take,
              filters: params.filters,
              sorts: params.sorts,
            },
          },
        });

        return {
          data: responseData?.attendances?.data || [],
          totalCount: responseData?.attendances?.totalCount || 0,
        };
      } catch (err) {
        console.error("Error fetching attendances:", err);
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Error al cargar los registros de asistencia",
          life: 3000,
        });
        return {
          data: [],
          totalCount: 0,
        };
      }
    },
    [getAttendances],
  );

  const handleRefresh = useCallback(() => {
    handleFetchData({
      skip: tableStateRef.current.pagination.first,
      take: tableStateRef.current.pagination.rows,
      filters: tableStateRef.current.filters,
      sorts: tableStateRef.current.sorts,
    });
  }, [handleFetchData]);

  const handleEditSuccess = useCallback(() => {
    handleRefresh();
  }, [handleRefresh]);

  const handleCreateSuccess = useCallback(() => {
    handleRefresh();
  }, [handleRefresh]);

  const handleEdit = (attendanceId: number) => {
    setSelectedAttendanceId(attendanceId);
    setEditDialogVisible(true);
  };

  const handleViewDetails = (attendanceId: number) => {
    setSelectedAttendanceId(attendanceId);
    setDetailDialogVisible(true);
  };

  const handleRemove = (attendanceId: number) => {
    confirmDialog({
      message:
        "¿Estás seguro de que deseas eliminar este registro de asistencia?",
      header: "Confirmación",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          await removeAttendances({
            variables: {
              ids: [attendanceId],
            },
          });

          toast.current?.show({
            severity: "success",
            summary: "Éxito",
            detail: "Registro eliminado correctamente",
            life: 3000,
          });

          handleRefresh();
        } catch (err: any) {
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: err.message || "Error al eliminar el registro",
            life: 3000,
          });
        }
      },
    });
  };

  const handleRestore = (attendanceId: number) => {
    confirmDialog({
      message:
        "¿Estás seguro de que deseas restaurar este registro de asistencia?",
      header: "Confirmación",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          await restoreAttendances({
            variables: {
              ids: [attendanceId],
            },
          });

          toast.current?.show({
            severity: "success",
            summary: "Éxito",
            detail: "Registro restaurado correctamente",
            life: 3000,
          });

          handleRefresh();
        } catch (err: any) {
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: err.message || "Error al restaurar el registro",
            life: 3000,
          });
        }
      },
    });
  };

  const actionBodyTemplate = (rowData: any) => {
    return (
      <div className="actions-column">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text"
          tooltip="Editar registro"
          tooltipOptions={{ position: "top" }}
          onClick={() => handleEdit(rowData.id)}
          disabled={rowData.isPaid}
        />
        {rowData.deletedAt ? (
          <Button
            icon="pi pi-undo"
            className="p-button-rounded p-button-text p-button-success"
            tooltip="Restaurar registro"
            tooltipOptions={{ position: "top" }}
            onClick={() => handleRestore(rowData.id)}
          />
        ) : (
          <Button
            icon="pi pi-trash"
            className="p-button-rounded p-button-text p-button-danger"
            tooltip="Eliminar registro"
            tooltipOptions={{ position: "top" }}
            onClick={() => handleRemove(rowData.id)}
            disabled={rowData.isPaid}
          />
        )}
        <Button
          icon="pi pi-eye"
          className="p-button-rounded p-button-text p-button-info"
          tooltip="Ver detalles"
          tooltipOptions={{ position: "top" }}
          onClick={() => handleViewDetails(rowData.id)}
        />
      </div>
    );
  };

  const columns = [
    {
      field: "worker.user.name",
      header: "Trabajador",
      body: workerInfoBodyTemplate,
      sortable: true,
      filter: true,
      width: "300px",
    },
    {
      field: "attendanceDate",
      header: "Fecha",
      body: dateBodyTemplate,
      sortable: true,
      filter: true,
      width: "120px",
    },
    {
      field: "checkInTime",
      header: "Entrada",
      body: (rowData: any) => timeBodyTemplate(rowData, "checkInTime"),
      sortable: true,
      filter: true,
      width: "100px",
    },
    {
      field: "checkOutTime",
      header: "Salida",
      body: (rowData: any) => timeBodyTemplate(rowData, "checkOutTime"),
      sortable: true,
      filter: true,
      width: "100px",
    },
    {
      field: "status",
      header: "Estado",
      body: statusBodyTemplate,
      sortable: true,
      filter: true,
      width: "130px",
    },
    {
      field: "hoursWorked",
      header: "Horas",
      body: hoursBodyTemplate,
      sortable: true,
      filter: true,
      width: "80px",
    },
    {
      field: "isPaid",
      header: "Pagado",
      body: paidBodyTemplate,
      sortable: true,
      filter: true,
      width: "80px",
    },
    {
      field: "isHoliday",
      header: "Festivo",
      body: holidayBodyTemplate,
      sortable: true,
      filter: true,
      width: "90px",
      visible: false,
    },
    {
      field: "business.name",
      header: "Ubicación",
      body: locationBodyTemplate,
      sortable: true,
      filter: true,
      width: "180px",
    },
    {
      field: "workSchedule.startDate",
      header: "Horario",
      body: workScheduleBodyTemplate,
      sortable: true,
      filter: true,
      width: "150px",
      visible: false,
    },
  ];

  const addButton = (
    <Button
      icon="pi pi-plus"
      label="Nuevo Registro"
      onClick={() => setCreateDialogVisible(true)}
      severity="success"
    />
  );

  const header = (
    <div className="flex justify-content-between align-items-center">
      <div className="flex align-items-center gap-2">
        <i className="pi pi-user-clock text-primary text-2xl"></i>
      </div>
      {addButton}
    </div>
  );

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
          "user.name",
          "user.lastName",
          "tempFirstName",
          "worker.tempLastName",
          "user.email",
          "worker.tempEmail",
          "status",
          "business.name",
          "office.name",
        ]}
        emptyMessage="No se encontraron registros de asistencia"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
        onRefresh={handleRefresh}
        onFetchData={handleFetchData}
        initialPageSize={10}
        header={header}
        showDeleteFilter={true}
        initialSorts={defaultSorts}
      >
        <Column
          body={actionBodyTemplate}
          header="Acciones"
          headerStyle={{ width: "12rem" }}
          bodyStyle={{ textAlign: "center" }}
          exportable={false}
        />
      </GenericDataTable>

      {selectedAttendanceId && (
        <>
          <AttendanceEditForm
            attendanceId={selectedAttendanceId}
            visible={editDialogVisible}
            onHide={() => {
              setEditDialogVisible(false);
              setSelectedAttendanceId(null);
            }}
            onSuccess={handleEditSuccess}
          />

          <AttendanceDetailForm
            attendanceId={selectedAttendanceId}
            visible={detailDialogVisible}
            onHide={() => {
              setDetailDialogVisible(false);
              setSelectedAttendanceId(null);
            }}
          />
        </>
      )}

      {
        <AttendanceCreateForm
          visible={createDialogVisible}
          onHide={() => setCreateDialogVisible(false)}
          onSuccess={handleCreateSuccess}
        />
      }
    </>
  );
}

export default AttendanceTable;
