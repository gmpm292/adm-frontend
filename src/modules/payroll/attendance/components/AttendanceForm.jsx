import { useState } from "react";
import { useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputMask } from "primereact/inputmask";
import { InputTextarea } from "primereact/inputtextarea";
import { Message } from "primereact/message";
import { FormField, InfoRow } from "../../../../components/ui";
import { getErrorMessage } from "../../../../utils/errors";
import { WorkerSelector } from "../../worker/components/WorkerSelector";
import { CREATE_ATTENDANCE, UPDATE_ATTENDANCE } from "../graphql/queries";
import {
  ATTENDANCE_STATUS_OPTIONS,
  dayFromApi,
  dayToApi,
  formatHours,
  today,
  workerName,
} from "../../format";

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Horas entre dos «HH:mm», también si la salida pasa la medianoche */
const hoursBetween = (from, to) => {
  const minutes = (time) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };
  let total = minutes(to) - minutes(from);
  if (total < 0) total += 24 * 60;
  return total / 60;
};

/**
 * Alta o edición de un registro de asistencia (con `attendance` edita). Las
 * horas trabajadas salen de la entrada y la salida.
 */
export function AttendanceForm({ attendance, day, onHide, onSaved }) {
  const isEdit = !!attendance;
  const [form, setForm] = useState({
    worker: attendance?.worker ?? null,
    date: attendance ? dayFromApi(attendance.attendanceDate) : (day ?? today()),
    checkIn: attendance?.checkInTime?.slice(0, 5) ?? "",
    checkOut: attendance?.checkOutTime?.slice(0, 5) ?? "",
    status: attendance?.status ?? null,
    notes: attendance?.notes ?? "",
  });
  const [submitted, setSubmitted] = useState(false);

  const [createAttendance, createState] = useMutation(CREATE_ATTENDANCE);
  const [updateAttendance, updateState] = useMutation(UPDATE_ATTENDANCE);
  const saving = createState.loading || updateState.loading;
  const error = createState.error ?? updateState.error;

  // InputMask deja «__:__» mientras no se completa
  const clean = (time) => (time && !time.includes("_") ? time : "");
  const checkIn = clean(form.checkIn);
  const checkOut = clean(form.checkOut);

  const errors = {
    worker: form.worker ? null : "Elige el trabajador",
    date: form.date ? null : "Elige el día",
    checkIn: !checkIn || TIME_PATTERN.test(checkIn) ? null : "Hora no válida",
    checkOut: !checkOut
      ? null
      : !TIME_PATTERN.test(checkOut)
        ? "Hora no válida"
        : !checkIn
          ? "Primero la entrada"
          : null,
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const shown = (field) => (submitted ? errors[field] : null);

  const set = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  // Lo que se guardará: con hora de entrada no puede quedar «Ausente»
  const chosen = form.status ?? "absent";
  const status = checkIn && chosen === "absent" ? "present" : chosen;
  const hours =
    checkIn && checkOut && !errors.checkIn && !errors.checkOut
      ? hoursBetween(checkIn, checkOut)
      : null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (hasErrors) return;

    // Vacío borra la hora al editar
    const values = {
      attendanceDate: dayToApi(form.date),
      checkInTime: checkIn || null,
      checkOutTime: checkOut || null,
      status,
      notes: form.notes.trim() || null,
    };
    try {
      if (isEdit) {
        await updateAttendance({
          variables: { attendance: { id: attendance.id, ...values } },
        });
      } else {
        await createAttendance({
          variables: { attendance: { workerId: form.worker.id, ...values } },
        });
      }
      onSaved({ name: workerName(form.worker) }, { created: !isEdit });
    } catch {
      // El mensaje se muestra desde `error`
    }
  };

  return (
    <Dialog
      header={isEdit ? "Editar asistencia" : "Nuevo registro de asistencia"}
      visible
      onHide={onHide}
      className="w-full md:w-30rem"
      closable={!saving}
      modal
    >
      <form onSubmit={handleSubmit} noValidate>
        {error && (
          <Message
            severity="error"
            text={getErrorMessage(error)}
            className="w-full mb-3"
          />
        )}
        {isEdit ? (
          <ul className="ui-info-list mb-4">
            <InfoRow
              icon="pi pi-user"
              label={workerName(attendance.worker)}
              detail={attendance.office?.name}
            />
          </ul>
        ) : (
          <FormField
            label="Trabajador"
            htmlFor="attendance-worker"
            required
            error={shown("worker")}
          >
            <WorkerSelector
              selectedWorkerId={form.worker?.id ?? null}
              onWorkerSelected={(worker) => set("worker", worker)}
            />
          </FormField>
        )}
        <div className="formgrid grid">
          <div className="col-12">
            <FormField
              label="Día"
              htmlFor="attendance-date"
              required
              error={shown("date")}
            >
              <Calendar
                inputId="attendance-date"
                value={form.date}
                onChange={(e) => set("date", e.value)}
                dateFormat="dd/mm/yy"
                maxDate={today()}
                showIcon
                invalid={!!shown("date")}
              />
            </FormField>
          </div>
          <div className="col-6">
            <FormField
              label="Entrada"
              htmlFor="attendance-in"
              hint="Formato 24 h"
              error={shown("checkIn")}
            >
              <InputMask
                id="attendance-in"
                mask="99:99"
                value={form.checkIn}
                onChange={(e) => set("checkIn", e.value ?? "")}
                placeholder="08:30"
                invalid={!!shown("checkIn")}
              />
            </FormField>
          </div>
          <div className="col-6">
            <FormField
              label="Salida"
              htmlFor="attendance-out"
              hint={hours !== null ? `Trabajó ${formatHours(hours)}` : undefined}
              error={shown("checkOut")}
            >
              <InputMask
                id="attendance-out"
                mask="99:99"
                value={form.checkOut}
                onChange={(e) => set("checkOut", e.value ?? "")}
                placeholder="17:00"
                invalid={!!shown("checkOut")}
              />
            </FormField>
          </div>
          <div className="col-12">
            <FormField
              label="Estado"
              htmlFor="attendance-status"
              hint="Con hora de entrada, «Ausente» pasa a «Presente»"
            >
              <Dropdown
                inputId="attendance-status"
                value={status}
                options={ATTENDANCE_STATUS_OPTIONS}
                onChange={(e) => set("status", e.value)}
              />
            </FormField>
          </div>
          <div className="col-12">
            <FormField label="Notas" htmlFor="attendance-notes">
              <InputTextarea
                id="attendance-notes"
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                rows={2}
                autoResize
              />
            </FormField>
          </div>
        </div>
        <div className="flex justify-content-end gap-2 mt-3">
          <Button
            type="button"
            label="Cancelar"
            severity="secondary"
            onClick={onHide}
            disabled={saving}
          />
          <Button
            type="submit"
            label={isEdit ? "Guardar cambios" : "Guardar registro"}
            loading={saving}
          />
        </div>
      </form>
    </Dialog>
  );
}
