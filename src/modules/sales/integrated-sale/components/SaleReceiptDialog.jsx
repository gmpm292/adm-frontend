import { useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Message } from "primereact/message";
import { usePrinting } from "../../../printing/printing.module";
import {
  PAYMENT_METHOD_LABELS,
  formatMoney,
} from "../../../statistics/format";
import { formatDate } from "../../../../utils/dateUtils";

/** Resumen de la venta recién cobrada, con el cambio y la opción de imprimirla */
export function SaleReceiptDialog({
  sale,
  change,
  sellerName,
  storeName,
  onNewSale,
}) {
  const { printTicket, isPrinting } = usePrinting();
  const [printError, setPrintError] = useState(null);
  const currency = sale.totalAmountCurrency;

  const handlePrint = async () => {
    setPrintError(null);
    try {
      const printed = await printTicket({
        tienda: storeName,
        numeroVenta: sale.invoiceNumber ?? String(sale.id),
        fecha: formatDate(sale.effectiveDate),
        productos: sale.details.map((detail) => ({
          nombre: detail.product.name,
          cantidad: detail.quantity,
          precio: detail.unitPrice,
          moneda: detail.currency,
        })),
        total: sale.totalAmount,
        moneda: currency,
        cliente: sale.customer?.fullName,
        vendedor: sellerName ?? "",
      });
      if (!printed) throw new Error();
    } catch {
      setPrintError(
        "No se pudo imprimir. Comprueba que QZ Tray está abierto y la impresora configurada.",
      );
    }
  };

  return (
    <Dialog
      header="Venta cobrada"
      visible
      onHide={onNewSale}
      className="w-full md:w-30rem"
      modal
    >
      <div className="pos-receipt">
        <span className="pos-receipt__icon">
          <i className="pi pi-check" />
        </span>
        <h2 className="pos-receipt__title">
          {formatMoney(sale.totalAmount, currency)}
        </h2>
        <span className="text-color-secondary">
          Factura {sale.invoiceNumber}
          {sale.customer?.fullName ? ` · ${sale.customer.fullName}` : ""}
        </span>

        <ul className="pos-receipt__list">
          {sale.details.map((detail) => (
            <li key={detail.id}>
              <span>
                {detail.quantity} × {detail.product.name}
              </span>
              <span className="font-medium white-space-nowrap">
                {formatMoney(detail.subtotal, detail.currency)}
              </span>
            </li>
          ))}
          {(sale.payments ?? []).map((payment, index) => (
            <li key={`payment-${index}`}>
              <span className="text-color-secondary">
                Recibido · {PAYMENT_METHOD_LABELS[payment.paymentMethod]}
              </span>
              <span className="white-space-nowrap">
                {formatMoney(payment.amount, payment.currency)}
              </span>
            </li>
          ))}
        </ul>

        {change > 0 && (
          <div className="pos-balance pos-balance--ok w-full">
            <span>Cambio a devolver</span>
            <span className="pos-balance__amount">
              {formatMoney(change, currency)}
            </span>
          </div>
        )}

        {printError && (
          <Message severity="warn" text={printError} className="w-full" />
        )}

        <div className="flex justify-content-end gap-2 w-full">
          <Button
            label="Imprimir ticket"
            icon="pi pi-print"
            severity="secondary"
            outlined
            loading={isPrinting}
            onClick={handlePrint}
          />
          <Button
            label="Nueva venta"
            icon="pi pi-plus"
            onClick={onNewSale}
            autoFocus
          />
        </div>
      </div>
    </Dialog>
  );
}
