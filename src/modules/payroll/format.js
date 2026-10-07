/** Textos y formatos compartidos por las pantallas de nómina */

export {
  formatMoney,
  formatDateTime,
  workerName,
} from "../sales/format";

/** Tipo de trabajador (enum `WorkerType` del backend) */
export const WORKER_TYPE = {
  AGENT: "Agente de ventas",
  PUBLICIST: "Publicista",
  COURIER: "Mensajero",
  ECONOMIC: "Económico",
  ADMINISTRATIVE: "Administrativo",
  SERVICE: "Servicios",
  TECHNICIAN: "Técnico",
  OPERATIVE: "Operario",
  COMMUNITY_MANAGER: "Gestor de redes",
  SUPERVISOR: "Supervisor",
  MANAGER: "Gerente",
  PRINCIPAL: "Dirección",
  OTHER: "Otro",
};

export const WORKER_TYPE_OPTIONS = Object.entries(WORKER_TYPE).map(
  ([value, label]) => ({ value, label }),
);

export const workerTypeLabel = (type) => WORKER_TYPE[type] ?? type ?? "—";

/** Teléfono y correo: los de su cuenta si la tiene, si no los suyos */
export const workerContact = (worker) =>
  [
    worker.user?.mobile ?? worker.tempPhone,
    worker.user?.email ?? worker.tempEmail,
  ].filter(Boolean);

/** Días de la semana en el orden de `WorkDays` */
export const WEEK_DAYS = [
  { key: "monday", label: "Lunes", short: "Lun" },
  { key: "tuesday", label: "Martes", short: "Mar" },
  { key: "wednesday", label: "Miércoles", short: "Mié" },
  { key: "thursday", label: "Jueves", short: "Jue" },
  { key: "friday", label: "Viernes", short: "Vie" },
  { key: "saturday", label: "Sábado", short: "Sáb" },
  { key: "sunday", label: "Domingo", short: "Dom" },
];

/** Días laborables en corto: «Lun a Vie», «Lun, Mié, Vie» */
export const workingDaysText = (days) => {
  if (!days) return "—";
  const on = WEEK_DAYS.map((day) => !!days[day.key]);
  const count = on.filter(Boolean).length;
  if (count === 0) return "Ninguno";
  if (count === 7) return "Todos los días";
  const first = on.indexOf(true);
  const last = on.lastIndexOf(true);
  const consecutive = last - first + 1 === count;
  if (consecutive && count > 2) {
    return `${WEEK_DAYS[first].short} a ${WEEK_DAYS[last].short}`;
  }
  return WEEK_DAYS.filter((_, i) => on[i])
    .map((day) => day.short)
    .join(", ");
};

/** Fecha sin hora: «07/10/2026» */
export const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";

/**
 * Días de calendario. Se guardan a mediodía UTC para que ningún desfase
 * horario los mueva al día anterior o al siguiente.
 */
export const dayToApi = (date) =>
  date
    ? new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12),
      ).toISOString()
    : null;

/** El día que guarda la API, como `Date` local para un Calendar */
export const dayFromApi = (value) => {
  if (!value) return null;
  const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day);
};

/** Fecha de un día guardado: «07/10/2026» */
export const formatDay = (value) => formatDate(dayFromApi(value));

/** Estados de asistencia (enum `AttendanceStatus`, en minúsculas) */
export const ATTENDANCE_STATUS = {
  present: { label: "Presente", severity: "success" },
  late: { label: "Llegó tarde", severity: "warning" },
  early_departure: { label: "Salió antes", severity: "warning" },
  absent: { label: "Ausente", severity: "danger" },
  vacation: { label: "Vacaciones", severity: "info" },
  sick_leave: { label: "Baja médica", severity: "info" },
};

export const ATTENDANCE_STATUS_OPTIONS = Object.entries(ATTENDANCE_STATUS).map(
  ([value, { label }]) => ({ value, label }),
);

/** «08:30:00» → «08:30» */
export const formatTime = (time) => (time ? String(time).slice(0, 5) : "—");

/** Hora local actual como «08:30» */
export const currentTime = () =>
  new Date().toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

/** Horas trabajadas: «8,5 h» */
export const formatHours = (hours) =>
  `${new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 }).format(
    Number(hours) || 0,
  )} h`;

/** Día de hoy en el calendario local, a las 00:00 */
export const today = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

/** «2026-10-07»: el día como lo filtra el backend */
export const dayKey = (date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

/** Conceptos de un pago (enum `PaymentConcept`) */
export const PAYMENT_CONCEPT = {
  SALARY: "Salario",
  COMMISSION: "Comisión",
  BONUS: "Bonificación",
  DISCOUNT: "Descuento",
  OTHER: "Otro",
};

/** Cómo se pagó (enum `PaymentMethod` de nómina) */
export const PAYROLL_PAYMENT_METHOD = {
  CASH: "Efectivo",
  BANK_TRANSFER: "Transferencia",
  CHECK: "Cheque",
  MOBILE_PAYMENT: "Pago móvil",
  OTHER: "Otro",
};

export const optionsOf = (labels) =>
  Object.entries(labels).map(([value, label]) => ({ value, label }));

/**
 * Suma por moneda, nunca entre monedas: [{ currency, amount }]. Un descuento
 * resta.
 */
export const totalsByCurrency = (payments = []) => {
  const totals = new Map();
  for (const payment of payments) {
    const sign = payment.paymentConcept === "DISCOUNT" ? -1 : 1;
    totals.set(
      payment.currency,
      (totals.get(payment.currency) ?? 0) + sign * Number(payment.amount),
    );
  }
  return [...totals].map(([currency, amount]) => ({ currency, amount }));
};

/** «1.200,00 CUP · 50,00 USD» */
export const formatTotals = (totals) =>
  totals.length
    ? totals.map((t) => formatMoneyText(t.amount, t.currency)).join(" · ")
    : "—";

const formatMoneyText = (amount, currency) =>
  `${new Intl.NumberFormat("es", {
    useGrouping: "always",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount ?? 0)} ${currency}`;

/** Período como rango de días: «06/10/2026 – 12/10/2026» */
export const periodRange = (period) =>
  period ? `${formatDate(period.startDate)} – ${formatDate(period.endDate)}` : "—";

/** Tipos de regla de pago, con lo que hacen en el cálculo */
export const PAYMENT_TYPE = {
  FIXED_AMOUNT: {
    label: "Importe fijo",
    hint: "Lo mismo en cada período, haya ventas o no.",
  },
  PERCENTAGE: {
    label: "Porcentaje de lo vendido",
    hint: "Un porcentaje del importe de cada venta.",
  },
  PRICE_RANGE: {
    label: "Según el precio del producto",
    hint: "Un importe o porcentaje por unidad, según el tramo de precio del producto.",
  },
  SALE_QUANTITY: {
    label: "Según las unidades vendidas",
    hint: "Por unidad, y más a medida que se venden más en el período.",
  },
};

export const PAYMENT_TYPE_OPTIONS = Object.entries(PAYMENT_TYPE).map(
  ([value, { label, hint }]) => ({ value, label, hint }),
);

/** Tipos que se calculan venta a venta */
export const SALE_PAYMENT_TYPES = ["PERCENTAGE", "PRICE_RANGE", "SALE_QUANTITY"];

/** Ámbito: en un importe fijo multiplica; en un reparto, entre quiénes */
export const SCOPE_FIXED = {
  BUSINESS: "Una vez por período",
  OFFICE: "Por cada oficina de la empresa",
  DEPARTMENT: "Por cada departamento de la empresa",
  TEAM: "Por cada equipo de la empresa",
};
export const SCOPE_SHARED = {
  BUSINESS: "Entre los de toda la empresa",
  OFFICE: "Entre los de la oficina de la venta",
  DEPARTMENT: "Entre los del departamento del vendedor",
  TEAM: "Entre los del equipo del vendedor",
};

const pct = (value) =>
  `${new Intl.NumberFormat("es", { maximumFractionDigits: 2 }).format(value)} %`;
const money = (amount, currency) => formatMoneyText(amount, currency);

/** Resumen de lo que paga una regla: «10 % de lo vendido» */
export const ruleSummary = (rule) => {
  const c = rule.conditions ?? {};
  const cur = rule.paymentCurrency;
  switch (rule.paymentType) {
    case "FIXED_AMOUNT":
      return c.fixedAmount ? money(c.fixedAmount.amount, cur) : "—";
    case "PERCENTAGE":
      return c.percentage ? `${pct(c.percentage.percentage)} de lo vendido` : "—";
    case "PRICE_RANGE":
      return `${c.priceRanges?.length ?? 0} tramos de precio`;
    case "SALE_QUANTITY":
      return `${c.saleQuantity?.length ?? 0} escalones de cantidad`;
    default:
      return "—";
  }
};
