import { useState } from "react";
import { createPortal } from "react-dom";
import { useApolloClient, useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Checkbox } from "primereact/checkbox";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Message } from "primereact/message";
import { Tag } from "primereact/tag";
import { FormField, NoData } from "../../../../components/ui";
import { getErrorMessage } from "../../../../utils/errors";
import { useHasRole } from "../../../../hooks/useHasRole";
import {
  GET_DAY_PAYMENTS,
  GET_DAY_SALE_IDS,
  MARK_WORKER_PAYMENTS_AS_PAID,
  PROCESS_SALES_PAYMENTS,
} from "../graphql/queries";
import {
  PAYMENT_CONCEPT,
  WORKER_TYPE_OPTIONS,
  formatDate,
  formatDateTime,
  formatMoney,
  formatTotals,
  today,
  totalsByCurrency,
  workerName,
  workerTypeLabel,
} from "../../format";

const MAX_ROWS = 1000;

/** Del primer al último milisegundo del día local, como lo filtra la API */
const dayRange = (day) => [
  new Date(day.getFullYear(), day.getMonth(), day.getDate()).toISOString(),
  new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    23,
    59,
    59,
    999,
  ).toISOString(),
];

/** Pagos agrupados por trabajador, en orden alfabético */
const byWorker = (payments) => {
  const groups = new Map();
  for (const payment of payments) {
    const key = payment.worker?.id ?? 0;
    if (!groups.has(key)) groups.set(key, { worker: payment.worker, payments: [] });
    groups.get(key).payments.push(payment);
  }
  return [...groups.values()].sort((a, b) =>
    (workerName(a.worker) ?? "").localeCompare(workerName(b.worker) ?? ""),
  );
};

const signed = (payment) =>
  `${payment.paymentConcept === "DISCOUNT" ? "−" : ""}${formatMoney(payment.amount, payment.currency)}`;

/**
 * Informe diario de pagos (pensado para los publicistas, que cobran cada
 * día): calcula las comisiones de las ventas cobradas ese día, las agrupa
 * por trabajador y se imprime o se guarda como PDF desde el navegador.
 */
export function DailyPaymentReport({ onHide, onChanged }) {
  const client = useApolloClient();
  const hasRole = useHasRole();
  const canProcess = hasRole("SUPER", "PRINCIPAL", "ADMIN");
  const [day, setDay] = useState(today);
  const [workerType, setWorkerType] = useState("PUBLICIST");
  const [recalculate, setRecalculate] = useState(canProcess);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processSales] = useMutation(PROCESS_SALES_PAYMENTS);
  const [markAsPaid, { loading: paying }] = useMutation(
    MARK_WORKER_PAYMENTS_AS_PAID,
  );

  const loadPayments = async () => {
    const [from, to] = dayRange(day);
    const { data } = await client.query({
      query: GET_DAY_PAYMENTS,
      fetchPolicy: "network-only",
      variables: {
        options: {
          take: MAX_ROWS,
          filters: [
            { property: "worker.workerType", operator: "EQUAL", value: workerType },
            { property: "sale.effectiveDate", operator: "GREATER_EQUAL_THAN", value: from },
            { property: "sale.effectiveDate", operator: "LESS_EQUAL_THAN", value: to },
          ],
          sorts: [{ property: "createdAt", direction: "ASC" }],
        },
      },
    });
    setReport({
      day,
      workerType,
      payments: data?.workerPayments?.data ?? [],
    });
  };

  const handleGenerate = async () => {
    setError(null);
    setWarning(null);
    setLoading(true);
    try {
      if (recalculate) {
        const [from, to] = dayRange(day);
        const { data } = await client.query({
          query: GET_DAY_SALE_IDS,
          fetchPolicy: "network-only",
          variables: {
            options: {
              take: MAX_ROWS,
              filters: [
                { property: "isConfirmed", operator: "EQUAL", value: "true" },
                { property: "effectiveDate", operator: "GREATER_EQUAL_THAN", value: from },
                { property: "effectiveDate", operator: "LESS_EQUAL_THAN", value: to },
              ],
            },
          },
        });
        const saleIds = (data?.sales?.data ?? []).map((sale) => sale.id);
        if (saleIds.length) {
          const { data: result } = await processSales({ variables: { saleIds } });
          const failed = result?.processBatchSalePayments?.failed ?? 0;
          if (failed > 0) {
            setWarning(
              `${failed} venta(s) no se pudieron calcular: ${result.processBatchSalePayments.results
                .filter((r) => r.error)
                .map((r) => `#${r.saleId} ${r.error}`)
                .join("; ")}`,
            );
          }
          onChanged?.();
        }
      }
      await loadPayments();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const payments = report?.payments ?? [];
  const pendingIds = payments.filter((p) => !p.paidDate).map((p) => p.id);
  const groups = byWorker(payments);
  const title = `Pagos de ${workerTypeLabel(report?.workerType).toLowerCase()}s · ${formatDate(report?.day)}`;

  const handlePayAll = async () => {
    setError(null);
    try {
      await markAsPaid({ variables: { ids: pendingIds } });
      onChanged?.();
      await loadPayments();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const sheet = report && (
    <div className="ui-report">
      <h2 className="ui-report__title">{title}</h2>
      {groups.length === 0 ? (
        <NoData message="No hay pagos de las ventas de ese día" />
      ) : (
        <>
          {groups.map(({ worker, payments: rows }) => (
            <section className="ui-report__group" key={worker?.id ?? 0}>
              <header className="ui-report__group-header">
                <span>{workerName(worker)}</span>
                <span>{formatTotals(totalsByCurrency(rows))}</span>
              </header>
              <table className="ui-report__table">
                <thead>
                  <tr>
                    <th>Venta</th>
                    <th>Hora</th>
                    <th>Concepto</th>
                    <th className="text-right">Importe</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((payment) => (
                    <tr key={payment.id}>
                      <td>
                        {payment.sale?.invoiceNumber || `#${payment.sale?.id}`}
                      </td>
                      <td>
                        {formatDateTime(payment.sale?.effectiveDate).slice(-5)}
                      </td>
                      <td>
                        {[
                          PAYMENT_CONCEPT[payment.paymentConcept],
                          payment.breakdown?.ruleName,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </td>
                      <td className="text-right white-space-nowrap">
                        {signed(payment)}
                      </td>
                      <td>
                        {payment.paidDate
                          ? `Pagado ${formatDate(payment.paidDate)}`
                          : "Pendiente"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))}
          <footer className="ui-report__total">
            <span>Total del día</span>
            <span>{formatTotals(totalsByCurrency(payments))}</span>
          </footer>
          <div className="ui-report__signatures">
            <span>Entregado por</span>
            <span>Recibido por</span>
          </div>
        </>
      )}
    </div>
  );

  return (
    <Dialog
      header="Informe de pagos del día"
      visible
      onHide={onHide}
      className="ui-dialog--wide"
      closable={!loading && !paying}
      modal
    >
      <div className="formgrid grid align-items-end">
        <div className="col-12 md:col-4">
          <FormField label="Día" htmlFor="report-day">
            <Calendar
              inputId="report-day"
              value={day}
              onChange={(e) => e.value && setDay(e.value)}
              dateFormat="dd/mm/yy"
              maxDate={today()}
              showIcon
            />
          </FormField>
        </div>
        <div className="col-12 md:col-4">
          <FormField label="Trabajadores" htmlFor="report-worker-type">
            <Dropdown
              inputId="report-worker-type"
              value={workerType}
              options={WORKER_TYPE_OPTIONS}
              onChange={(e) => setWorkerType(e.value)}
            />
          </FormField>
        </div>
        <div className="col-12 md:col-4">
          <FormField label=" " htmlFor="report-generate">
            <Button
              id="report-generate"
              label="Generar informe"
              icon="pi pi-file"
              loading={loading}
              onClick={handleGenerate}
              className="w-full"
            />
          </FormField>
        </div>
        {canProcess && (
          <div className="col-12">
            <div className="flex align-items-center gap-2 mb-3">
              <Checkbox
                inputId="report-recalculate"
                checked={recalculate}
                onChange={(e) => setRecalculate(e.checked)}
              />
              <label htmlFor="report-recalculate">
                Calcular antes las comisiones de las ventas de ese día (no
                cambia lo ya pagado)
              </label>
            </div>
          </div>
        )}
      </div>

      {error && <Message severity="error" text={error} className="w-full mb-3" />}
      {warning && (
        <Message severity="warn" text={warning} className="w-full mb-3" />
      )}

      {sheet}

      {report && payments.length > 0 && (
        <div className="flex flex-wrap justify-content-end align-items-center gap-2 mt-4">
          {pendingIds.length > 0 ? (
            <Tag severity="warning" value={`${pendingIds.length} pendientes`} />
          ) : (
            <Tag severity="success" value="Todo pagado" />
          )}
          {canProcess && pendingIds.length > 0 && (
            <Button
              label="Marcar todo como pagado"
              icon="pi pi-check-circle"
              severity="success"
              outlined
              loading={paying}
              onClick={handlePayAll}
            />
          )}
          <Button
            label="Imprimir o guardar PDF"
            icon="pi pi-print"
            onClick={() => window.print()}
          />
        </div>
      )}

      {/* Copia que solo se ve al imprimir: fuera del diálogo y a página completa */}
      {sheet && createPortal(<div className="ui-print-only">{sheet}</div>, document.body)}
    </Dialog>
  );
}
