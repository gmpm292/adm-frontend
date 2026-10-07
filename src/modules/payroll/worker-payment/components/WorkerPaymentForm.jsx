import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { Message } from "primereact/message";
import { FormField, InfoRow } from "../../../../components/ui";
import { getErrorMessage } from "../../../../utils/errors";
import { WorkerSelector } from "../../worker/components/WorkerSelector";
import {
  CREATE_WORKER_PAYMENT,
  GET_PAYMENT_FORM_OPTIONS,
  UPDATE_WORKER_PAYMENT,
} from "../graphql/queries";
import {
  PAYMENT_CONCEPT,
  PAYROLL_PAYMENT_METHOD,
  optionsOf,
  periodRange,
  workerName,
} from "../../format";

// La comisión la calcula el sistema a partir de las ventas
const MANUAL_CONCEPTS = Object.fromEntries(
  Object.entries(PAYMENT_CONCEPT).filter(([key]) => key !== "COMMISSION"),
);

/**
 * Registra a mano un pago (salario, bonificación, descuento...) o, con
 * `payment`, corrige uno pendiente.
 */
export function WorkerPaymentForm({ payment, onHide, onSaved }) {
  const isEdit = !!payment;
  const [form, setForm] = useState({
    worker: payment?.worker ?? null,
    payrollPeriodId: payment?.payrollPeriod?.id ?? null,
    paymentConcept: payment?.paymentConcept ?? "BONUS",
    amount: payment?.amount ?? null,
    currency: payment?.currency ?? null,
    paymentMethod: payment?.paymentMethod ?? "CASH",
    notes: payment?.notes ?? "",
  });
  const [submitted, setSubmitted] = useState(false);

  const { data: options, loading: loadingOptions } = useQuery(
    GET_PAYMENT_FORM_OPTIONS,
    { fetchPolicy: "network-only" },
  );
  const [createPayment, createState] = useMutation(CREATE_WORKER_PAYMENT);
  const [updatePayment, updateState] = useMutation(UPDATE_WORKER_PAYMENT);
  const saving = createState.loading || updateState.loading;
  const error = createState.error ?? updateState.error;

  const periods = (options?.payrollPeriods?.data ?? []).filter(
    (p) => !p.isClosed || p.id === form.payrollPeriodId,
  );
  const currencies = (options?.currencies?.data ?? [])
    .filter((c) => c.isActive || c.code === form.currency)
    .map((c) => ({ label: c.code, value: c.code }));
  const isCommission = payment?.paymentConcept === "COMMISSION";

  const errors = {
    worker: form.worker ? null : "Elige el trabajador",
    payrollPeriodId: form.payrollPeriodId ? null : "Elige el período",
    amount: form.amount > 0 ? null : "Escribe el importe",
    currency: form.currency ? null : "Elige la moneda",
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
      payrollPeriodId: form.payrollPeriodId,
      amount: form.amount,
      currency: form.currency,
      paymentMethod: form.paymentMethod,
      notes: form.notes.trim() || null,
      ...(!isCommission && { paymentConcept: form.paymentConcept }),
    };
    try {
      if (isEdit) {
        await updatePayment({
          variables: { payment: { id: payment.id, ...values } },
        });
      } else {
        await createPayment({
          variables: { payment: { workerId: form.worker.id, ...values } },
        });
      }
      onSaved({ name: workerName(form.worker) }, { created: !isEdit });
    } catch {
      // El mensaje se muestra desde `error`
    }
  };

  return (
    <Dialog
      header={isEdit ? "Corregir pago" : "Registrar pago"}
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
              label={workerName(payment.worker)}
              detail={PAYMENT_CONCEPT[payment.paymentConcept]}
            />
          </ul>
        ) : (
          <FormField
            label="Trabajador"
            htmlFor="payment-worker"
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
              label="Período"
              htmlFor="payment-period"
              required
              hint="Solo períodos abiertos"
              error={shown("payrollPeriodId")}
            >
              <Dropdown
                inputId="payment-period"
                value={form.payrollPeriodId}
                options={periods.map((p) => ({
                  label: `${p.name} · ${periodRange(p)}`,
                  value: p.id,
                }))}
                onChange={(e) => set("payrollPeriodId", e.value)}
                placeholder="Elige el período"
                emptyMessage="No hay períodos abiertos: créalo en Períodos"
                loading={loadingOptions}
                invalid={!!shown("payrollPeriodId")}
              />
            </FormField>
          </div>
          {!isCommission && (
            <div className="col-12 md:col-6">
              <FormField label="Concepto" htmlFor="payment-concept" required>
                <Dropdown
                  inputId="payment-concept"
                  value={form.paymentConcept}
                  options={optionsOf(MANUAL_CONCEPTS)}
                  onChange={(e) => set("paymentConcept", e.value)}
                />
              </FormField>
            </div>
          )}
          <div className="col-12 md:col-6">
            <FormField label="Cómo se paga" htmlFor="payment-method">
              <Dropdown
                inputId="payment-method"
                value={form.paymentMethod}
                options={optionsOf(PAYROLL_PAYMENT_METHOD)}
                onChange={(e) => set("paymentMethod", e.value)}
              />
            </FormField>
          </div>
          <div className="col-12">
            <FormField
              label="Importe"
              htmlFor="payment-amount"
              required
              hint={
                form.paymentConcept === "DISCOUNT"
                  ? "Un descuento se resta de lo que cobra"
                  : undefined
              }
              error={shown("amount") ?? shown("currency")}
            >
              <div className="p-inputgroup">
                <InputNumber
                  inputId="payment-amount"
                  value={form.amount}
                  onChange={(e) => set("amount", e.value)}
                  min={0}
                  minFractionDigits={2}
                  maxFractionDigits={2}
                  locale="es-ES"
                  invalid={!!shown("amount")}
                />
                <Dropdown
                  value={form.currency}
                  options={currencies}
                  onChange={(e) => set("currency", e.value)}
                  placeholder="Moneda"
                  loading={loadingOptions}
                  className="w-7rem flex-none"
                  aria-label="Moneda"
                  invalid={!!shown("currency")}
                />
              </div>
            </FormField>
          </div>
          <div className="col-12">
            <FormField label="Notas" htmlFor="payment-notes">
              <InputTextarea
                id="payment-notes"
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
            label={isEdit ? "Guardar cambios" : "Registrar pago"}
            loading={saving}
          />
        </div>
      </form>
    </Dialog>
  );
}
