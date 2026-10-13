/** Guías de nómina: trabajadores, asistencia, reglas, períodos y pagos */
export const payrollGuides = [
  {
    id: "alta-trabajador",
    title: "Dar de alta un trabajador y su horario",
    summary:
      "Quién vende, reparte o cobra nómina. Su tipo decide qué reglas de pago se le aplican.",
    routes: ["/payroll/workers", "/payroll/work-schedules"],
    before: [
      "La oficina donde trabaja ya creada. Dan de alta Super, Principal y Administrador.",
      "Si va a entrar en la aplicación (por ejemplo, para vender), su cuenta se crea antes en Usuarios.",
    ],
    steps: [
      {
        text: "En Trabajadores pulsa «Nuevo trabajador». En «Persona» escribe el nombre y el contacto, o vincula su cuenta en «Cuenta en la aplicación».",
        path: "/payroll/workers",
      },
      {
        text: "En «Trabajo» elige el «Tipo de trabajador» («Agente de ventas», «Publicista», «Mensajero»...) y, si quieres, el «Salario base».",
      },
      {
        text: "En «Dónde trabaja» elige la «Oficina» (la tienda) y, opcionalmente, el departamento. Guarda con «Guardar trabajador».",
      },
      {
        text: "En Horarios pulsa «Nuevo horario»: nombre, fechas «Desde» y «Hasta» y los «Días laborables». Deja la «Oficina» vacía si vale para toda la empresa.",
        path: "/payroll/work-schedules",
      },
    ],
    notes: [
      "Un vendedor necesita su cuenta vinculada al trabajador para poder vender en la Venta Integrada.",
      "El «Salario base» es informativo: lo que se paga cada período sale de las reglas de pago de tipo «Importe fijo».",
      "El horario decide qué días se abre el registro de asistencia. Sin horario se entiende que trabaja; los domingos nunca se abre.",
    ],
    related: ["crear-usuarios", "asistencia", "reglas-pago"],
  },
  {
    id: "asistencia",
    title: "Anotar la asistencia del día",
    summary:
      "Entrada y salida de cada trabajador. Influye en el reparto de comisiones entre los presentes.",
    routes: ["/payroll/attendance"],
    steps: [
      {
        text: "Cada madrugada el sistema abre el registro del día de cada trabajador como «Ausente». Abre Asistencia: muestra hoy.",
        path: "/payroll/attendance",
      },
      {
        text: "Cuando llega, pulsa «Registrar la entrada ahora» en su fila: pasa a «Presente» con la hora actual.",
      },
      {
        text: "Cuando se va, pulsa «Registrar la salida ahora»: se calculan las horas trabajadas.",
      },
      {
        text: "Para corregir horas u otro día, usa las flechas o el calendario y el botón «Editar». Si falta un registro, créalo con «Nuevo registro».",
      },
    ],
    notes: [
      "En las comisiones que se reparten, solo cuentan quienes ese día están «Presente» o «Llegó tarde».",
      "Un trabajador tiene un solo registro por día y no se anotan días futuros.",
      "Un registro marcado como pagado ya no se edita ni se elimina.",
    ],
    related: ["alta-trabajador", "reglas-pago"],
  },
  {
    id: "reglas-pago",
    title: "Definir cómo cobra cada trabajador (reglas de pago)",
    summary:
      "Importes fijos por período y comisiones por venta, según el tipo de trabajador.",
    routes: ["/payroll/payment-rules"],
    before: [
      "Las monedas en que se paga. Crean y editan reglas Super, Principal y Administrador.",
    ],
    steps: [
      {
        text: "Pulsa «Nueva regla», escribe el «Nombre» y elige «Cómo se paga» y la «Moneda».",
        path: "/payroll/payment-rules",
      },
      {
        text: "«Importe fijo»: lo mismo cada período, haya ventas o no (salarios). «Porcentaje de lo vendido»: un porcentaje de cada venta. «Según el precio del producto»: un importe o porcentaje por unidad según tramos de precio. «Según las unidades vendidas»: más por unidad cuantas más se venden en el período.",
      },
      {
        text: "En «Quién cobra» elige el «Tipo de trabajador» y, si quieres limitarla, «Trabajadores específicos». En las comisiones de agentes y publicistas, «De cada venta cobra» decide si cobra quien vendió o se reparte entre todos.",
      },
      {
        text: "En «Cuánto» completa el importe, el porcentaje, los tramos o los escalones. En las comisiones puedes limitarla a un producto o una categoría. Guarda con «Guardar regla».",
      },
    ],
    notes: [
      "Solo cuentan las líneas vendidas: las devueltas o canceladas no generan pago.",
      "Fuera de todos los tramos de precio, o por debajo del primer escalón de cantidad, no se paga (esas unidades sí cuentan para llegar al mínimo).",
      "Nunca se mezclan monedas: los precios se miden en la moneda de la regla. En «Según el precio del producto» se eligen dos: la «Moneda de la venta», en la que se miden los tramos, y la «Moneda de pago», en la que cobra el trabajador; un porcentaje se convierte con la tasa de cambio.",
      "Las reglas se aplican al calcular el período; cambiar una regla no toca lo ya pagado.",
    ],
    related: ["periodo-nomina"],
  },
  {
    id: "periodo-nomina",
    title: "Calcular, pagar y cerrar un período de nómina",
    summary:
      "El ciclo completo: crear el período, calcular lo que corresponde a cada trabajador, pagarlo y cerrarlo.",
    routes: ["/payroll/payroll-periods", "/payroll/worker-payments"],
    before: [
      "Trabajadores y reglas de pago definidos. Calculan y cierran Super, Principal y Administrador.",
    ],
    steps: [
      {
        text: "En Períodos pulsa «Nuevo período». Propone la semana pasada; un período dura como mucho 31 días y no se solapa con otro.",
        path: "/payroll/payroll-periods",
      },
      {
        text: "Cuando el período termine, ábrelo con el ojo («Ver, calcular y cerrar») y pulsa «Calcular pagos»: se calculan los importes fijos y las comisiones venta a venta.",
      },
      {
        text: "Revisa en «Por trabajador» lo que corresponde a cada uno. Si después cambian ventas o reglas, pulsa «Volver a calcular»: solo rehace lo que no está pagado.",
      },
      {
        text: "Paga a los trabajadores y pulsa «Marcar pagados». También se pueden marcar uno a uno en Pagos con «Marcar como pagado».",
        path: "/payroll/worker-payments",
      },
      {
        text: "Con todo pagado, pulsa «Cerrar período». Un período cerrado ya no se calcula ni se modifica.",
        path: "/payroll/payroll-periods",
      },
    ],
    notes: [
      "«Calcular pagos» y «Cerrar período» se activan cuando el período ha terminado.",
      "Si cambias el importe de una regla de «Importe fijo», su pago pendiente no se actualiza al volver a calcular: corrígelo o elimínalo en Pagos.",
      "Las fechas de un período con pagos ya no se cambian.",
      "Si se devuelve una venta, sus comisiones pendientes se borran y las ya pagadas se compensan con un descuento en el período abierto.",
    ],
    related: ["reglas-pago", "pagos-manuales"],
  },
  {
    id: "pagos-manuales",
    title: "Registrar salarios, bonificaciones y descuentos a mano",
    summary:
      "Pagos que no salen de las reglas: una bonificación puntual, un descuento o un salario extra.",
    routes: ["/payroll/worker-payments"],
    before: ["Un período abierto que cubra el pago."],
    steps: [
      {
        text: "En Pagos pulsa «Registrar pago» y elige el «Trabajador» y el «Período».",
        path: "/payroll/worker-payments",
      },
      {
        text: "Elige el «Concepto» («Salario», «Bonificación», «Descuento» u «Otro»), «Cómo se paga» y el «Importe» con su moneda. Un descuento se resta de lo que cobra.",
      },
      {
        text: "Guarda con «Registrar pago». Cuando lo entregues, pulsa «Marcar como pagado».",
      },
    ],
    notes: [
      "Las comisiones no se registran a mano: las calcula el período.",
      "El selector «Pendientes» / «Pagados» / «Todos» filtra la lista.",
      "Un pago ya hecho, o de un período cerrado, no se corrige ni se elimina.",
    ],
    related: ["periodo-nomina"],
  },
];
