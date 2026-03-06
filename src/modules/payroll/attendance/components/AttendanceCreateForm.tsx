import React, { useState, useRef, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { Checkbox } from "primereact/checkbox";
import { useMutation } from "@apollo/client";
import { Toast } from "primereact/toast";
import { CREATE_ATTENDANCE } from "../graphql/queries";
import { WorkerSelector } from "../../worker/components/WorkerSelector";

interface AttendanceCreateFormProps {
  visible: boolean;
  onHide: () => void;
  onSuccess: () => void;
}

interface Worker {
  id: number;
  workerType: string;
  baseSalary?: number;
  tempFirstName?: string;
  tempLastName?: string;
  tempEmail?: string;
  tempPhone?: string;
  user?: {
    id: number;
    name?: string;
    lastName?: string;
    email?: string;
    mobile?: string;
    enabled?: boolean;
  };
  business?: {
    id: number;
    name: string;
  };
  office?: {
    id: number;
    name: string;
  };
  department?: {
    id: number;
    name: string;
  };
  team?: {
    id: number;
    name: string;
  };
}

interface FormData {
  workerId: number | null;
  attendanceDate: Date | null;
  checkInTime: string;
  checkOutTime: string;
  status: string;
  hoursWorked: number;
  isHoliday: boolean;
  notes: string;
  businessId: number | null;
  officeId: number | null;
  departmentId: number | null;
  teamId: number | null;
}

const calculateHoursWorked = (
  checkInTime: string,
  checkOutTime: string,
): number => {
  if (!checkInTime || !checkOutTime) return 0;

  try {
    const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(checkInTime) || !timeRegex.test(checkOutTime)) {
      return 0;
    }

    const [inHours, inMinutes] = checkInTime.split(":").map(Number);
    const [outHours, outMinutes] = checkOutTime.split(":").map(Number);

    let totalHours = 0;

    if (
      outHours > inHours ||
      (outHours === inHours && outMinutes > inMinutes)
    ) {
      totalHours = outHours - inHours + (outMinutes - inMinutes) / 60;
    } else {
      totalHours = 24 - inHours + outHours + (outMinutes - inMinutes) / 60;
    }

    return parseFloat(totalHours.toFixed(2));
  } catch (error) {
    console.error("Error calculando horas:", error);
    return 0;
  }
};

export const AttendanceCreateForm: React.FC<AttendanceCreateFormProps> = ({
  visible,
  onHide,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FormData>({
    workerId: null,
    attendanceDate: new Date(),
    checkInTime: "",
    checkOutTime: "",
    status: "present",
    hoursWorked: 0,
    isHoliday: false,
    notes: "",
    businessId: null,
    officeId: null,
    departmentId: null,
    teamId: null,
  });

  const [createAttendance, { loading }] = useMutation(CREATE_ATTENDANCE);
  const toast = useRef<Toast>(null);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
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

  // Resetear formulario cuando se cierra
  useEffect(() => {
    if (!visible) {
      // Esperar un poco para que el diálogo se cierre completamente
      const timer = setTimeout(() => {
        setFormData({
          workerId: null,
          attendanceDate: new Date(),
          checkInTime: "",
          checkOutTime: "",
          status: "present",
          hoursWorked: 0,
          isHoliday: false,
          notes: "",
          businessId: null,
          officeId: null,
          departmentId: null,
          teamId: null,
        });
        setSelectedWorker(null);
        setErrors({});
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  // Manejar selección de trabajador
  const handleWorkerSelect = (worker: Worker | null) => {
    setSelectedWorker(worker);

    if (worker) {
      setFormData((prev) => ({
        ...prev,
        workerId: worker.id,
        businessId: worker.business?.id || null,
        officeId: worker.office?.id || null,
        departmentId: worker.department?.id || null,
        teamId: worker.team?.id || null,
      }));

      setErrors((prev) => ({ ...prev, workerId: "" }));
    } else {
      setFormData((prev) => ({
        ...prev,
        workerId: null,
        businessId: null,
        officeId: null,
        departmentId: null,
        teamId: null,
      }));
    }
  };

  // Manejar cambios en los campos
  const handleInputChange = (field: keyof FormData, value: any) => {
    const updatedForm = { ...formData, [field]: value };

    // Si cambian las horas de entrada/salida, recalcular horas
    if (field === "checkInTime" || field === "checkOutTime") {
      if (updatedForm.checkInTime && updatedForm.checkOutTime) {
        updatedForm.hoursWorked = calculateHoursWorked(
          updatedForm.checkInTime,
          updatedForm.checkOutTime,
        );
      }
    }

    setFormData(updatedForm);

    // Limpiar error del campo si existe
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Validación de campos de entrada de hora:minutos
    if ((field === "checkInTime" || field === "checkOutTime") && value) {
      const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
      if (!timeRegex.test(value)) {
        setErrors((prev) => ({
          ...prev,
          [field]: "Formato inválido. Use HH:mm (ej: 08:30, 14:00)",
        }));
      }
    }
  };

  // Manejar cambio manual de horas trabajadas
  const handleHoursWorkedChange = (value: number) => {
    setFormData((prev) => ({ ...prev, hoursWorked: value }));
    setErrors((prev) => ({ ...prev, hoursWorked: "" }));
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.workerId) {
      newErrors.workerId = "Debe seleccionar un trabajador";
    }

    if (!formData.attendanceDate) {
      newErrors.attendanceDate = "La fecha de asistencia es requerida";
    }

    if (formData.checkInTime || formData.checkOutTime) {
      const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;

      if (formData.checkInTime && !timeRegex.test(formData.checkInTime)) {
        newErrors.checkInTime = "Formato de hora inválido (use HH:mm)";
      }

      if (formData.checkOutTime && !timeRegex.test(formData.checkOutTime)) {
        newErrors.checkOutTime = "Formato de hora inválido (use HH:mm)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.current?.show({
        severity: "error",
        summary: "Error de validación",
        detail: "Por favor, complete los campos requeridos correctamente",
        life: 3000,
      });
      return;
    }

    try {
      // Convertir fecha a formato ISO 8601 con UTC (termina en Z)
      const attendanceDate = new Date(formData.attendanceDate!);
      attendanceDate.setHours(0, 0, 0, 0); // Establecer a medianoche
      const isoDate = attendanceDate.toISOString(); // Esto da formato: "2026-02-06T00:00:00.000Z"

      const createAttendanceInput = {
        workerId: formData.workerId!,
        attendanceDate: isoDate,
        checkInTime: formData.checkInTime || undefined,
        checkOutTime: formData.checkOutTime || undefined,
        status: formData.status,
        hoursWorked: formData.hoursWorked,
        isHoliday: formData.isHoliday,
        notes: formData.notes || undefined,
        businessId: formData.businessId || undefined,
        officeId: formData.officeId || undefined,
        departmentId: formData.departmentId || undefined,
        teamId: formData.teamId || undefined,
      };

      await createAttendance({
        variables: {
          createAttendanceInput,
        },
      });

      toast.current?.show({
        severity: "success",
        summary: "Éxito",
        detail: "Registro de asistencia creado correctamente",
        life: 3000,
      });

      onSuccess();
      onHide();
    } catch (err: any) {
      console.error("Error creating attendance:", err);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: err.message || "Error al crear el registro de asistencia",
        life: 3000,
      });
    }
  };

  // Footer del diálogo
  const footer = (
    <div className="flex justify-content-end gap-2">
      <Button
        label="Cancelar"
        icon="pi pi-times"
        onClick={onHide}
        className="p-button-text"
        disabled={loading}
      />
      <Button
        label={loading ? "Creando..." : "Crear"}
        icon="pi pi-check"
        onClick={handleSubmit}
        autoFocus
        loading={loading}
        disabled={!formData.workerId || !formData.attendanceDate || loading}
      />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header="Crear Registro de Asistencia"
        visible={visible}
        style={{ width: "50vw", minWidth: "300px" }}
        footer={footer}
        onHide={onHide}
        modal
        className="attendance-create-form"
        onShow={() => {
          // Resetear cuando se abre
          setFormData({
            workerId: null,
            attendanceDate: new Date(),
            checkInTime: "",
            checkOutTime: "",
            status: "present",
            hoursWorked: 0,
            isHoliday: false,
            notes: "",
            businessId: null,
            officeId: null,
            departmentId: null,
            teamId: null,
          });
          setSelectedWorker(null);
          setErrors({});
        }}
      >
        <div className="p-fluid grid">
          {/* Campo: Trabajador (obligatorio) */}
          <div className="col-12">
            <div className="field">
              <label htmlFor="worker" className="block mb-2">
                Trabajador *
                {errors.workerId && (
                  <small className="p-error ml-2">{errors.workerId}</small>
                )}
              </label>
              <WorkerSelector
                onWorkerSelected={handleWorkerSelect}
                selectedWorkerId={formData.workerId}
                placeholder="Busque y seleccione un trabajador..."
                disabled={loading}
              />
            </div>
          </div>

          {/* Campos: Fecha y Estado */}
          <div className="col-6">
            <div className="field">
              <label htmlFor="attendanceDate" className="block mb-2">
                Fecha de Asistencia *
                {errors.attendanceDate && (
                  <small className="p-error ml-2">
                    {errors.attendanceDate}
                  </small>
                )}
              </label>
              <Calendar
                id="attendanceDate"
                value={formData.attendanceDate}
                onChange={(e) => handleInputChange("attendanceDate", e.value)}
                dateFormat="dd/mm/yy"
                showIcon
                className="w-full"
                disabled={loading}
                required
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
                disabled={loading}
              />
            </div>
          </div>

          {/* Campos: Hora de entrada y salida */}
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
                value={formData.checkInTime}
                onChange={(e) =>
                  handleInputChange("checkInTime", e.target.value)
                }
                placeholder="08:30"
                className="w-full"
                disabled={loading}
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
                  <small className="p-error ml-2">{errors.checkOutTime}</small>
                )}
              </label>
              <InputText
                id="checkOutTime"
                value={formData.checkOutTime}
                onChange={(e) =>
                  handleInputChange("checkOutTime", e.target.value)
                }
                placeholder="17:30"
                className="w-full"
                disabled={loading}
                maxLength={5}
              />
            </div>
          </div>

          {/* Campos: Horas trabajadas y Día festivo */}
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
                disabled={loading}
              />
              <small className="text-color-secondary">
                {formData.checkInTime && formData.checkOutTime
                  ? "Calculado automáticamente"
                  : "Ingrese manualmente"}
              </small>
            </div>
          </div>

          <div className="col-6">
            <div className="field flex align-items-center mt-4">
              <Checkbox
                id="isHoliday"
                checked={formData.isHoliday}
                onChange={(e) => handleInputChange("isHoliday", e.checked)}
                disabled={loading}
              />
              <label htmlFor="isHoliday" className="ml-2">
                Día festivo
              </label>
            </div>
          </div>

          {/* Campo: Notas */}
          <div className="col-12">
            <div className="field">
              <label htmlFor="notes" className="block mb-2">
                Notas
              </label>
              <InputTextarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={3}
                className="w-full"
                disabled={loading}
                placeholder="Observaciones adicionales..."
              />
            </div>
          </div>

          {/* Información de entidades de seguridad heredadas */}
          {selectedWorker && (
            <div className="col-12 mt-3">
              <div className="border-round border-1 surface-border p-3">
                <div className="text-sm font-semibold mb-2">
                  Entidades de seguridad heredadas del trabajador:
                </div>
                <div className="grid">
                  {formData.businessId && (
                    <div className="col-6">
                      <div className="text-xs text-color-secondary">
                        Business:
                      </div>
                      <div className="text-sm">
                        {selectedWorker.business?.name || "N/A"}
                      </div>
                    </div>
                  )}
                  {formData.officeId && (
                    <div className="col-6">
                      <div className="text-xs text-color-secondary">
                        Oficina:
                      </div>
                      <div className="text-sm">
                        {selectedWorker.office?.name || "N/A"}
                      </div>
                    </div>
                  )}
                  {formData.departmentId && (
                    <div className="col-6">
                      <div className="text-xs text-color-secondary">
                        Departamento:
                      </div>
                      <div className="text-sm">
                        {selectedWorker.department?.name || "N/A"}
                      </div>
                    </div>
                  )}
                  {formData.teamId && (
                    <div className="col-6">
                      <div className="text-xs text-color-secondary">
                        Equipo:
                      </div>
                      <div className="text-sm">
                        {selectedWorker.team?.name || "N/A"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </Dialog>
    </>
  );
};
