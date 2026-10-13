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

/**
 * Datos del vale de una venta para `printTicket`. Las líneas devueltas o
 * canceladas salen marcadas; el total es el de la venta.
 */
export const saleTicket = (sale, { storeName, sellerName } = {}) => ({
  tienda: storeName,
  numeroVenta: saleLabel(sale),
  fecha: formatDateTime(sale.effectiveDate ?? sale.createdAt),
  productos: (sale.details ?? []).map((detail) => ({
    nombre:
      detail.saleDetailStatus === "REFUNDED" ||
      detail.saleDetailStatus === "CANCELLED"
        ? `${detail.product?.name} (${SALE_DETAIL_STATUS[detail.saleDetailStatus].label.toLowerCase()})`
        : detail.product?.name,
    cantidad: detail.quantity,
    precio: detail.unitPrice ?? 0,
    moneda: detail.currency ?? sale.totalAmountCurrency ?? "",
  })),
  total: sale.totalAmount ?? 0,
  moneda: sale.totalAmountCurrency ?? "",
  cliente: sale.customer?.fullName,
  vendedor: sellerName ?? workerName(sale.salesWorker) ?? "",
});
