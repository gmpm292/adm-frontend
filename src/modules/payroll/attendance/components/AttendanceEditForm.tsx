import React, { useState, useRef, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { Checkbox } from "primereact/checkbox";
import { useQuery, useMutation } from "@apollo/client";
import { Toast } from "primereact/toast";
import { GET_ATTENDANCE_BY_ID, UPDATE_ATTENDANCE } from "../graphql/queries";
import { deepClean } from "../../../../utils/deepClean";

interface AttendanceEditFormProps {
  attendanceId: number | null;
  visible: boolean;
  onHide: () => void;
  onSuccess: () => void;
}

// Función para obtener el nombre completo del trabajador
const getWorkerFullName = (worker: any): string => {
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

// Función para validar formato de hora (HH:mm)
const isValidTimeFormat = (time: string | null): boolean => {
  if (!time) return true; // Vacío es válido (opcional)
  const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
  return timeRegex.test(time);
};

// Función para calcular horas trabajadas
const calculateHoursWorked = (
  checkInTime: string | null,
  checkOutTime: string | null,
): number => {
  if (!checkInTime || !checkOutTime) return 0;

  try {
    const [inHours, inMinutes] = checkInTime.split(":").map(Number);
    const [outHours, outMinutes] = checkOutTime.split(":").map(Number);

    let totalHours = 0;

    if (
      outHours > inHours ||
      (outHours === inHours && outMinutes > inMinutes)
    ) {
      totalHours = outHours - inHours + (outMinutes - inMinutes) / 60;
    } else {
      // Si la hora de salida es del día siguiente
      totalHours = 24 - inHours + outHours + (outMinutes - inMinutes) / 60;
    }

    return parseFloat(totalHours.toFixed(2));
  } catch (error) {
    console.error("Error calculando horas:", error);
    return 0;
  }
};

export const AttendanceEditForm: React.FC<AttendanceEditFormProps> = ({
  attendanceId,
  visible,
  onHide,
  onSuccess,
}) => {
  // Estado inicial del formulario
  const [formData, setFormData] = useState({
    checkInTime: null as string | null,
    checkOutTime: null as string | null,
    status: "present" as string,
    hoursWorked: 0,
    isPaid: false,
    isHoliday: false,
    notes: null as string | null,
  });

  // Estado para controlar qué campos han sido modificados
  const [dirtyFields, setDirtyFields] = useState<Set<string>>(new Set());
  const [originalData, setOriginalData] = useState<any>(null);

  const { loading: queryLoading, data } = useQuery(GET_ATTENDANCE_BY_ID, {
    variables: { id: attendanceId! },
    skip: !attendanceId,
    fetchPolicy: "network-only",
  });

  const [updateAttendance, { loading: mutationLoading }] =
    useMutation(UPDATE_ATTENDANCE);
  const toast = useRef<Toast>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Opciones para el estado de asistencia
  const statusOptions = [
    { label: "Presente", value: "present" },
    { label: "Ausente", value: "absent" },
    { label: "Tardío", value: "late" },
    { label: "Salida Temprana", value: "early_departure" },
    { label: "Vacaciones", value: "vacation" },
    { label: "Enfermedad", value: "sick_leave" },
  ];

  // Cargar datos cuando cambie la query
  useEffect(() => {
    if (data?.attendance) {
      const attendance = data.attendance;

      // Guardar datos originales
      setOriginalData({
        checkInTime: attendance.checkInTime,
        checkOutTime: attendance.checkOutTime,
        status: attendance.status,
        hoursWorked: attendance.hoursWorked || 0,
        isPaid: attendance.isPaid || false,
        isHoliday: attendance.isHoliday || false,
        notes: attendance.notes,
      });

      // Establecer datos del formulario
      setFormData({
        checkInTime: attendance.checkInTime,
        checkOutTime: attendance.checkOutTime,
        status: attendance.status,
        hoursWorked: attendance.hoursWorked || 0,
        isPaid: attendance.isPaid || false,
        isHoliday: attendance.isHoliday || false,
        notes: attendance.notes,
      });

      // Limpiar campos modificados
      setDirtyFields(new Set());
    }
  }, [data]);

  // Recalcular horas cuando cambien entrada/salida
  useEffect(() => {
    if (formData.checkInTime && formData.checkOutTime) {
      const calculatedHours = calculateHoursWorked(
        formData.checkInTime,
        formData.checkOutTime,
      );
      if (calculatedHours !== formData.hoursWorked) {
        setFormData((prev) => ({ ...prev, hoursWorked: calculatedHours }));
      }
    }
  }, [formData.checkInTime, formData.checkOutTime]);

  // Manejar cambios en los campos
  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Marcar el campo como modificado
    setDirtyFields((prev) => new Set([...prev, field]));

    // Limpiar error del campo si existe
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Si cambia entrada o salida, validar formato inmediatamente
    if ((field === "checkInTime" || field === "checkOutTime") && value) {
      if (!isValidTimeFormat(value)) {
        setErrors((prev) => ({
          ...prev,
          [field]: "Formato inválido. Use HH:mm (ej: 08:30, 14:00)",
        }));
      }
    }
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar formato de horas
    if (formData.checkInTime && !isValidTimeFormat(formData.checkInTime)) {
      newErrors.checkInTime = "Formato inválido. Use HH:mm (ej: 08:30, 14:00)";
    }

    if (formData.checkOutTime && !isValidTimeFormat(formData.checkOutTime)) {
      newErrors.checkOutTime = "Formato inválido. Use HH:mm (ej: 17:30, 20:00)";
    }

    // Validar que salida sea posterior a entrada si ambos están presentes
    if (
      formData.checkInTime &&
      formData.checkOutTime &&
      isValidTimeFormat(formData.checkInTime) &&
      isValidTimeFormat(formData.checkOutTime)
    ) {
      const [inHours, inMinutes] = formData.checkInTime.split(":").map(Number);
      const [outHours, outMinutes] = formData.checkOutTime
        .split(":")
        .map(Number);

      const checkInDate = new Date();
      checkInDate.setHours(inHours, inMinutes, 0, 0);

      const checkOutDate = new Date();
      checkOutDate.setHours(outHours, outMinutes, 0, 0);

      if (checkOutDate <= checkInDate) {
        newErrors.checkOutTime =
          "La hora de salida debe ser posterior a la de entrada";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Preparar datos para enviar al backend (solo campos modificados)
  const prepareUpdateData = () => {
    if (!originalData) return { id: attendanceId! };

    const updateData: any = { id: attendanceId! };

    // Solo incluir campos que han sido modificados
    dirtyFields.forEach((field) => {
      if (field in formData && field !== "hoursWorked") {
        // Excluir horas trabajadas
        updateData[field] = (formData as any)[field];
      }
    });

    return deepClean(updateData);
  };

  // Manejar envío del formulario
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.current?.show({
        severity: "error",
        summary: "Error de validación",
        detail: "Por favor, corrija los errores en el formulario",
        life: 3000,
      });
      return;
    }

    try {
      const updateData = prepareUpdateData();

      // Si solo hay id, no hay nada que actualizar
      if (Object.keys(updateData).length <= 1) {
        toast.current?.show({
          severity: "info",
          summary: "Sin cambios",
          detail: "No se detectaron cambios para guardar",
          life: 3000,
        });
        onHide();
        return;
      }

      await updateAttendance({
        variables: {
          updateAttendanceInput: updateData,
        },
      });

      toast.current?.show({
        severity: "success",
        summary: "Éxito",
        detail: "Registro de asistencia actualizado correctamente",
        life: 3000,
      });

      onSuccess();
      onHide();
    } catch (err: any) {
      console.error("Error updating attendance:", err);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: err.message || "Error al actualizar el registro",
        life: 3000,
      });
    }
  };

  const footer = (
    <div className="flex justify-content-end gap-2">
      <Button
        label="Cancelar"
        icon="pi pi-times"
        onClick={onHide}
        className="p-button-text"
        disabled={mutationLoading}
      />
      <Button
        label={mutationLoading ? "Guardando..." : "Guardar"}
        icon="pi pi-check"
        onClick={handleSubmit}
        loading={mutationLoading}
        disabled={queryLoading}
      />
    </div>
  );

  if (!attendanceId) return null;

  const attendance = data?.attendance;
  const workerName = attendance ? getWorkerFullName(attendance.worker) : "";

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header="Editar Registro de Asistencia"
        visible={visible}
        style={{ width: "50vw", minWidth: "300px" }}
        footer={footer}
        onHide={onHide}
        modal
      >
        {queryLoading ? (
          <div className="flex justify-content-center align-items-center py-5">
            <i className="pi pi-spin pi-spinner text-4xl"></i>
          </div>
        ) : attendance ? (
          <div className="p-fluid grid">
            {/* Información unificada del trabajador, fecha y ubicación */}
            <div className="col-12 mb-4">
              <div className="border-round border-1 surface-border p-3 bg-blue-50">
                <div className="grid">
                  {/* Información del trabajador y fecha */}
                  <div className="col-12 md:col-6">
                    <div className="flex align-items-center gap-3 mb-3">
                      <div className="flex-shrink-0">
                        <div className="w-3rem h-3rem border-circle bg-blue-100 flex align-items-center justify-content-center">
                          <i className="pi pi-user text-blue-500 text-xl"></i>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-lg font-semibold">
                          {workerName}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {attendance.worker?.workerType || "N/A"}
                          </span>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            <i className="pi pi-calendar mr-1"></i>
                            {new Date(
                              attendance.attendanceDate,
                            ).toLocaleDateString("es-ES", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        {attendance.worker?.user?.email && (
                          <div className="text-xs text-color-secondary mt-1">
                            <i className="pi pi-envelope mr-1"></i>
                            {attendance.worker.user.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ubicación del registro */}
                  <div className="col-12 md:col-6">
                    <div className="border-left-1 surface-border pl-3 md:pl-4">
                      <div className="text-sm font-semibold mb-2">
                        <i className="pi pi-map-marker mr-2 text-color-secondary"></i>
                        Ubicación
                      </div>
                      <div className="grid">
                        {attendance.business?.name && (
                          <div className="col-6">
                            <div className="text-xs text-color-secondary flex align-items-center gap-1">
                              <i className="pi pi-building text-xs"></i>
                              Business:
                            </div>
                            <div className="text-sm font-medium">
                              {attendance.business.name}
                            </div>
                          </div>
                        )}
                        {attendance.office?.name && (
                          <div className="col-6">
                            <div className="text-xs text-color-secondary flex align-items-center gap-1">
                              <i className="pi pi-map text-xs"></i>
                              Oficina:
                            </div>
                            <div className="text-sm font-medium">
                              {attendance.office.name}
                            </div>
                          </div>
                        )}
                        {attendance.department?.name && (
                          <div className="col-6">
                            <div className="text-xs text-color-secondary flex align-items-center gap-1">
                              <i className="pi pi-sitemap text-xs"></i>
                              Depto.:
                            </div>
                            <div className="text-sm font-medium">
                              {attendance.department.name}
                            </div>
                          </div>
                        )}
                        {attendance.team?.name && (
                          <div className="col-6">
                            <div className="text-xs text-color-secondary flex align-items-center gap-1">
                              <i className="pi pi-users text-xs"></i>
                              Equipo:
                            </div>
                            <div className="text-sm font-medium">
                              {attendance.team.name}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estado del registro */}
                <div className="mt-3 pt-3 border-top-1 surface-border">
                  <div className="flex flex-wrap gap-3">
                    <div className="flex align-items-center gap-2">
                      <span className="text-xs font-semibold">Estado:</span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          formData.status === "present"
                            ? "bg-green-100 text-green-800"
                            : formData.status === "absent"
                              ? "bg-red-100 text-red-800"
                              : formData.status.includes("late") ||
                                  formData.status === "early_departure"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {statusOptions.find(
                          (opt) => opt.value === formData.status,
                        )?.label || formData.status}
                      </span>
                    </div>
                    <div className="flex align-items-center gap-2">
                      <span className="text-xs font-semibold">Pagado:</span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          formData.isPaid
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {formData.isPaid ? "Sí" : "No"}
                      </span>
                    </div>
                    {formData.isHoliday && (
                      <div className="flex align-items-center gap-2">
                        <span className="text-xs font-semibold">Festivo:</span>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          Sí
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Campos editables */}
            <div className="col-6">
              <div className="field">
                <label htmlFor="checkInTime" className="block mb-2">
                  Hora de Entrada (HH:mm)
                  {errors.checkInTime && (
                    <small className="p-error ml-2">{errors.checkInTime}</small>
                  )}
                </label>
                <InputText
                  id="checkInTime"
                  value={formData.checkInTime || ""}
                  onChange={(e) =>
                    handleInputChange("checkInTime", e.target.value || null)
                  }
                  placeholder="08:30"
                  className="w-full"
                  disabled={mutationLoading || attendance.isPaid}
                  maxLength={5}
                />
                <small className="text-color-secondary">
                  Formato 24h (ej: 08:30, 14:00)
                </small>
              </div>
            </div>

            <div className="col-6">
              <div className="field">
                <label htmlFor="checkOutTime" className="block mb-2">
                  Hora de Salida (HH:mm)
                  {errors.checkOutTime && (
                    <small className="p-error ml-2">
                      {errors.checkOutTime}
                    </small>
                  )}
                </label>
                <InputText
                  id="checkOutTime"
                  value={formData.checkOutTime || ""}
                  onChange={(e) =>
                    handleInputChange("checkOutTime", e.target.value || null)
                  }
                  placeholder="17:30"
                  className="w-full"
                  disabled={mutationLoading || attendance.isPaid}
                  maxLength={5}
                />
              </div>
            </div>

            <div className="col-6">
              <div className="field">
                <label htmlFor="status" className="block mb-2">
                  Estado
                </label>
                <Dropdown
                  id="status"
                  value={formData.status}
                  options={statusOptions}
                  onChange={(e) => handleInputChange("status", e.value)}
                  optionLabel="label"
                  className="w-full"
                  disabled={mutationLoading || attendance.isPaid}
                />
              </div>
            </div>

            <div className="col-6">
              <div className="field">
                <label htmlFor="hoursWorked" className="block mb-2">
                  Horas Trabajadas
                </label>
                <InputNumber
                  id="hoursWorked"
                  value={formData.hoursWorked}
                  mode="decimal"
                  min={0}
                  max={24}
                  className="w-full"
                  readOnly
                  disabled={mutationLoading || attendance.isPaid}
                />
                <small className="text-color-secondary">
                  {formData.checkInTime && formData.checkOutTime
                    ? "Calculado automáticamente"
                    : "Ingrese manualmente"}
                </small>
              </div>
            </div>

            <div className="col-6">
              <div className="field flex align-items-center">
                <Checkbox
                  id="isHoliday"
                  checked={formData.isHoliday}
                  onChange={(e) => handleInputChange("isHoliday", e.checked)}
                  disabled={mutationLoading || attendance.isPaid}
                />
                <label htmlFor="isHoliday" className="ml-2">
                  Día festivo
                </label>
              </div>
            </div>

            <div className="col-6">
              <div className="field flex align-items-center">
                <Checkbox
                  id="isPaid"
                  checked={formData.isPaid}
                  onChange={(e) => handleInputChange("isPaid", e.checked)}
                  disabled={mutationLoading}
                />
                <label htmlFor="isPaid" className="ml-2">
                  Pagado
                </label>
              </div>
            </div>

            <div className="col-12">
              <div className="field">
                <label htmlFor="notes" className="block mb-2">
                  Notas
                </label>
                <InputTextarea
                  id="notes"
                  value={formData.notes || ""}
                  onChange={(e) =>
                    handleInputChange("notes", e.target.value || null)
                  }
                  rows={3}
                  className="w-full"
                  disabled={mutationLoading || attendance.isPaid}
                  placeholder="Observaciones adicionales..."
                />
              </div>
            </div>

            {attendance.isPaid && (
              <div className="col-12 mt-3">
                <div className="p-3 border-round border-1 surface-border bg-yellow-50">
                  <div className="flex align-items-center">
                    <i className="pi pi-info-circle text-yellow-500 mr-2"></i>
                    <span className="text-sm">
                      Este registro ya ha sido marcado como pagado. Algunos
                      campos están bloqueados para edición.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Indicador de cambios */}
            {dirtyFields.size > 0 && (
              <div className="col-12 mt-3">
                <div className="p-2 border-round border-1 surface-border bg-blue-50">
                  <div className="flex align-items-center text-sm">
                    <i className="pi pi-info-circle text-blue-500 mr-2"></i>
                    <span>
                      {dirtyFields.size} campo
                      {dirtyFields.size !== 1 ? "s" : ""} modificado
                      {dirtyFields.size !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-5">
            <i className="pi pi-exclamation-triangle text-4xl text-color-secondary"></i>
            <p className="mt-3">No se encontró el registro de asistencia</p>
          </div>
        )}
      </Dialog>
    </>
  );
};
