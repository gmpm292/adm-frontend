// utils/printFormatters.js
export const formatMovementForPrint = (movementData) => {
  const lines = [
    "********************************",
    "    MOVIMIENTO DE INVENTARIO",
    "********************************",
    `N°: ${movementData.numeroMovimiento}`,
    `Fecha: ${movementData.fecha}`,
    `Tipo: ${movementData.tipo}`,
    `Cantidad: ${movementData.cantidad}`,
    `Motivo: ${movementData.motivo}`,
    "********************************",
    "      ¡Operación exitosa!",
    "********************************",
  ];

  return {
    type: "MOVEMENT",
    content: lines.map((line) => line + "\n"),
    config: {
      cutAfterPrint: true,
      copies: 1,
    },
  };
};

export const formatMovementDetailsForPrint = (movement, inventory) => {
  const lines = [
    "********************************",
    "    DETALLE DE MOVIMIENTO",
    "********************************",
    `N°: ${movement.id}`,
    `Fecha: ${new Date(movement.createdAt).toLocaleString()}`,
    `Tipo: ${movement.type === "IN" ? "ENTRADA" : "SALIDA"}`,
    `Cantidad: ${movement.quantity}`,
    `Motivo: ${movement.reason}`,
    "--------------------------------",
    "PRODUCTO:",
    `Nombre: ${inventory?.product?.name || "N/A"}`,
    `Código: ${inventory?.product?.id || "N/A"}`,
    `Ubicación: ${inventory?.location || "N/A"}`,
    "--------------------------------",
    `Stock anterior: ${inventory?.currentStock - movement.quantity}`,
    `Stock actual: ${inventory?.currentStock}`,
    "********************************",
    "   ¡Movimiento registrado!",
    "********************************",
  ];

  return {
    type: "MOVEMENT_DETAIL",
    content: lines.map((line) => line + "\n"),
    config: {
      cutAfterPrint: true,
      copies: 1,
    },
  };
};
