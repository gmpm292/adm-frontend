import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const LOCALE = "es";

/** Importe con su moneda, por ejemplo "1.840.200,00 CUP" */
export const formatMoney = (amount, currency) =>
  `${new Intl.NumberFormat(LOCALE, {
    useGrouping: "always",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount ?? 0)}${currency ? ` ${currency}` : ""}`;

/** Importe abreviado para ejes de gráficos: 1,8 M, 25 mil */
export const formatCompact = (amount) =>
  new Intl.NumberFormat(LOCALE, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount ?? 0);

export const formatNumber = (value) =>
  new Intl.NumberFormat(LOCALE, {
    useGrouping: "always",
    maximumFractionDigits: 3,
  }).format(
    value ?? 0
  );

/** Etiqueta de un punto de la serie: "5 oct" o "oct 2026" */
export const formatSeriesLabel = (period, granularity) =>
  granularity === "month"
    ? format(parseISO(`${period}-01`), "MMM yyyy", { locale: es })
    : format(parseISO(period), "d MMM", { locale: es });

/** Día del calendario del usuario en formato YYYY-MM-DD */
export const toCalendarDay = (date) => format(date, "yyyy-MM-dd");

/**
 * Variación porcentual frente al periodo anterior; null si no hay con qué
 * comparar
 */
export const getChange = (current, previous) =>
  previous > 0 ? ((current - previous) / previous) * 100 : null;

export const formatChange = (change) =>
  `${change > 0 ? "+" : ""}${new Intl.NumberFormat(LOCALE, {
    maximumFractionDigits: 1,
  }).format(change)} %`;

export const PAYMENT_METHOD_LABELS = {
  CASH: "Efectivo",
  CARD: "Tarjeta",
  TRANSFER: "Transferencia",
  OTHER: "Otro",
};

export const SALE_STATUS = {
  CONFIRMED: { label: "Confirmada", severity: "success" },
  DRAFT: { label: "Borrador", severity: "warning" },
  CANCELLED: { label: "Cancelada", severity: "danger" },
  PARTIALLY_REFUNDED: { label: "Devolución parcial", severity: "info" },
  FULLY_REFUNDED: { label: "Devolución total", severity: "info" },
};

export const ATTENDANCE_LABELS = {
  present: "Presente",
  late: "Tarde",
  absent: "Ausente",
  early_departure: "Salida anticipada",
  vacation: "Vacaciones",
  sick_leave: "Licencia médica",
};
