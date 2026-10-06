import { useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Message } from "primereact/message";
import {
  PAYMENT_METHOD_LABELS,
  formatMoney,
} from "../../../statistics/format";
import { amountToComplete, settle } from "../saleCart";

const METHOD_OPTIONS = Object.entries(PAYMENT_METHOD_LABELS).map(
  ([value, label]) => ({ value, label }),
);

/**
 * Cobro de la venta: uno o varios pagos, en cualquiera de las monedas en que
 * puede cobrarse completa. Muestra al momento lo que falta o el cambio.
 */
export function PaymentDialog({
  totals,
  currency,
  loading,
  error,
  onHide,
  onConfirm,
}) {
  const totalOf = (code) => totals.find((t) => t.currency === code)?.total ?? 0;

  // Lo habitual es un solo pago por el importe exacto
  const [payments, setPayments] = useState(() => [
    { key: 1, amount: totalOf(currency), currency, paymentMethod: "CASH" },
  ]);

  const currencyOptions = totals.map((t) => ({
    label: t.currency,
    value: t.currency,
  }));
  const otherTotals = totals.filter((t) => t.currency !== currency);
  const { total, pending, change } = settle(totals, currency, payments);
  const received = payments.filter((payment) => payment.amount > 0);

  const update = (key, values) =>
    setPayments((current) =>
      current.map((payment) =>
        payment.key === key ? { ...payment, ...values } : payment,
      ),
    );

  const addPayment = () =>
    setPayments((current) => {
      const next = [
        ...current,
        {
          key: Math.max(...current.map((p) => p.key)) + 1,
          amount: 0,
          currency,
          paymentMethod: "CASH",
        },
      ];
      // El pago nuevo nace con lo que falta
      next[next.length - 1].amount = amountToComplete(
        totals,
        next,
        next.length - 1,
      );
      return next;
    });

  const complete = (index) =>
    setPayments((current) =>
      current.map((payment, i) =>
        i === index
          ? { ...payment, amount: amountToComplete(totals, current, index) }
          : payment,
      ),
    );

  const handleSubmit = (event) => {
    event.preventDefault();
    if (pending > 0 || received.length === 0) return;
    onConfirm(
      received.map(({ amount, currency: code, paymentMethod }) => ({
        amount,
        currency: code,
        paymentMethod,
      })),
      change,
    );
  };

  return (
    <Dialog
      header="Cobrar venta"
      visible
      onHide={onHide}
      className="ui-dialog--wide"
      closable={!loading}
      modal
    >
      <form onSubmit={handleSubmit} className="flex flex-column gap-4">
        <div>
          <div className="pos-total">
            <span className="pos-total__label">Total a cobrar</span>
            <span className="pos-total__amount">
              {formatMoney(total, currency)}
            </span>
          </div>
          {otherTotals.length > 0 && (
            <div className="pos-total__alt">
              o{" "}
              {otherTotals
                .map((t) => formatMoney(t.total, t.currency))
                .join(" · ")}
            </div>
          )}
        </div>

        <div className="flex flex-column gap-2">
          {payments.map((payment, index) => (
            <div key={payment.key} className="flex align-items-center gap-2">
              <InputNumber
                value={payment.amount}
                onValueChange={(e) =>
                  update(payment.key, { amount: e.value ?? 0 })
                }
                mode="decimal"
                minFractionDigits={2}
                maxFractionDigits={2}
                min={0}
                className="flex-1"
                inputClassName="w-full"
                aria-label={`Importe del pago ${index + 1}`}
                autoFocus={index === 0}
              />
              {currencyOptions.length > 1 && (
                <Dropdown
                  value={payment.currency}
                  options={currencyOptions}
                  onChange={(e) => update(payment.key, { currency: e.value })}
                  className="w-7rem"
                  aria-label={`Moneda del pago ${index + 1}`}
                />
              )}
              <Dropdown
                value={payment.paymentMethod}
                options={METHOD_OPTIONS}
                onChange={(e) =>
                  update(payment.key, { paymentMethod: e.value })
                }
                className="w-11rem"
                aria-label={`Forma del pago ${index + 1}`}
              />
              <Button
                type="button"
                icon="pi pi-equals"
                text
                rounded
                severity="secondary"
                aria-label="Poner lo que falta"
                tooltip="Poner lo que falta"
                tooltipOptions={{ position: "top" }}
                onClick={() => complete(index)}
              />
              {payments.length > 1 && (
                <Button
                  type="button"
                  icon="pi pi-times"
                  text
                  rounded
                  severity="danger"
                  aria-label={`Quitar el pago ${index + 1}`}
                  onClick={() =>
                    setPayments((current) =>
                      current.filter((p) => p.key !== payment.key),
                    )
                  }
                />
              )}
            </div>
          ))}
          <div>
            <Button
              type="button"
              label="Añadir otro pago"
              icon="pi pi-plus"
              text
              size="small"
              onClick={addPayment}
            />
          </div>
        </div>

        <div
          className={
            pending > 0
              ? "pos-balance pos-balance--pending"
              : "pos-balance pos-balance--ok"
          }
          role="status"
        >
          <span>
            {pending > 0
              ? "Falta por cobrar"
              : change > 0
                ? "Cambio a devolver"
                : "Importe exacto"}
          </span>
          <span className="pos-balance__amount">
            {formatMoney(pending > 0 ? pending : change, currency)}
          </span>
        </div>

        {error && <Message severity="error" text={error} className="w-full" />}

        <div className="flex justify-content-end gap-2">
          <Button
            type="button"
            label="Cancelar"
            severity="secondary"
            onClick={onHide}
            disabled={loading}
          />
          <Button
            type="submit"
            label="Confirmar cobro"
            icon="pi pi-check"
            loading={loading}
            disabled={pending > 0 || received.length === 0}
          />
        </div>
      </form>
    </Dialog>
  );
}
