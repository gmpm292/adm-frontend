// Utilidades para formatear datos para tickets

export const formatSaleData = (venta) => {
  return {
    ticketId: venta.id.toString().padStart(6, "0"),
    fecha: new Date(venta.fecha).toLocaleString("es-MX"),
    cajero: {
      nombre: venta.cajero?.nombre || "SISTEMA",
      id: venta.cajero?.id,
    },
    productos: venta.productos.map((p) => ({
      nombre: p.nombre,
      cantidad: p.cantidad,
      precioUnitario: p.precio,
      total: p.cantidad * p.precio,
    })),
    subtotal: venta.subtotal,
    impuestos: venta.impuestos,
    total: venta.total,
    formaPago: venta.formaPago,
    efectivo: venta.efectivo,
    cambio: venta.cambio,
    empresa: {
      nombre: "MI TIENDA S.A. de C.V.",
      direccion: "Av. Principal #123, Ciudad",
      telefono: "555-123-4567",
      rfc: "MTI120304XYZ",
    },
  };
};

export const formatCashCutData = (corte) => {
  return {
    fecha: new Date().toLocaleString("es-MX"),
    cajero: {
      nombre: corte.cajero?.nombre || "SISTEMA",
    },
    resumenVentas: [
      { tipo: "Efectivo", monto: corte.efectivo || 0 },
      { tipo: "Tarjeta", monto: corte.tarjeta || 0 },
      { tipo: "Transferencia", monto: corte.transferencia || 0 },
    ],
    total: corte.total,
  };
};

export const formatReturnData = (devolucion) => {
  return {
    ticketOriginal: devolucion.ticketOriginal,
    fecha: new Date().toLocaleString("es-MX"),
    producto: {
      nombre: devolucion.producto.nombre,
      cantidad: devolucion.producto.cantidad,
    },
    motivo: devolucion.motivo,
    total: devolucion.total,
  };
};

export const formatPreSaleData = (preVenta) => {
  return {
    cliente: {
      nombre: preVenta.cliente?.nombre || "CLIENTE GENERAL",
    },
    fechaApartado: new Date(preVenta.fechaApartado).toLocaleString("es-MX"),
    fechaVencimiento: new Date(preVenta.fechaVencimiento).toLocaleString(
      "es-MX"
    ),
    productos: preVenta.productos,
    anticipo: preVenta.anticipo,
    total: preVenta.total,
    saldo: preVenta.total - preVenta.anticipo,
  };
};
