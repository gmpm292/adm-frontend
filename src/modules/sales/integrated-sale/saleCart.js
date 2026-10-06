/**
 * Estado y cuentas de la venta en curso. Los precios definitivos los da el
 * backend (`quoteSale` y el cobro); lo de aquí es para responder al instante.
 */

export const EMPTY_CART = {
  // Identificador de la venta en espera de la que se retomó, si viene de una
  parkedId: null,
  lines: [],
  customer: null,
  sellerId: null,
  publicistIds: [],
  hasDelivery: false,
  deliveryWorkerId: null,
  deliveryNotes: "",
};

export function cartReducer(cart, action) {
  switch (action.type) {
    case "add": {
      const line = cart.lines.find((l) => l.productId === action.productId);
      if (!line) {
        return {
          ...cart,
          lines: [...cart.lines, { productId: action.productId, quantity: 1 }],
        };
      }
      if (line.quantity >= action.stock) return cart;
      return {
        ...cart,
        lines: cart.lines.map((l) =>
          l === line ? { ...l, quantity: l.quantity + 1 } : l,
        ),
      };
    }
    case "quantity":
      return {
        ...cart,
        lines: cart.lines.map((l) =>
          l.productId === action.productId
            ? { ...l, quantity: action.quantity }
            : l,
        ),
      };
    case "remove":
      return {
        ...cart,
        lines: cart.lines.filter((l) => l.productId !== action.productId),
      };
    case "set":
      return { ...cart, ...action.values };
    case "load":
      return { ...EMPTY_CART, ...action.cart };
    case "reset":
      return { ...EMPTY_CART, sellerId: action.sellerId ?? null };
    default:
      return cart;
  }
}

export const round2 = (value) => Math.round(value * 100) / 100;

/** Identifica el contenido del carrito, para saber a cuál responde una cotización */
export const linesKey = (lines) =>
  lines.map((line) => `${line.productId}x${line.quantity}`).join(",");

/**
 * Total por moneda con los precios del catálogo. Solo cuentan las monedas que
 * aceptan todos los productos: en las demás la venta no puede cobrarse entera.
 */
export function estimateTotals(lines) {
  const totals = new Map();
  for (const { product, quantity } of lines) {
    for (const price of product.prices) {
      const current = totals.get(price.currency) ?? { total: 0, lines: 0 };
      current.total += price.unitPrice * quantity;
      current.lines += 1;
      totals.set(price.currency, current);
    }
  }
  return [...totals.entries()]
    .filter(([, value]) => value.lines === lines.length)
    .map(([currency, value]) => ({ currency, total: round2(value.total) }));
}

/**
 * Lo cobrado frente al precio. Cada moneda tiene su propio precio, así que un
 * pago cubre la fracción `importe / precio en su moneda` (igual que el backend).
 */
export function settle(totals, currency, payments) {
  const totalOf = (code) => totals.find((t) => t.currency === code)?.total ?? 0;
  const total = totalOf(currency);
  const covered = payments.reduce((sum, payment) => {
    const totalInCurrency = totalOf(payment.currency);
    return totalInCurrency > 0
      ? sum + (payment.amount || 0) / totalInCurrency
      : sum;
  }, 0);
  const paid = round2(covered * total);

  return {
    total,
    paid,
    pending: round2(Math.max(total - paid, 0)),
    change: round2(Math.max(paid - total, 0)),
  };
}

/** Importe que completa el cobro con el pago `index`, en la moneda de ese pago */
export function amountToComplete(totals, payments, index) {
  const totalOf = (code) => totals.find((t) => t.currency === code)?.total ?? 0;
  const covered = payments.reduce((sum, payment, i) => {
    const totalInCurrency = totalOf(payment.currency);
    return i !== index && totalInCurrency > 0
      ? sum + (payment.amount || 0) / totalInCurrency
      : sum;
  }, 0);
  const remaining = Math.max(1 - covered, 0) * totalOf(payments[index].currency);
  // Hacia arriba: un céntimo de menos dejaría la venta sin cubrir
  return Math.ceil(round2(remaining * 100)) / 100;
}
