import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Checkbox } from "primereact/checkbox";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Message } from "primereact/message";
import { FormField } from "../../../../components/ui";
import { getErrorMessage } from "../../../../utils/errors";
import { GET_OFFICE_OPTIONS } from "../../../company/shared/queries";
import { CREATE_WORK_SCHEDULE, UPDATE_WORK_SCHEDULE } from "../graphql/queries";
import { WEEK_DAYS, dayFromApi, dayToApi } from "../../format";

const DEFAULT_DAYS = {
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: true,
  sunday: false,
};

/** Lunes de la semana que viene, para proponer fechas al crear */
const nextMonday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + ((8 - date.getDay()) % 7 || 7));
  return date;
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/** Alta o edición de un horario (con `schedule` edita) */
export function WorkScheduleForm({ schedule, onHide, onSaved }) {
  const isEdit = !!schedule;
  const start = nextMonday();
  const [form, setForm] = useState({
    name: schedule?.name ?? "",
    startDate: schedule ? dayFromApi(schedule.startDate) : start,
    endDate: schedule ? dayFromApi(schedule.endDate) : addDays(start, 6),
    officeId: schedule?.office?.id ?? null,
    notes: schedule?.notes ?? "",
    workingDays: schedule
      ? Object.fromEntries(
          WEEK_DAYS.map((day) => [day.key, !!schedule.workingDays?.[day.key]]),
        )
      : DEFAULT_DAYS,
  });
  const [submitted, setSubmitted] = useState(false);

  const { data: officeData, loading: loadingOffices } =
    useQuery(GET_OFFICE_OPTIONS);
  const [createSchedule, createState] = useMutation(CREATE_WORK_SCHEDULE);
  const [updateSchedule, updateState] = useMutation(UPDATE_WORK_SCHEDULE);
  const saving = createState.loading || updateState.loading;
  const error = createState.error ?? updateState.error;

  const offices = officeData?.offices?.data ?? [];
  const office = offices.find((o) => o.id === form.officeId);

  const errors = {
    name: form.name.trim() ? null : "Escribe un nombre",
    startDate: form.startDate ? null : "Elige la fecha de inicio",
    endDate: !form.endDate
      ? "Elige la fecha de fin"
      : form.startDate && form.endDate < form.startDate
        ? "No puede ser anterior al inicio"
        : null,
    workingDays: Object.values(form.workingDays).some(Boolean)
      ? null
      : "Marca al menos un día",
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const shown = (field) => (submitted ? errors[field] : null);

  const set = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (hasErrors) return;

    const values = {
      name: form.name.trim(),
      startDate: dayToApi(form.startDate),
      endDate: dayToApi(form.endDate),
      workingDays: form.workingDays,
      notes: form.notes.trim() || null,
    };
    try {
      if (isEdit) {
        const { data } = await updateSchedule({
          variables: {
            schedule: { id: schedule.id, officeId: form.officeId, ...values },
          },
        });
        onSaved(data.updateWorkSchedule, { created: false });
      } else {
        const { data } = await createSchedule({
          variables: {
            schedule: {
              ...values,
              ...(office && {
                officeId: office.id,
                businessId: office.business?.id,
              }),
            },
          },
        });
        onSaved(data.createWorkSchedule, { created: true });
      }
    } catch {
      // El mensaje se muestra desde `error`
    }
  };

  return (
    <Dialog
      header={isEdit ? "Editar horario" : "Nuevo horario"}
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
        <div className="formgrid grid">
          <div className="col-12">
            <FormField
              label="Nombre"
              htmlFor="schedule-name"
              required
              error={shown("name")}
            >
              <InputText
                id="schedule-name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Por ejemplo: Semana 41"
                invalid={!!shown("name")}
                maxLength={100}
                autoFocus
              />
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField
              label="Desde"
              htmlFor="schedule-start"
              required
              error={shown("startDate")}
            >
              <Calendar
                inputId="schedule-start"
                value={form.startDate}
                onChange={(e) => set("startDate", e.value)}
                dateFormat="dd/mm/yy"
                showIcon
                invalid={!!shown("startDate")}
              />
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField
              label="Hasta"
              htmlFor="schedule-end"
              required
              error={shown("endDate")}
            >
              <Calendar
                inputId="schedule-end"
                value={form.endDate}
                onChange={(e) => set("endDate", e.value)}
                dateFormat="dd/mm/yy"
                minDate={form.startDate ?? undefined}
                showIcon
                invalid={!!shown("endDate")}
              />
            </FormField>
          </div>
          <div className="col-12">
            <FormField
              label="Días laborables"
              required
              error={shown("workingDays")}
            >
              <div className="flex flex-wrap gap-3">
                {WEEK_DAYS.map((day) => (
                  <span key={day.key} className="flex align-items-center gap-2">
                    <Checkbox
                      inputId={`schedule-day-${day.key}`}
                      checked={form.workingDays[day.key]}
                      onChange={(e) =>
                        set("workingDays", {
                          ...form.workingDays,
                          [day.key]: e.checked,
                        })
                      }
                    />
                    <label htmlFor={`schedule-day-${day.key}`}>
                      {day.label}
                    </label>
                  </span>
                ))}
              </div>
            </FormField>
          </div>
          <div className="col-12">
            <FormField
              label="Oficina"
              htmlFor="schedule-office"
              hint="Vacío si vale para toda la empresa"
            >
              <Dropdown
                inputId="schedule-office"
                value={form.officeId}
                options={offices.map((o) => ({
                  label: [o.name, o.business?.name].filter(Boolean).join(" · "),
                  value: o.id,
                }))}
                onChange={(e) => set("officeId", e.value ?? null)}
                placeholder="Toda la empresa"
                emptyMessage="No hay oficinas"
                loading={loadingOffices}
                showClear
              />
            </FormField>
          </div>
          <div className="col-12">
            <FormField label="Notas" htmlFor="schedule-notes">
              <InputTextarea
                id="schedule-notes"
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Por ejemplo: el miércoles es feriado"
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
            label={isEdit ? "Guardar cambios" : "Guardar horario"}
            loading={saving}
          />
        </div>
      </form>
    </Dialog>
  );
}
