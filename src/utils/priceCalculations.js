/**
 * Calcula el margen comercial basado en precio de costo y precio de venta
 * @param {number} costPrice - Precio de costo
 * @param {number} salePrice - Precio de venta
 * @returns {number} Margen comercial en porcentaje (0-100)
 */
export const calculateMarginFromPrices = (costPrice, salePrice) => {
  if (!costPrice || !salePrice || costPrice <= 0 || salePrice <= 0) {
    return 0;
  }
  return Number((((salePrice - costPrice) / salePrice) * 100).toFixed(2));
};

/**
 * Calcula el precio de venta basado en precio de costo y margen comercial
 * @param {number} costPrice - Precio de costo
 * @param {number} margin - Margen comercial en porcentaje (0-100)
 * @returns {number} Precio de venta calculado
 */
export const calculateSalePriceFromMargin = (costPrice, margin) => {
  if (!costPrice || costPrice <= 0 || margin === null || margin === undefined) {
    return costPrice || 0;
  }
  return Number((costPrice / (1 - margin / 100)).toFixed(2));
};

/**
 * Calcula el precio total basado en cantidad y precio unitario
 * @param {number} quantity - Cantidad
 * @param {number} unitPrice - Precio unitario
 * @returns {number} Precio total
 */
export const calculateTotalPrice = (quantity, unitPrice) => {
  if (!quantity || !unitPrice) return 0;
  return Number((quantity * unitPrice).toFixed(2));
};
