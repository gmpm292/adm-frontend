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
import { Tag } from "primereact/tag";
import { Message } from "primereact/message";
import { FormField, EmptyState } from "../../../../components/ui";
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
    <>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        onClick={onHide}
        severity="secondary"
        disabled={mutationLoading}
      />
      <Button
        label={mutationLoading ? "Guardando..." : "Guardar"}
        icon="pi pi-check"
        onClick={handleSubmit}
        loading={mutationLoading}
        disabled={queryLoading}
      />
    </>
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
        className="w-full md:w-8 lg:w-6"
        footer={footer}
        onHide={onHide}
        modal
      >
        {queryLoading ? (
          <div className="flex justify-content-center align-items-center py-5">
            <i className="pi pi-spin pi-spinner text-4xl text-color-secondary"></i>
          </div>
        ) : attendance ? (
          <div className="formgrid grid">
            {/* Información unificada del trabajador, fecha y ubicación */}
            <div className="col-12 mb-4">
              <div className="border-round border-1 surface-border p-3 surface-50">
                <div className="grid">
                  {/* Información del trabajador y fecha */}
                  <div className="col-12 md:col-6">
                    <div className="flex align-items-center gap-3 mb-3">
                      <div className="flex-shrink-0">
                        <div className="w-3rem h-3rem border-circle bg-primary-100 flex align-items-center justify-content-center">
                          <i className="pi pi-user text-primary text-xl"></i>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-lg font-semibold">
                          {workerName}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <Tag severity="info" value={attendance.worker?.workerType || "N/A"} />
                          <Tag
                            severity="success"
                            icon="pi pi-calendar"
                            value={new Date(
                              attendance.attendanceDate,
                            ).toLocaleDateString("es-ES", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          />
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
                          <div className="col-12 md:col-6">
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
                          <div className="col-12 md:col-6">
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
                          <div className="col-12 md:col-6">
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
                          <div className="col-12 md:col-6">
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
                      <Tag
                        severity={
                          formData.status === "present"
                            ? "success"
                            : formData.status === "absent"
                              ? "danger"
                              : formData.status.includes("late") ||
                                  formData.status === "early_departure"
                                ? "warning"
                                : "info"
                        }
                        value={
                          statusOptions.find(
                            (opt) => opt.value === formData.status,
                          )?.label || formData.status
                        }
                      />
                    </div>
                    <div className="flex align-items-center gap-2">
                      <span className="text-xs font-semibold">Pagado:</span>
                      <Tag
                        severity={formData.isPaid ? "success" : "warning"}
                        value={formData.isPaid ? "Sí" : "No"}
                      />
                    </div>
                    {formData.isHoliday && (
                      <div className="flex align-items-center gap-2">
                        <span className="text-xs font-semibold">Festivo:</span>
                        <Tag severity="info" value="Sí" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Campos editables */}
            <div className="col-12 md:col-6">
              <FormField
                label="Hora de Entrada (HH:mm)"
                htmlFor="checkInTime"
                hint="Formato 24h (ej: 08:30, 14:00)"
                error={errors.checkInTime}
              >
                <InputText
                  invalid={Boolean(errors.checkInTime)}
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
              </FormField>
            </div>

            <div className="col-12 md:col-6">
              <FormField
                label="Hora de Salida (HH:mm)"
                htmlFor="checkOutTime"
                error={errors.checkOutTime}
              >
                <InputText
                  invalid={Boolean(errors.checkOutTime)}
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
              </FormField>
            </div>

            <div className="col-12 md:col-6">
              <FormField label="Estado" htmlFor="status">
                <Dropdown
                  id="status"
                  value={formData.status}
                  options={statusOptions}
                  onChange={(e) => handleInputChange("status", e.value)}
                  optionLabel="label"
                  className="w-full"
                  disabled={mutationLoading || attendance.isPaid}
                />
              </FormField>
            </div>

            <div className="col-12 md:col-6">
              <FormField
                label="Horas Trabajadas"
                htmlFor="hoursWorked"
                hint={
                  formData.checkInTime && formData.checkOutTime
                    ? "Calculado automáticamente"
                    : "Ingrese manualmente"
                }
              >
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
              </FormField>
            </div>

            <div className="col-12 md:col-6">
              <div className="flex align-items-center mb-4">
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

            <div className="col-12 md:col-6">
              <div className="flex align-items-center mb-4">
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
              <FormField label="Notas" htmlFor="notes">
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
              </FormField>
            </div>

            {attendance.isPaid && (
              <div className="col-12 mb-3">
                <Message
                  severity="warn"
                  className="w-full"
                  text="Este registro ya ha sido marcado como pagado. Algunos campos están bloqueados para edición."
                />
              </div>
            )}

            {/* Indicador de cambios */}
            {dirtyFields.size > 0 && (
              <div className="col-12">
                <Message
                  severity="info"
                  className="w-full"
                  text={`${dirtyFields.size} campo${dirtyFields.size !== 1 ? "s" : ""} modificado${dirtyFields.size !== 1 ? "s" : ""}`}
                />
              </div>
            )}
          </div>
        ) : (
          <EmptyState icon="pi pi-exclamation-triangle">
            <p>No se encontró el registro de asistencia</p>
          </EmptyState>
        )}
      </Dialog>
    </>
  );
};
