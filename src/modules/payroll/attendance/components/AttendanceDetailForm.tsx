import React, { useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { useQuery } from "@apollo/client";
import { GET_ATTENDANCE_BY_ID } from "../graphql/queries";
import { ProgressSpinner } from "primereact/progressspinner";
import { Tag } from "primereact/tag";

interface AttendanceDetailFormProps {
  attendanceId: number | null;
  visible: boolean;
  onHide: () => void;
}

// Función para obtener el nombre completo del trabajador
const getWorkerFullName = (worker: any): string => {
  if (!worker) return "Sin nombre";

  if (worker.user && worker.user.name) {
    const fullName =
      `${worker.user.name || ""} ${worker.user.lastName || ""}`.trim();
    if (fullName) return fullName;
  }

  if (worker.tempFirstName || worker.tempLastName) {
    const tempFullName =
      `${worker.tempFirstName || ""} ${worker.tempLastName || ""}`.trim();
    if (tempFullName) return tempFullName;
  }

  if (worker.user && worker.user.email) {
    return worker.user.email;
  }

  if (worker.tempEmail) {
    return worker.tempEmail;
  }

  if (worker.id) {
    return `Trabajador #${worker.id}`;
  }

  return "Sin nombre";
};

const getStatusSeverity = (status: string) => {
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
    case "sick_leave":
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
    case "sick_leave":
      return "Enfermedad";
    default:
      return status;
  }
};

export const AttendanceDetailForm: React.FC<AttendanceDetailFormProps> = ({
  attendanceId,
  visible,
  onHide,
}) => {
  const { data, loading } = useQuery(GET_ATTENDANCE_BY_ID, {
    variables: { id: attendanceId! },
    skip: !attendanceId,
    fetchPolicy: "network-only",
  });

  if (!attendanceId) return null;

  const attendance = data?.attendance;
  const workerName = attendance ? getWorkerFullName(attendance.worker) : "";

  return (
    <Dialog
      header="Detalles del Registro de Asistencia"
      visible={visible}
      style={{ width: "700px" }}
      onHide={onHide}
      modal
      className="attendance-detail-form"
    >
      {loading ? (
        <div className="flex justify-center align-items-center py-8">
          <ProgressSpinner />
        </div>
      ) : attendance ? (
        <div className="space-y-4">
          {/* Encabezado con información principal */}
          <div className="border-round border-1 surface-border p-4 bg-blue-50">
            <div className="flex flex-column md:flex-row md:align-items-center gap-4">
              {/* Avatar y nombre */}
              <div className="flex align-items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="w-3rem h-3rem border-circle bg-blue-100 flex align-items-center justify-content-center">
                    <i className="pi pi-user text-blue-500 text-xl"></i>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-lg font-semibold">{workerName}</div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {attendance.worker?.workerType || "N/A"}
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      <i className="pi pi-calendar mr-1"></i>
                      {new Date(attendance.attendanceDate).toLocaleDateString(
                        "es-ES",
                        {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Estado y horas */}
              <div className="md:ml-auto">
                <div className="flex flex-wrap gap-3">
                  <div className="flex flex-column">
                    <span className="text-xs text-color-secondary">Estado</span>
                    <Tag
                      value={getStatusLabel(attendance.status)}
                      severity={getStatusSeverity(attendance.status)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex flex-column">
                    <span className="text-xs text-color-secondary">Horas</span>
                    <span className="text-lg font-bold mt-1">
                      {attendance.hoursWorked?.toFixed(1)}h
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grid de información en tarjetas */}
          <div className="grid">
            {/* Tarjeta 1: Horarios */}
            <div className="col-12 md:col-6">
              <div className="border-round border-1 surface-border p-3 h-full">
                <div className="flex align-items-center gap-2 mb-3">
                  <i className="pi pi-clock text-blue-500"></i>
                  <span className="font-semibold">Horarios</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-color-secondary">Entrada</div>
                    <div
                      className={`text-lg font-medium ${attendance.checkInTime ? "text-900" : "text-color-secondary"}`}
                    >
                      {attendance.checkInTime || "--:--"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-color-secondary">Salida</div>
                    <div
                      className={`text-lg font-medium ${attendance.checkOutTime ? "text-900" : "text-color-secondary"}`}
                    >
                      {attendance.checkOutTime || "--:--"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tarjeta 2: Ubicación */}
            <div className="col-12 md:col-6">
              <div className="border-round border-1 surface-border p-3 h-full">
                <div className="flex align-items-center gap-2 mb-3">
                  <i className="pi pi-map-marker text-green-500"></i>
                  <span className="font-semibold">Ubicación</span>
                </div>
                <div className="space-y-2">
                  {attendance.business?.name && (
                    <div className="flex align-items-center gap-2">
                      <i className="pi pi-building text-xs text-color-secondary"></i>
                      <span className="text-sm">
                        {attendance.business.name}
                      </span>
                    </div>
                  )}
                  {attendance.office?.name && (
                    <div className="flex align-items-center gap-2">
                      <i className="pi pi-map text-xs text-color-secondary"></i>
                      <span className="text-sm">{attendance.office.name}</span>
                    </div>
                  )}
                  {attendance.department?.name && (
                    <div className="flex align-items-center gap-2">
                      <i className="pi pi-sitemap text-xs text-color-secondary"></i>
                      <span className="text-sm">
                        {attendance.department.name}
                      </span>
                    </div>
                  )}
                  {attendance.team?.name && (
                    <div className="flex align-items-center gap-2">
                      <i className="pi pi-users text-xs text-color-secondary"></i>
                      <span className="text-sm">{attendance.team.name}</span>
                    </div>
                  )}
                  {!attendance.business?.name &&
                    !attendance.office?.name &&
                    !attendance.department?.name &&
                    !attendance.team?.name && (
                      <span className="text-sm text-color-secondary">
                        Sin ubicación registrada
                      </span>
                    )}
                </div>
              </div>
            </div>

            {/* Tarjeta 3: Información adicional */}
            <div className="col-12">
              <div className="border-round border-1 surface-border p-3">
                <div className="flex align-items-center gap-2 mb-3">
                  <i className="pi pi-info-circle text-purple-500"></i>
                  <span className="font-semibold">Información Adicional</span>
                </div>
                <div className="grid">
                  <div className="col-6 md:col-3">
                    <div className="flex flex-column">
                      <span className="text-xs text-color-secondary">
                        Estado de Pago
                      </span>
                      <div className="flex align-items-center gap-2 mt-1">
                        <i
                          className={`pi ${attendance.isPaid ? "pi-check-circle text-green-500" : "pi-times-circle text-red-500"}`}
                        ></i>
                        <span className="font-medium">
                          {attendance.isPaid ? "Pagado" : "No pagado"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-6 md:col-3">
                    <div className="flex flex-column">
                      <span className="text-xs text-color-secondary">
                        Día Festivo
                      </span>
                      <div className="flex align-items-center gap-2 mt-1">
                        <i
                          className={`pi ${attendance.isHoliday ? "pi-star-fill text-yellow-500" : "pi-star text-color-secondary"}`}
                        ></i>
                        <span className="font-medium">
                          {attendance.isHoliday ? "Sí" : "No"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 md:col-6">
                    <div className="flex flex-column">
                      <span className="text-xs text-color-secondary">
                        Registrado por
                      </span>
                      <div className="flex align-items-center gap-2 mt-1">
                        <i className="pi pi-user-edit text-color-secondary"></i>
                        <span className="font-medium">
                          {attendance.createdBy?.name || "System"}{" "}
                          {attendance.createdBy?.lastName || ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tarjeta 4: Notas (si existen) */}
            {attendance.notes && (
              <div className="col-12">
                <div className="border-round border-1 surface-border p-3">
                  <div className="flex align-items-center gap-2 mb-3">
                    <i className="pi pi-file-edit text-orange-500"></i>
                    <span className="font-semibold">Notas</span>
                  </div>
                  <div className="p-3 border-round border-1 surface-border bg-gray-50">
                    <p className="text-sm m-0">{attendance.notes}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tarjeta 5: Metadatos */}
            <div className="col-12">
              <div className="border-round border-1 surface-border p-3 bg-gray-50">
                <div className="text-xs text-color-secondary space-y-1">
                  <div className="flex align-items-center gap-2">
                    <i className="pi pi-calendar-plus text-xs"></i>
                    <span>
                      Creado:{" "}
                      {new Date(attendance.createdAt).toLocaleString("es-ES")}
                    </span>
                  </div>
                  <div className="flex align-items-center gap-2">
                    <i className="pi pi-calendar-clock text-xs"></i>
                    <span>
                      Actualizado:{" "}
                      {new Date(attendance.updatedAt).toLocaleString("es-ES")}
                    </span>
                  </div>
                  {attendance.recordedAt && (
                    <div className="flex align-items-center gap-2">
                      <i className="pi pi-history text-xs"></i>
                      <span>
                        Registrado:{" "}
                        {new Date(attendance.recordedAt).toLocaleString(
                          "es-ES",
                        )}
                      </span>
                    </div>
                  )}
                  {attendance.deletedAt && (
                    <div className="flex align-items-center gap-2 text-red-500">
                      <i className="pi pi-trash text-xs"></i>
                      <span>
                        Eliminado:{" "}
                        {new Date(attendance.deletedAt).toLocaleString("es-ES")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-4rem h-4rem border-circle bg-red-100 flex align-items-center justify-content-center mx-auto mb-3">
            <i className="pi pi-exclamation-triangle text-red-500 text-2xl"></i>
          </div>
          <p className="text-color-secondary m-0">
            No se encontró información del registro de asistencia
          </p>
        </div>
      )}
    </Dialog>
  );
};
