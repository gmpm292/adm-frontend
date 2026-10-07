import { useState } from "react";
import { useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Message } from "primereact/message";
import { FormField } from "../../../../components/ui";
import { getErrorMessage } from "../../../../utils/errors";
import {
  CREATE_PAYROLL_PERIOD,
  UPDATE_PAYROLL_PERIOD,
} from "../graphql/queries";

const MAX_DAYS = 31;

const startOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());
const endOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};
const two = (n) => String(n).padStart(2, "0");
const short = (date) => `${two(date.getDate())}/${two(date.getMonth() + 1)}`;

/** Semana pasada (lunes a domingo): lo habitual al liquidar */
const lastWeek = () => {
  const monday = startOfDay(new Date());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7) - 7);
  return [monday, addDays(monday, 6)];
};

/** Alta o edición de un período (con `period` edita) */
export function PayrollPeriodForm({ period, onHide, onSaved }) {
  const isEdit = !!period;
  const [defaultStart, defaultEnd] = lastWeek();
  const [form, setForm] = useState({
    name: period?.name ?? "",
    startDate: period ? startOfDay(new Date(period.startDate)) : defaultStart,
    endDate: period ? startOfDay(new Date(period.endDate)) : defaultEnd,
    description: period?.description ?? "",
  });
  const [submitted, setSubmitted] = useState(false);
  const datesLocked = isEdit && period.payments?.length > 0;

  const [createPeriod, createState] = useMutation(CREATE_PAYROLL_PERIOD);
  const [updatePeriod, updateState] = useMutation(UPDATE_PAYROLL_PERIOD);
  const saving = createState.loading || updateState.loading;
  const error = createState.error ?? updateState.error;

  const days =
    form.startDate && form.endDate
      ? Math.round((form.endDate - form.startDate) / 86400000) + 1
      : 0;
  const suggestedName =
    form.startDate && form.endDate
      ? `Del ${short(form.startDate)} al ${short(form.endDate)}`
      : "";

  const errors = {
    startDate: form.startDate ? null : "Elige el primer día",
    endDate: !form.endDate
      ? "Elige el último día"
      : days < 1
        ? "No puede ser anterior al primer día"
        : days > MAX_DAYS
          ? `Un período dura como mucho ${MAX_DAYS} días`
          : null,
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
      name: (form.name.trim() || suggestedName).slice(0, 50),
      description: form.description.trim() || null,
      ...(!datesLocked && {
        startDate: startOfDay(form.startDate).toISOString(),
        endDate: endOfDay(form.endDate).toISOString(),
      }),
    };
    try {
      if (isEdit) {
        const { data } = await updatePeriod({
          variables: { period: { id: period.id, ...values } },
        });
        onSaved(data.updatePayrollPeriod, { created: false });
      } else {
        const { data } = await createPeriod({ variables: { period: values } });
        onSaved(data.createPayrollPeriod, { created: true });
      }
    } catch {
      // El mensaje se muestra desde `error`
    }
  };

  return (
    <Dialog
      header={isEdit ? "Editar período" : "Nuevo período"}
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
          <div className="col-12 md:col-6">
            <FormField
              label="Primer día"
              htmlFor="period-start"
              required
              error={shown("startDate")}
            >
              <Calendar
                inputId="period-start"
                value={form.startDate}
                onChange={(e) => set("startDate", e.value)}
                dateFormat="dd/mm/yy"
                showIcon
                disabled={datesLocked}
                invalid={!!shown("startDate")}
              />
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField
              label="Último día"
              htmlFor="period-end"
              required
              hint={days > 0 && !errors.endDate ? `${days} días` : undefined}
              error={shown("endDate")}
            >
              <Calendar
                inputId="period-end"
                value={form.endDate}
                onChange={(e) => set("endDate", e.value)}
                dateFormat="dd/mm/yy"
                minDate={form.startDate ?? undefined}
                showIcon
                disabled={datesLocked}
                invalid={!!shown("endDate")}
              />
            </FormField>
          </div>
          {datesLocked && (
            <div className="col-12">
              <Message
                severity="info"
                text="Ya tiene pagos calculados: sus fechas no se cambian."
                className="w-full mb-3"
              />
            </div>
          )}
          <div className="col-12">
            <FormField
              label="Nombre"
              htmlFor="period-name"
              hint="Vacío: se nombra por sus fechas"
            >
              <InputText
                id="period-name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder={suggestedName}
                maxLength={50}
              />
            </FormField>
          </div>
          <div className="col-12">
            <FormField label="Descripción" htmlFor="period-description">
              <InputTextarea
                id="period-description"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={2}
                autoResize
                maxLength={500}
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
            label={isEdit ? "Guardar cambios" : "Guardar período"}
            loading={saving}
          />
        </div>
      </form>
    </Dialog>
  );
}
