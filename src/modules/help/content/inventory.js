/** Guías de nomencladores, productos, inventarios y movimientos */
export const inventoryGuides = [
  {
    id: "nomencladores",
    title: "Preparar monedas, unidades, categorías y materiales",
    summary:
      "Lo que hay que tener listo antes de crear el primer producto.",
    routes: [
      "/payroll/currencies",
      "/inventory/units-of-measure",
      "/inventory/categories",
      "/payroll/material-costs",
    ],
    before: [
      "Monedas y unidades son comunes a todas las empresas y solo las cambia el rol Super.",
      "Categorías y materiales son de cada empresa (no de una oficina); los crean Super y Principal.",
    ],
    steps: [
      {
        text: "Monedas: con «Nueva moneda» indica el «Código» de 3 letras (USD), nombre, símbolo y la «Tasa»: cuántos CUP vale 1 unidad. CUP es la referencia y vale siempre 1.",
        path: "/payroll/currencies",
      },
      {
        text: "Unidades de medida: con «Nueva unidad» crea las que uses (unidad, kilogramo, metro...) con su nombre y símbolo.",
        path: "/inventory/units-of-measure",
      },
      {
        text: "Categorías: con «Nueva categoría» agrupa los productos (por ejemplo, Anillos). Todo producto necesita una.",
        path: "/inventory/categories",
      },
      {
        text: "Costos de materiales (opcional): con «Nuevo material» registra materiales con su unidad y costo; un producto hecho con un material calcula su costo solo.",
        path: "/payroll/material-costs",
      },
    ],
    notes: [
      "El código de una moneda no se cambia después. Para dejar de usarla, desactívala (no se puede mientras la acepten productos).",
      "Al cambiar la tasa de una moneda, los precios que no son fijos se calculan con la nueva tasa en las ventas siguientes; las ventas ya hechas conservan su precio.",
      "Una categoría con productos no se elimina: pasa antes sus productos a otra. Una unidad o un material en uso no se elimina: desactívalo.",
    ],
    related: ["crear-producto"],
  },
  {
    id: "crear-producto",
    title: "Crear un producto con sus precios",
    summary:
      "Dar de alta lo que se vende: costo, precio en cada moneda, reglas de venta y dónde se vende.",
    routes: ["/inventory/products"],
    before: [
      "Una categoría, una unidad de medida activa y las monedas en que se vende.",
      "Crean y editan productos Super, Principal y Administrador.",
    ],
    steps: [
      {
        text: "Pulsa «Nuevo producto». En «Datos del producto» elige la «Categoría», escribe el «Nombre» y la «Unidad de medida».",
        path: "/inventory/products",
      },
      {
        text: "En «Costo y precio» indica el «Costo» y el «Precio de venta», cada uno con su moneda. Si escribes un «Margen», el precio se calcula solo. Si eliges un «Material», el costo sale de él.",
      },
      {
        text: "En «Cobro en otras monedas» marca en «Monedas aceptadas» en qué otras monedas se puede cobrar. Su precio se calcula con la tasa de cambio, salvo que pongas un «Precio fijo».",
      },
      {
        text: "Opcional: en «Reglas de venta», cantidades mínima y máxima por venta y descuentos por cantidad; en «Características», talla, color, etc.",
      },
      {
        text: "Si el producto viene en varias tallas, colores o medidas, en «Tallas, colores u otras variantes» escribe en «Qué cambia» (Talla) y en «Valores» cada una (1, 2, 3...). Se crea un producto por valor, «Anillo de Compromiso · Talla 1», «· Talla 2»..., con todo lo demás igual.",
      },
      {
        text: "En «Inventario» marca las «Oficinas» donde se va a vender: se abre allí su inventario vacío (el de cada variante). Guarda con «Guardar producto».",
      },
      {
        text: "Mete las existencias desde «Cargar o enviar» (varios productos a la vez) o con «Registrar entrada» en Inventarios.",
        path: "/inventory/sheet",
      },
    ],
    notes: [
      "El nombre no se repite dentro de una categoría, contando los productos eliminados: si sale que hay uno eliminado con ese nombre, restáuralo.",
      "Un producto solo aparece en la Venta Integrada si tiene precio en una moneda activa y un inventario en esa oficina.",
      "La ficha («Ver ficha») muestra los precios en cada moneda y las existencias por ubicación.",
      "Cada variante es un producto: lleva sus propias existencias, se carga en «Cargar o enviar» y se vende por separado. Para añadir otra talla más adelante, crea de nuevo el producto con el mismo nombre y solo la talla nueva; si una ya existe, no se crea ninguna. Cambiar el precio de una no cambia las demás.",
    ],
    related: ["nomencladores", "abrir-inventario", "movimientos"],
  },
  {
    id: "abrir-inventario",
    title: "Abrir un inventario en otra oficina o ubicación",
    summary:
      "Un inventario son las existencias de un producto en un lugar concreto de una oficina (vitrina, almacén...).",
    routes: ["/inventory/inventories"],
    before: ["El producto ya creado. Abren inventarios Super, Principal y Administrador."],
    steps: [
      {
        text: "En Inventarios pulsa «Nuevo inventario» y elige el «Producto» y la «Oficina».",
        path: "/inventory/inventories",
      },
      {
        text: "Opcional: «Ubicación» (dónde se guarda dentro de la oficina) y «Existencias mínimas»: al llegar a esa cantidad se marca «Por reponer».",
      },
      {
        text: "Si ya tienes la mercancía, escribe las «Existencias iniciales»: entran como un movimiento de entrada. Pulsa «Abrir inventario».",
      },
    ],
    notes: [
      "Hay un solo inventario por producto, oficina y ubicación.",
      "Las existencias no se editan a mano: «Editar ubicación y mínimo» solo cambia esos dos datos. Para corregir cantidades se registra un movimiento.",
      "Un inventario solo se elimina con existencias a cero; su historial se conserva.",
    ],
    related: ["movimientos"],
  },
  {
    id: "movimientos",
    title: "Registrar entradas, salidas, ajustes y traslados",
    summary:
      "Las existencias solo cambian con movimientos: compras, pérdidas, conteos o traslados entre lugares.",
    routes: ["/inventory/inventories", "/inventory/movements"],
    before: ["Registran movimientos Super, Principal y Administrador."],
    steps: [
      {
        text: "En Inventarios, en la fila del producto, pulsa «Registrar entrada» o «Registrar salida». También puedes hacerlo desde Movimientos con «Registrar movimiento», eligiendo el inventario.",
        path: "/inventory/inventories",
      },
      {
        text: "Escribe la «Cantidad»: debajo se ve cuánto quedará.",
      },
      {
        text: "Elige el «Motivo». Entradas: «Compra a proveedor», «Devolución de un cliente», «Traslado», «Ajuste por conteo», «Otro motivo». Salidas: «Pérdida o rotura», «Uso interno», «Traslado», «Ajuste por conteo», «Otro motivo».",
      },
      {
        text: "En una entrada, «Referencia o nota» es opcional (la factura del proveedor, de dónde viene). En una salida la «Nota» es obligatoria: a quién se entrega o para qué. Marca «Imprimir comprobante» si lo necesitas y pulsa «Registrar entrada» o «Registrar salida».",
      },
      {
        text: "Para pasar un producto de una ubicación a otra que ya existe (de «Almacén» a «Vitrina»), pulsa las flechas («Trasladar a otro inventario») en la fila, o «Trasladar» en Movimientos. Para llevar mercancía a otra oficina, o varios productos a la vez, usa «Cargar o enviar».",
        path: "/inventory/sheet",
      },
      {
        text: "El historial completo está en Movimientos; con «Ver detalle» ves cada uno y, si vino de una venta, «Ver la venta».",
        path: "/inventory/movements",
      },
    ],
    notes: [
      "Un ajuste por conteo físico es una entrada o salida con el motivo «Ajuste por conteo», por la diferencia.",
      "Un traslado entre inventarios son dos movimientos «Traslado entre inventarios»: una salida en el origen y una entrada en el destino, registradas a la vez. Solo entre inventarios de la misma empresa.",
      "El motivo «Traslado» a mano queda para lo que entra o sale hacia fuera de la empresa.",
      "Las ventas, reservas y devoluciones mueven el inventario solas; esos motivos no se eligen a mano.",
      "Los movimientos no se editan ni se eliminan: un error se corrige con otro movimiento en sentido contrario.",
      "Las existencias nunca quedan en negativo: no se puede sacar más de lo que hay.",
    ],
    related: ["cargar-o-enviar", "abrir-inventario", "eliminar-producto"],
  },
  {
    id: "cargar-o-enviar",
    title: "Cargar existencias o enviarlas a otra oficina, varios productos a la vez",
    summary:
      "Una hoja con todos los productos de la empresa: escribes las cantidades y guardas todo junto.",
    routes: ["/inventory/sheet", "/inventory/inventories"],
    before: [
      "Los productos ya creados: son de toda la empresa y cada oficina tiene sus propias existencias.",
      "Lo usan Super, Principal y Administrador. El administrador de una tienda carga y envía solo desde la suya, a cualquier otra oficina de su empresa.",
    ],
    steps: [
      {
        text: "En Inventario abre «Cargar o enviar» (o «Cargar o enviar varios» en Inventarios). Super y Principal eligen la «Oficina»; el administrador ve la suya.",
        path: "/inventory/sheet",
      },
      {
        text: "Para meter mercancía elige «Cargar existencias» y el «Motivo»: «Existencias iniciales» para el primer conteo, «Compra a proveedor» para lo que llega, etc. En «Nota» puedes poner la factura.",
      },
      {
        text: "Para llevar mercancía a otra oficina elige «Enviar a otra oficina» y la oficina en «Hacia». La tabla muestra lo que hay aquí y lo que hay allí.",
      },
      {
        text: "Escribe la cantidad en la columna de la derecha de cada producto que quieras (busca por nombre arriba de la tabla). Abajo se ve cuántos productos y unidades llevas.",
      },
      {
        text: "Pulsa «Guardar entrada» o «Enviar a…». Si algo falla (por ejemplo, no hay tanto de un producto), no se guarda nada y se avisa de qué falló.",
      },
    ],
    notes: [
      "Si un producto nunca estuvo en la oficina, aparece como «No está en esta oficina» y se abre su inventario al guardar. Al enviar, si no estaba en el destino, se abre allí con la misma ubicación que en el origen.",
      "Cada envío deja en Movimientos una salida en el origen («Hacia…») y una entrada en el destino («Desde…») por producto, con el motivo «Traslado entre inventarios».",
      "Si un producto tiene varias ubicaciones en la oficina (vitrina, almacén...), sale una línea por cada una.",
    ],
    related: ["movimientos", "abrir-inventario"],
  },
  {
    id: "eliminar-producto",
    title: "Eliminar o restaurar un producto o inventario",
    summary: "Qué hace falta para retirar un producto y cómo recuperarlo.",
    routes: ["/inventory/products", "/inventory/inventories"],
    before: ["Eliminan Super y Principal; restaura solo Super."],
    steps: [
      {
        text: "Deja las existencias a cero con una salida (por ejemplo «Otro motivo» o «Traslado»).",
        path: "/inventory/inventories",
      },
      {
        text: "En Productos pulsa «Eliminar producto»: se eliminan también sus inventarios vacíos. Sus ventas y movimientos se conservan.",
        path: "/inventory/products",
      },
      {
        text: "Para recuperarlo, activa «Mostrar registros eliminados» y pulsa «Restaurar producto»: vuelve con sus inventarios.",
      },
    ],
    notes: [
      "Si la categoría del producto está eliminada, restaura antes la categoría.",
      "Un inventario suelto se elimina igual desde Inventarios («Eliminar inventario»), también con existencias a cero.",
    ],
  },
];
