import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { confirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { Message } from "primereact/message";
import { ProgressSpinner } from "primereact/progressspinner";
import { Tag } from "primereact/tag";
import { InfoRow, NoData } from "../../../../components/ui";
import { getErrorMessage } from "../../../../utils/errors";
import {
  CLOSE_PAYROLL_PERIOD,
  GET_PAYROLL_PERIOD_BY_ID,
  PROCESS_PERIOD_PAYMENTS,
  PROCESS_PERIOD_SALES,
} from "../graphql/queries";
import { MARK_WORKER_PAYMENTS_AS_PAID } from "../../worker-payment/graphql/queries";
import {
  formatDateTime,
  formatTotals,
  periodRange,
  totalsByCurrency,
  workerName,
} from "../../format";

/** Lo que se le debe a cada trabajador en el período, por moneda */
const byWorker = (payments) => {
  const groups = new Map();
  for (const payment of payments) {
    const id = payment.worker?.id;
    if (!groups.has(id)) groups.set(id, { worker: payment.worker, payments: [] });
    groups.get(id).payments.push(payment);
  }
  return [...groups.values()].sort((a, b) =>
    workerName(a.worker).localeCompare(workerName(b.worker)),
  );
};

/**
 * Ficha de un período: fechas, pagos calculados por trabajador y las
 * acciones de calcular y cerrar.
 */
export function PayrollPeriodDetailForm({ periodId, canManage, onHide, onChanged }) {
  const [result, setResult] = useState(null);
  const { data, loading, error, refetch } = useQuery(GET_PAYROLL_PERIOD_BY_ID, {
    variables: { id: periodId },
    fetchPolicy: "network-only",
  });
  const [processPayments] = useMutation(PROCESS_PERIOD_PAYMENTS);
  const [processSales] = useMutation(PROCESS_PERIOD_SALES);
  const [closePeriod, { loading: closing }] = useMutation(CLOSE_PAYROLL_PERIOD);
  const [markAsPaid, { loading: paying }] = useMutation(
    MARK_WORKER_PAYMENTS_AS_PAID,
  );
  const [calculating, setCalculating] = useState(false);

  const period = data?.payrollPeriod;
  const payments = period?.payments ?? [];
  const pending = payments.filter((p) => !p.paidDate);
  const ended = period && new Date(period.endDate) < new Date();
  const busy = calculating || closing || paying;

  // Pagos fijos (salarios) y comisiones por ventas, uno tras otro
  const calculate = async () => {
    setCalculating(true);
    setResult(null);
    try {
      const { data: fixed } = await processPayments({
        variables: { input: { payrollPeriodId: period.id } },
      });
      const { data: sales } = await processSales({
        variables: { payrollPeriodId: period.id },
      });
      const fixedResult = fixed.processPeriodPayments;
      const salesResult = sales.processPeriodSales;
      const errors = [
        ...fixedResult.data
          .filter((r) => r.errors?.length)
          .map((r) => `${r.workerName ?? "Trabajador"}: ${r.errors.join(", ")}`),
        ...salesResult.results
          .filter((r) => !r.success && r.error)
          .map((r) => `Venta #${r.saleId}: ${r.error}`),
      ];
      setResult({
        severity: errors.length ? "warn" : "success",
        text: `Pagos fijos: ${fixedResult.successCount} calculados. Ventas: ${salesResult.successful} de ${salesResult.totalSales} procesadas, ${salesResult.totalPaymentsCreated} comisiones.`,
        errors,
      });
      await refetch();
      onChanged?.();
    } catch (err) {
      setResult({ severity: "error", text: getErrorMessage(err), errors: [] });
    } finally {
      setCalculating(false);
    }
  };

  const payAll = () =>
    confirmDialog({
      header: "Marcar todo como pagado",
      message: `Se marcarán como hechos los ${pending.length} pagos pendientes del período, con la fecha de hoy.`,
      icon: "pi pi-check-circle",
      acceptLabel: "Marcar pagados",
      rejectLabel: "Cancelar",
      accept: async () => {
        setResult(null);
        try {
          await markAsPaid({ variables: { ids: pending.map((p) => p.id) } });
          await refetch();
          onChanged?.();
        } catch (err) {
          setResult({
            severity: "error",
            text: getErrorMessage(err),
            errors: [],
          });
        }
      },
    });

  const close = () =>
    confirmDialog({
      header: "Cerrar período",
      message: `Se cerrará «${period.name}». Un período cerrado ya no se calcula ni se modifica.`,
      icon: "pi pi-lock",
      acceptLabel: "Cerrar período",
      rejectLabel: "Cancelar",
      accept: async () => {
        setResult(null);
        try {
          await closePeriod({ variables: { id: period.id } });
          await refetch();
          onChanged?.();
        } catch (err) {
          setResult({
            severity: "error",
            text: getErrorMessage(err),
            errors: [],
          });
        }
      },
    });

  const canAct = canManage && period && !period.isClosed && !period.deletedAt;

  return (
    <Dialog
      header={
        period ? (
          <span className="flex align-items-center gap-2">
            {period.name}
            <Tag
              severity={period.isClosed ? "secondary" : "success"}
              value={period.isClosed ? "Cerrado" : "Abierto"}
            />
          </span>
        ) : (
          "Período"
        )
      }
      visible
      onHide={onHide}
      className="ui-dialog--wide"
      closable={!busy}
      modal
      footer={
        canAct ? (
          <>
            {pending.length > 0 && (
              <Button
                label={`Marcar pagados (${pending.length})`}
                icon="pi pi-check-circle"
                severity="secondary"
                onClick={payAll}
                loading={paying}
                disabled={busy}
              />
            )}
            <Button
              label="Cerrar período"
              icon="pi pi-lock"
              severity="secondary"
              onClick={close}
              disabled={!ended || pending.length > 0 || busy}
              tooltip={
                !ended
                  ? "Se cierra cuando termina"
                  : pending.length
                    ? "Quedan pagos sin hacer"
                    : undefined
              }
              tooltipOptions={{ position: "top", showOnDisabled: true }}
            />
            <Button
              label={payments.length ? "Volver a calcular" : "Calcular pagos"}
              icon="pi pi-calculator"
              onClick={calculate}
              loading={calculating}
              disabled={!ended || busy}
              tooltip={!ended ? "Se calcula cuando termina" : undefined}
              tooltipOptions={{ position: "top", showOnDisabled: true }}
            />
          </>
        ) : undefined
      }
    >
      {loading && !period ? (
        <div className="flex justify-content-center p-5">
          <ProgressSpinner strokeWidth="4" />
        </div>
      ) : !period ? (
        <NoData
          message={error ? getErrorMessage(error) : "No se encontró el período"}
        />
      ) : (
        <>
          {result && (
            <Message
              severity={result.severity}
              className="w-full mb-3"
              content={
                <div className="flex flex-column gap-1">
                  <span>{result.text}</span>
                  {result.errors.slice(0, 5).map((text) => (
                    <small key={text}>{text}</small>
                  ))}
                </div>
              }
            />
          )}
          <ul className="ui-info-list">
            <InfoRow
              icon="pi pi-calendar"
              label="Fechas"
              detail={period.description}
            >
              {periodRange(period)}
            </InfoRow>
            <InfoRow
              icon="pi pi-wallet"
              label="Total calculado"
              detail={
                payments.length
                  ? `${payments.length} pagos, ${pending.length} sin hacer`
                  : ended
                    ? "Aún sin calcular"
                    : "Se calcula cuando termine"
              }
            >
              {formatTotals(totalsByCurrency(payments))}
            </InfoRow>
            <InfoRow
              icon="pi pi-user"
              label="Creado"
              detail={[period.createdBy?.name, period.createdBy?.lastName]
                .filter(Boolean)
                .join(" ")}
            >
              {formatDateTime(period.createdAt)}
            </InfoRow>
          </ul>

          <h3 className="text-base font-semibold text-900 mt-4 mb-2">
            Por trabajador
          </h3>
          {payments.length ? (
            <ul className="ui-info-list">
              {byWorker(payments).map(({ worker, payments: own }) => {
                const unpaid = own.filter((p) => !p.paidDate).length;
                return (
                  <InfoRow
                    key={worker?.id}
                    icon="pi pi-user"
                    label={workerName(worker)}
                    detail={`${own.length} pagos`}
                  >
                    <span className="flex align-items-center gap-2">
                      {formatTotals(totalsByCurrency(own))}
                      <Tag
                        severity={unpaid ? "warning" : "success"}
                        value={unpaid ? "Pendiente" : "Pagado"}
                      />
                    </span>
                  </InfoRow>
                );
              })}
            </ul>
          ) : (
            <NoData message="Todavía no hay pagos en este período" />
          )}
        </>
      )}
    </Dialog>
  );
}
