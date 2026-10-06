/** Textos y formatos compartidos por las pantallas de ventas */

export { SALE_STATUS, PAYMENT_METHOD_LABELS, formatMoney } from "../statistics/format";

export const SALE_DETAIL_STATUS = {
  DRAFT: { label: "Reservado", severity: "warning" },
  CONFIRMED: { label: "Vendido", severity: "success" },
  CANCELLED: { label: "Cancelado", severity: "danger" },
  REFUNDED: { label: "Devuelto", severity: "info" },
};

/** Ventas ya cobradas: se pueden devolver, no cancelar ni eliminar */
export const isPaid = (sale) =>
  sale.saleStatus === "CONFIRMED" || sale.saleStatus === "PARTIALLY_REFUNDED";

/** Nombre de un trabajador, tenga usuario o solo sus datos provisionales */
export const workerName = (worker) => {
  if (!worker) return null;
  const fromUser = [worker.user?.name, worker.user?.lastName]
    .filter(Boolean)
    .join(" ");
  const fromTemp = [worker.tempFirstName, worker.tempLastName]
    .filter(Boolean)
    .join(" ");
  return fromUser || fromTemp || `Trabajador #${worker.id}`;
};

/** Fecha corta con hora: "06/10/2026, 16:40" */
export const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

/** Cómo se nombra una venta: su factura o, si aún no tiene, su número */
export const saleLabel = (sale) => sale.invoiceNumber || `Borrador #${sale.id}`;
