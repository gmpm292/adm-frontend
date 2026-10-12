/** Guías de configuración del sistema (solo rol Super) */
export const settingsGuides = [
  {
    id: "configurar-correo",
    title: "Configurar el envío de correos",
    summary:
      "Sin correo no llegan los enlaces para crear o recuperar contraseñas ni los avisos de alta.",
    routes: ["/system/email", "/configurations"],
    before: ["Una cuenta de Google desde la que se enviarán los correos."],
    steps: [
      {
        text: "En Configuraciones, edita «Correo: datos generales»: actívalo y pon EMAIL_PROVIDER = gmail_oauth2, el remitente (FROM, FROM_EMAIL) y en EMAIL_USER la cuenta de Google que envía.",
        path: "/configurations",
      },
      {
        text: "Edita y activa también «Correo: cuenta de Google».",
      },
      {
        text: "En Correo, pestaña «Conexión», pulsa «Autorizar con Google» y entra con esa misma cuenta.",
        path: "/system/email",
      },
      {
        text: "Al volver, el estado debe decir «Se pueden enviar correos».",
      },
    ],
    notes: [
      "La cuenta que autorizas en Google tiene que ser la de EMAIL_USER; si no coincide, la autorización se rechaza.",
      "También se puede enviar por un servidor SMTP: EMAIL_PROVIDER = smtp y los datos en «Correo: servidor SMTP».",
      "En «Envíos y estadísticas» se ven los correos enviados y fallidos; «Reintentar fallidos» los vuelve a mandar.",
      "En «Direcciones de la aplicación web», FRONTEND_CHANGE_PASSWORD_URL debe terminar en /#/change-password para que los enlaces de los correos funcionen.",
    ],
    related: ["configuraciones"],
  },
  {
    id: "impresion",
    title: "Preparar la impresión de tickets (QZ Tray)",
    summary:
      "Los tickets de venta y los comprobantes de inventario se imprimen en impresoras térmicas a través de QZ Tray.",
    routes: ["/system/printing", "/configurations"],
    before: [
      "QZ Tray instalado en cada equipo que imprime, con una impresora por defecto.",
    ],
    steps: [
      {
        text: "En Configuraciones, grupo «Impresión térmica (QZ Tray)», pega el certificado público y la clave privada (formato PEM).",
        path: "/configurations",
      },
      {
        text: "En Impresión pulsa «Descargar» para obtener el certificado (certificate.txt).",
        path: "/system/printing",
      },
      {
        text: "En cada equipo: abre QZ Tray, entra en Advanced → Site Manager, pulsa + y elige el archivo descargado.",
      },
      {
        text: "Pulsa «Imprimir prueba» para comprobarlo.",
      },
    ],
    notes: [
      "Si falla, comprueba que QZ Tray está abierto, que confía en el certificado y que hay una impresora por defecto.",
      "El ticket de una venta se imprime desde la ventana «Venta cobrada», justo después de cobrar.",
    ],
  },
  {
    id: "configuraciones",
    title: "Ajustar las configuraciones del sistema",
    summary:
      "Valores que usa el servidor, agrupados: duración de las sesiones, correo, impresión, direcciones...",
    routes: ["/configurations"],
    steps: [
      {
        text: "En Configuraciones pulsa «Editar valores» en el grupo que quieras cambiar.",
        path: "/configurations",
      },
      {
        text: "Cambia los valores. Los secretos llegan ocultos: deja el campo vacío para conservar el guardado.",
      },
      {
        text: "Guarda con «Guardar cambios». Se aplica al momento, sin reiniciar nada.",
      },
    ],
    notes: [
      "Si desactivas un grupo, el servidor usa los valores de su archivo de entorno (.env).",
      "En «Duración de las sesiones» los tiempos van en segundos.",
      "Los grupos los define el sistema: aquí no se crean ni se eliminan.",
    ],
  },
  {
    id: "permisos",
    title: "Permisos por operación y niveles de acceso",
    summary:
      "Cambiar qué roles pueden hacer cada operación y qué registros ve cada empresa.",
    routes: ["/system/security/role-guards", "/system/security/scoped-access"],
    steps: [
      {
        text: "En Permisos busca la operación y pulsa «Cambiar roles». Elige los roles en «Roles que pueden usarla» y deja una «Nota» con el motivo. El rol Super siempre se conserva.",
        path: "/system/security/role-guards",
      },
      {
        text: "Para deshacerlo, pulsa «Volver a los roles del código».",
      },
      {
        text: "En Niveles de acceso pulsa «Nuevo nivel», elige la «Empresa», la «Operación» y «Qué registros ve el usuario» («Su empresa», «Su oficina», «Lo que creó o modificó»...).",
        path: "/system/security/scoped-access",
      },
    ],
    notes: [
      "Mientras no se personalice, cada operación usa los roles y el nivel que trae el sistema.",
      "Las operaciones marcadas «No comprueba roles» no se pueden personalizar.",
      "«Lo relacionado con él» aún no está disponible: si es el único nivel elegido, se deniega el acceso.",
    ],
  },
];
