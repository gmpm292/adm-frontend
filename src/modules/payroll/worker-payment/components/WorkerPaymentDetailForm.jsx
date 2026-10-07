import { useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Tag } from "primereact/tag";
import { InfoRow } from "../../../../components/ui";
import { SaleDetailForm } from "../../../sales/sale/components/SaleDetailForm";
import {
  PAYMENT_CONCEPT,
  PAYROLL_PAYMENT_METHOD,
  formatDateTime,
  formatMoney,
  workerName,
} from "../../format";

const ROLE_IN_SALE = {
  MAIN_SELLER: "Por haber hecho la venta",
  PUBLICIST: "Como publicista de la venta",
  OTHER: "Por reparto entre los presentes",
};

/** Cómo se llegó al importe, en palabras, a partir del desglose */
const calculationText = (breakdown) => {
  if (!breakdown) return [];
  const parts = [];
  if (breakdown.roleInSale) parts.push(ROLE_IN_SALE[breakdown.roleInSale]);
  if (breakdown.percentage != null) parts.push(`${breakdown.percentage} % de lo vendido`);
  if (breakdown.productCount) parts.push(`${breakdown.productCount} unidades contadas`);
  if (breakdown.totalWorkers > 1) {
    parts.push(`repartido entre ${breakdown.totalWorkers} trabajadores`);
  }
  if (breakdown.multiplier > 1) parts.push(`× ${breakdown.multiplier} unidades de la empresa`);
  if (breakdown.reversed) parts.push("revertido por una devolución");
  return parts.filter(Boolean);
};

/** Ficha de un pago: a quién, cuánto, por qué y si ya se hizo */
export function WorkerPaymentDetailForm({ payment, onHide }) {
  const [saleId, setSaleId] = useState(null);
  const calculation = calculationText(payment.breakdown);

  return (
    <>
      <Dialog
        header={
          <span className="flex align-items-center gap-2">
            {PAYMENT_CONCEPT[payment.paymentConcept]} de {workerName(payment.worker)}
            <Tag
              severity={payment.paidDate ? "success" : "warning"}
              value={payment.paidDate ? "Pagado" : "Pendiente"}
            />
          </span>
        }
        visible
        onHide={onHide}
        className="w-full md:w-30rem"
        modal
      >
        <ul className="ui-info-list">
          <InfoRow
            icon="pi pi-wallet"
            label="Importe"
            detail={PAYROLL_PAYMENT_METHOD[payment.paymentMethod]}
          >
            {payment.paymentConcept === "DISCOUNT" ? "−" : ""}
            {formatMoney(payment.amount, payment.currency)}
          </InfoRow>
          <InfoRow icon="pi pi-calendar" label="Período">
            {payment.payrollPeriod?.name ?? "Sin período"}
          </InfoRow>
          <InfoRow
            icon="pi pi-check-circle"
            label="Pagado"
            detail={payment.paidDate ? undefined : "Aún no se ha hecho"}
          >
            {payment.paidDate ? formatDateTime(payment.paidDate) : "—"}
          </InfoRow>
          {(payment.breakdown?.ruleName || calculation.length > 0) && (
            <InfoRow
              icon="pi pi-calculator"
              label={payment.breakdown?.ruleName ?? "Cálculo"}
              detail={calculation.join(" · ") || undefined}
            />
          )}
          {payment.notes && (
            <InfoRow icon="pi pi-comment" label="Notas" detail={payment.notes} />
          )}
          <InfoRow icon="pi pi-clock" label="Registrado">
            {formatDateTime(payment.createdAt)}
          </InfoRow>
        </ul>
        {payment.sale?.id && (
          <div className="flex justify-content-end mt-3">
            <Button
              label={`Ver la venta #${payment.sale.id}`}
              icon="pi pi-shopping-cart"
              severity="secondary"
              onClick={() => setSaleId(payment.sale.id)}
            />
          </div>
        )}
      </Dialog>
      {saleId && <SaleDetailForm saleId={saleId} onHide={() => setSaleId(null)} />}
    </>
  );
}
