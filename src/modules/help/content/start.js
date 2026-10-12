/** Guías de puesta en marcha, cuenta propia y estadísticas */
export const startGuides = [
  {
    id: "puesta-en-marcha",
    title: "Preparar la estructura de la empresa",
    summary:
      "Orden en que se crea la empresa y sus niveles (oficina, departamento y equipo) antes de dar de alta a las personas.",
    routes: [
      "/company/business",
      "/company/office",
      "/company/department",
      "/company/team",
    ],
    before: [
      "Las empresas solo las crea el rol Super. Oficinas: Super y Principal. Departamentos: también Administrador. Equipos: también Gerente.",
    ],
    steps: [
      {
        text: "Crea la empresa con «Nueva empresa»: «Nombre» es obligatorio; «NIT», teléfono, correo y dirección son opcionales. Guarda con «Crear empresa».",
        path: "/company/business",
      },
      {
        text: "Crea sus oficinas o sucursales con «Nueva oficina»: elige la «Empresa» (solo Super la elige; los demás crean en la suya), el «Tipo» («Oficina» o «Sucursal») y el «Nombre». Cada oficina es una tienda: tiene sus propios productos en inventario, clientes y ventas.",
        path: "/company/office",
      },
      {
        text: "Dentro de cada oficina, crea los departamentos con «Nuevo departamento» («Ventas», «Economía» o «Administración»).",
        path: "/company/department",
      },
      {
        text: "Dentro de cada departamento, crea los equipos con «Nuevo equipo» («Ventas», «Operaciones», «Entregas», «Trabajo de campo» o «Publicidad y marketing»).",
        path: "/company/team",
      },
      {
        text: "Con la estructura lista, crea los usuarios: cada rol exige su lugar en ella.",
        path: "/users",
      },
    ],
    notes: [
      "El nombre no se repite dentro del mismo nivel superior (dos oficinas de una empresa no pueden llamarse igual).",
      "Al editar, el nivel superior no se cambia (sale con la ayuda «No se puede cambiar»): si una unidad está en el sitio equivocado, se crea de nuevo en el correcto.",
      "Solo se elimina una unidad vacía, sin niveles inferiores ni usuarios. Para restaurarla, su nivel superior no puede estar eliminado.",
      "Para ver lo eliminado y restaurarlo, activa el interruptor «Mostrar registros eliminados» de la tabla.",
    ],
    related: ["crear-usuarios"],
  },
  {
    id: "crear-usuarios",
    title: "Crear usuarios y asignar roles",
    summary:
      "Dar acceso a una persona: su rol decide qué ve y en qué parte de la empresa trabaja.",
    routes: ["/users"],
    before: [
      "Solo el rol Super administra usuarios.",
      "La empresa, oficina, departamento y equipo que exija el rol ya deben existir.",
      "Para que la persona reciba el enlace y cree su contraseña, el correo del sistema tiene que estar configurado (si no, asígnale tú la contraseña).",
    ],
    steps: [
      {
        text: "Pulsa «Nuevo usuario» y completa «Nombre», «Correo» (con él inicia sesión) y «Teléfono» con el código del país, por ejemplo +5351234567.",
        path: "/users",
      },
      {
        text: "Elige el «Rol». Debajo aparecen los lugares que exige: Principal, la empresa; Administrador, también la oficina; Gerente, también el departamento; Supervisor y Agente, también el equipo.",
      },
      {
        text: "Guarda con «Crear usuario». La cuenta nace inactiva y la persona recibe un correo para crear su contraseña; al hacerlo, se activa.",
      },
      {
        text: "Si el correo no llega o no está configurado, usa el botón «Contraseña» de la fila → «Asignar una contraseña» (mínimo 8 caracteres) o «Enviar enlace por correo» para mandarlo otra vez.",
      },
      {
        text: "Para desactivar una cuenta o cambiarle el rol, usa «Editar usuario»: el interruptor «Estado» y el campo «Rol».",
      },
    ],
    notes: [
      "Si la persona va a vender o cobrar nómina, créale también su ficha en Nómina › Trabajadores y vincúlale esta cuenta en «Cuenta en la aplicación»: sin eso no puede vender en la Venta Integrada.",
      "Nadie puede eliminarse, desactivarse ni cambiarse el rol a sí mismo.",
      "Desactivar, eliminar o cambiar la contraseña de una cuenta cierra sus sesiones abiertas.",
      "Para exigir el segundo paso al entrar, usa el botón «Verificación en dos pasos» de la fila → «Exigir verificación en dos pasos». «Restablecer dispositivo» obliga a emparejar el teléfono de nuevo (por ejemplo, si lo perdió).",
    ],
    related: ["puesta-en-marcha", "alta-trabajador", "configurar-correo"],
  },
  {
    id: "mi-cuenta",
    title: "Mi cuenta: contraseña y verificación en dos pasos",
    summary:
      "Cambiar tu contraseña, activar el código del teléfono al entrar y recuperar el acceso si olvidaste la contraseña.",
    routes: ["/profile"],
    steps: [
      {
        text: "Abre «Mi perfil» desde tu nombre, arriba a la derecha. En «Información Personal» puedes corregir tus datos y pulsar «Guardar Cambios».",
        path: "/profile",
      },
      {
        text: "Para cambiar la contraseña, ve a la pestaña «Seguridad», tarjeta «Cambiar contraseña»: escribe la «Contraseña actual» y la nueva dos veces (mínimo 8 caracteres) y pulsa «Cambiar contraseña».",
      },
      {
        text: "Para activar la verificación en dos pasos, en «Seguridad» pulsa «Activar», escanea el código QR con una aplicación de autenticación (Google Authenticator, Microsoft Authenticator, Authy), escribe el código de 6 dígitos que muestra y pulsa «Activar».",
      },
      {
        text: "Desde entonces, al entrar se pide ese código después de la contraseña. Para quitarla, pulsa «Desactivar» y confirma con un código.",
      },
    ],
    notes: [
      "¿Olvidaste la contraseña? En la pantalla de entrada pulsa «¿Olvidaste tu contraseña?», escribe tu correo y abre el enlace que recibes. El enlace caduca y solo vale el último que pediste. Si no llega, revisa el correo no deseado o pide a un administrador que te asigne una.",
      "Si perdiste el teléfono con la aplicación de autenticación, un administrador debe restablecer tu dispositivo desde Usuarios.",
      "Solo puede haber una sesión abierta por cuenta: si entras en otro equipo, la sesión anterior se cierra.",
      "Tu rol y tu lugar en la empresa no se cambian aquí: los cambia un administrador.",
    ],
  },
  {
    id: "estadisticas",
    title: "Leer el resumen y el reporte de ventas",
    summary:
      "Qué muestran las pantallas del Panel Principal y cómo elegir el periodo y la moneda.",
    routes: ["/statistics/analytics", "/statistics/sales"],
    steps: [
      {
        text: "«Resumen» muestra los ingresos del periodo, su evolución y lo que «Requiere atención»: existencias bajas, ventas en borrador y pagos pendientes a trabajadores.",
        path: "/statistics/analytics",
      },
      {
        text: "Elige el periodo arriba: «Hoy», «7 días», «30 días», «Este mes», «Este año» o «Personalizado» (marca las dos fechas en el calendario).",
      },
      {
        text: "Si se vende en varias monedas, elige en qué moneda ver los importes. Por defecto sale la más usada.",
      },
      {
        text: "El reporte de ventas detalla productos más vendidos, ventas por categoría y por vendedor, mejores clientes y métodos de pago.",
        path: "/statistics/sales",
      },
    ],
    notes: [
      "Cuentan como ingreso las ventas cobradas («Confirmada» o «Devolución parcial»), restando lo devuelto. Borradores, canceladas y devueltas por completo no suman.",
      "Los importes de monedas distintas nunca se suman: cada moneda se mira por separado.",
      "Cada persona ve los datos de su ámbito (su empresa, oficina, departamento o equipo). Solo el rol Super ve todas las empresas y puede filtrar por una.",
      "Los periodos de más de 92 días se agrupan por mes en lugar de por día.",
    ],
  },
];
