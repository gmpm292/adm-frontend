/** Guías de ventas, cobros, devoluciones y clientes */
export const salesGuides = [
  {
    id: "venta-integrada",
    title: "Vender desde la Venta Integrada",
    summary:
      "La forma habitual de vender: eliges los productos, cobras en el momento y entregas el ticket.",
    routes: ["/sales/integrated-sale"],
    before: [
      "Tu usuario tiene que tener una oficina (la tienda donde vendes) y estar vinculado a un trabajador en Nómina › Trabajadores.",
      "Los productos deben tener precio en alguna moneda activa y existencias en un inventario de esa oficina.",
    ],
    steps: [
      {
        text: "Abre la Venta Integrada. A la izquierda está el catálogo de la tienda y a la derecha el ticket («Venta actual»).",
        path: "/sales/integrated-sale",
      },
      {
        text: "Busca con «Buscar producto» o filtra por categoría. Cada toque en una tarjeta suma una unidad; la tarjeta indica cuántas quedan («Quedan N», «Agotado»).",
      },
      {
        text: "En el ticket, ajusta las cantidades con + y − o quita una línea con la X. Las líneas marcadas en rojo (sin existencias, por debajo del mínimo...) hay que corregirlas antes de cobrar.",
      },
      {
        text: "Opcional: elige el cliente (sin cliente, la venta es de un «Cliente ocasional»), los publicistas y, si se entrega a domicilio, activa «Lleva mensajería».",
      },
      {
        text: "Si tienes mando, comprueba el vendedor en «Selecciona el vendedor». Un agente siempre vende a su nombre.",
      },
      {
        text: "Pulsa «Cobrar». En «Cobrar venta» indica lo recibido (en una o varias monedas) y pulsa «Confirmar cobro».",
      },
      {
        text: "En «Venta cobrada» se ve el cambio a devolver. Pulsa «Imprimir ticket» si hace falta y después «Nueva venta».",
      },
    ],
    notes: [
      "Si «Cobrar» está desactivado, debajo se indica el motivo (falta el vendedor, falta el mensajero, productos sin moneda común...).",
      "El ticket solo se imprime desde la ventana «Venta cobrada», justo después de cobrar. Para imprimir hace falta QZ Tray abierto en el equipo.",
      "Si sale «Stock insuficiente», otro vendedor se llevó el producto mientras tanto: el catálogo se recarga solo; revisa las cantidades.",
      "Si quieres reservar los productos y cobrar más tarde, usa «Guardar borrador» en lugar de «Cobrar».",
    ],
    related: ["cobro-varias-monedas", "borradores", "ventas-en-espera", "mensajeria"],
  },
  {
    id: "cobro-varias-monedas",
    title: "Cobrar en una o varias monedas",
    summary:
      "Cómo se reparte un cobro entre monedas y formas de pago y cómo se calcula el cambio.",
    routes: ["/sales/integrated-sale", "/sales/sales"],
    steps: [
      {
        text: "En «Cobrar venta» arriba aparece el «Total a cobrar» y su equivalente en las otras monedas posibles.",
      },
      {
        text: "El primer pago viene con el importe exacto, en «Efectivo» y en la moneda de la venta. Cambia el importe, la moneda o la forma de pago («Efectivo», «Tarjeta», «Transferencia», «Otro») si hace falta.",
      },
      {
        text: "Para pagar una parte en otra moneda, pulsa «Añadir otro pago»: llega ya con lo que falta. El botón «=» de un pago pone justo lo que falta.",
      },
      {
        text: "Abajo se indica «Falta por cobrar», «Cambio a devolver» o «Importe exacto». «Confirmar cobro» se activa cuando no falta nada.",
      },
    ],
    notes: [
      "Cada pago cubre la parte que le corresponde según el precio del producto en esa moneda, así que se puede cobrar parte en CUP y parte en USD.",
      "Solo se ofrecen las monedas que aceptan todos los productos del carrito.",
      "El cambio se calcula en la moneda de la venta.",
      "Si sale «No hay tasa de cambio configurada», falta la tasa de esa moneda en Nomencladores › Monedas.",
    ],
    related: ["venta-integrada", "borradores"],
  },
  {
    id: "borradores",
    title: "Guardar un borrador y cobrarlo después",
    summary:
      "Apartar productos para un cliente (quedan reservados) y cobrar la venta más tarde desde Ventas.",
    routes: ["/sales/integrated-sale", "/sales/sales"],
    steps: [
      {
        text: "En la Venta Integrada, prepara el ticket y pulsa «Guardar borrador». Los productos quedan reservados y nadie más puede venderlos.",
        path: "/sales/integrated-sale",
      },
      {
        text: "Para cobrarlo, ve a Ventas y filtra «Todos los estados» → «Borrador».",
        path: "/sales/sales",
      },
      {
        text: "En la fila del borrador pulsa el icono de cartera («Cobrar») y completa el mismo diálogo «Cobrar venta».",
      },
      {
        text: "Antes de cobrar puedes cambiar el cliente y la mensajería con el lápiz («Cliente y mensajería») o los productos con el icono de lista («Cambiar productos»).",
      },
      {
        text: "Si el cliente ya no lo quiere, pulsa «Cancelar venta»: la reserva se suelta y los productos vuelven a estar disponibles.",
      },
    ],
    notes: [
      "Un borrador con mensajería se puede guardar sin mensajero, pero no se cobra hasta asignarlo.",
      "Una venta cobrada no se cancela: se devuelve.",
      "Cambiar los productos de un borrador depende del rol: si no ves el icono «Cambiar productos» o alguno de sus botones, pídeselo a tu responsable.",
    ],
    related: ["venta-integrada", "devoluciones"],
  },
  {
    id: "ventas-en-espera",
    title: "Poner una venta en espera",
    summary:
      "Apartar un momento el ticket en curso para atender a otro cliente, sin reservar productos.",
    routes: ["/sales/integrated-sale"],
    steps: [
      {
        text: "Con productos en el ticket, pulsa «En espera» (en el ticket). El ticket queda vacío para atender a otra persona.",
        path: "/sales/integrated-sale",
      },
      {
        text: "Para retomarla, pulsa «En espera» en la cabecera (indica cuántas hay) y luego «Retomar». Si había una venta en curso, esa pasa a espera; no se pierde.",
      },
      {
        text: "Para tirar una venta apartada, pulsa la papelera («Descartar»).",
      },
    ],
    notes: [
      "Las ventas en espera solo se guardan en este navegador y este equipo: no se ven desde otro.",
      "No reservan existencias: al retomarlas se vuelve a comprobar si quedan. Para reservar, usa «Guardar borrador».",
    ],
    related: ["borradores"],
  },
  {
    id: "mensajeria",
    title: "Ventas con entrega a domicilio",
    summary:
      "Asignar un mensajero a una venta y seguir las entregas pendientes.",
    routes: ["/sales/integrated-sale", "/sales/deliveries"],
    before: [
      "Los mensajeros son trabajadores de tipo «Mensajero» de la oficina (Nómina › Trabajadores).",
    ],
    steps: [
      {
        text: "En el ticket de la Venta Integrada activa «Lleva mensajería», elige el mensajero en «Selecciona el mensajero» y escribe la dirección en «Dirección e indicaciones de la entrega».",
        path: "/sales/integrated-sale",
      },
      {
        text: "Cobra la venta como siempre, o guárdala como borrador si aún no sabes quién la lleva.",
      },
      {
        text: "En Mensajerías ves solo las ventas con entrega. Filtra por «Por cobrar», «Cobradas» o «Sin mensajero».",
        path: "/sales/deliveries",
      },
      {
        text: "Para asignar o cambiar el mensajero, pulsa el camión («Mensajería») o el lápiz en la fila. Para cobrar un borrador, la cartera («Cobrar»).",
      },
    ],
    notes: [
      "Una venta con mensajería no se cobra sin mensajero.",
      "El mensajero y las indicaciones se pueden cambiar también en una venta ya cobrada; el cliente, solo en un borrador.",
    ],
    related: ["borradores", "venta-integrada"],
  },
  {
    id: "devoluciones",
    title: "Devolver una venta (total o parcial)",
    summary:
      "Cuando el cliente devuelve productos de una venta cobrada: vuelven al inventario y se restan de los ingresos.",
    routes: ["/sales/sales", "/sales/sale-details", "/sales/deliveries"],
    before: [
      "Solo se devuelven ventas «Confirmada» o «Devolución parcial».",
      "Pueden devolver los roles Super, Principal, Administrador y Gerente.",
    ],
    steps: [
      {
        text: "En Ventas, busca la venta (por número de factura o cliente) y pulsa el ojo («Ver venta y devoluciones»).",
        path: "/sales/sales",
      },
      {
        text: "Para devolverla entera, pulsa «Devolver la venta» (o «Devolver el resto» si ya hubo una devolución parcial) y confirma con «Devolver».",
      },
      {
        text: "Para devolver un solo producto, pulsa el icono de deshacer de su línea («Devolver este producto») y confirma. Se devuelve la línea entera.",
      },
      {
        text: "Las líneas devueltas quedan marcadas «Devuelto» y la venta pasa a «Devolución parcial» o «Devolución total».",
      },
    ],
    notes: [
      "Una venta cobrada no se cancela ni se elimina: siempre se devuelve.",
      "Los productos vuelven a su inventario. Si ese inventario se eliminó, entran en otro inventario activo del producto.",
      "Las comisiones de esa venta se deshacen: las pendientes se borran y las ya pagadas se compensan con un descuento en el período abierto.",
      "También puedes abrir la ficha desde Detalles de Venta con el ojo («Ver la venta»).",
    ],
    related: ["consultar-ventas"],
  },
  {
    id: "clientes",
    title: "Registrar y consultar clientes",
    summary:
      "Dar de alta clientes, ver su historial de compras y elegirlos al vender.",
    routes: ["/sales/customers", "/sales/integrated-sale"],
    steps: [
      {
        text: "En Clientes pulsa «Nuevo cliente»: «Nombre» es obligatorio; teléfono (con código del país), «Carné de identidad» y correo son opcionales. Guarda con «Guardar cliente».",
        path: "/sales/customers",
      },
      {
        text: "Con el ojo («Ver ficha y compras») ves sus datos, el «Total comprado» y su «Historial de compras».",
      },
      {
        text: "Al vender, en el ticket busca al cliente por nombre, carné o teléfono. Si no existe, el botón «Nuevo cliente» junto al buscador lo crea sin salir de la venta.",
        path: "/sales/integrated-sale",
      },
    ],
    notes: [
      "Teléfono, correo y carné no se repiten dentro de la empresa: si sale «Ya hay un cliente con...», búscalo en lugar de crearlo.",
      "Los clientes son de cada tienda (oficina).",
      "Eliminar un cliente conserva sus ventas; se puede restaurar después.",
    ],
  },
  {
    id: "consultar-ventas",
    title: "Consultar ventas y productos vendidos",
    summary:
      "Dónde buscar una venta, ver su estado y qué productos se han vendido.",
    routes: ["/sales/sales", "/sales/sale-details"],
    steps: [
      {
        text: "Ventas lista todas las ventas con su estado: «Borrador», «Confirmada», «Cancelada», «Devolución parcial» y «Devolución total». Busca por número de factura o cliente y filtra con «Todos los estados».",
        path: "/sales/sales",
      },
      {
        text: "El ojo de cada fila abre la ficha: cliente, vendedor, pagos recibidos y productos.",
      },
      {
        text: "Detalles de Venta muestra una línea por producto vendido, con cantidad, precio, importe y estado («Reservado», «Vendido», «Cancelado», «Devuelto»).",
        path: "/sales/sale-details",
      },
    ],
    notes: [
      "Un agente solo ve sus propias ventas y los productos de ellas.",
      "Solo se eliminan ventas canceladas o devueltas por completo; se pueden restaurar después (rol Super).",
    ],
    related: ["devoluciones"],
  },
];
