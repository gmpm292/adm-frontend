/** Textos y formatos compartidos por las pantallas de inventario */

export { formatMoney, formatDateTime } from "../sales/format";

export const MOVEMENT_TYPE = {
  IN: { label: "Entrada", severity: "success", icon: "pi pi-arrow-down" },
  OUT: { label: "Salida", severity: "danger", icon: "pi pi-arrow-up" },
};

/** Motivo de cada movimiento, los manuales y los que pone el sistema */
export const MOVEMENT_REASON = {
  PURCHASE: "Compra a proveedor",
  RETURN: "Devolución de un cliente",
  TRANSFER: "Traslado",
  INVENTORY_ADJUSTMENT: "Ajuste por conteo",
  LOSS: "Pérdida o rotura",
  INTERNAL_USE: "Uso interno",
  OTHER: "Otro motivo",
  INITIAL_INVENTORY: "Existencias iniciales",
  SALE_RESERVATION: "Reserva para una venta",
  SALE_CONFIRMED: "Venta",
  SALE_CANCELLATION: "Venta cancelada",
  SALE_REFUND: "Devolución de una venta",
  DELIVERY_RESERVATION: "Reserva para mensajería",
  DELIVERY_CANCELLATION: "Mensajería cancelada",
  DELIVERY_RETURN: "Devolución de mensajería",
  // Datos antiguos, de antes de limitar los motivos manuales
  SALE: "Venta",
};

/** Los que se registran a mano; el backend rechaza el resto */
export const MANUAL_REASONS = {
  IN: ["PURCHASE", "RETURN", "TRANSFER", "INVENTORY_ADJUSTMENT", "OTHER"],
  OUT: ["LOSS", "INTERNAL_USE", "TRANSFER", "INVENTORY_ADJUSTMENT", "OTHER"],
};

export const reasonLabel = (reason) => MOVEMENT_REASON[reason] ?? reason;

/** Movimientos que causó una venta: su referencia es el número de venta */
export const isSaleMovement = (movement) =>
  movement.reason?.startsWith("SALE_") ||
  movement.reason?.startsWith("DELIVERY_");

/** Texto de la referencia de un movimiento: la venta o la nota escrita */
export const movementReference = (movement) => {
  if (!movement.referenceId) return null;
  return isSaleMovement(movement)
    ? `Venta #${movement.referenceId}`
    : movement.referenceId;
};

/** Estado de las existencias de un inventario */
export const stockStatus = ({ currentStock, minStock }) => {
  if (currentStock <= 0) return { label: "Agotado", severity: "danger" };
  if (minStock && currentStock <= minStock) {
    return { label: "Por reponer", severity: "warning" };
  }
  return { label: "Disponible", severity: "success" };
};

/** Cantidad con su unidad de medida: «12 g», «3 u» */
export const formatQuantity = (quantity, unit) =>
  `${new Intl.NumberFormat("es-ES").format(quantity ?? 0)}${
    unit?.symbol ? ` ${unit.symbol}` : ""
  }`;

/** Nombre de la persona que registró algo */
export const personName = (user) =>
  user ? [user.name, user.lastName].filter(Boolean).join(" ") : null;

/** Dónde está un inventario: «Vitrina principal · Tienda Central» */
export const inventoryPlace = (inventory) =>
  [inventory?.location, inventory?.office?.name].filter(Boolean).join(" · ") ||
  "Sin ubicación";
