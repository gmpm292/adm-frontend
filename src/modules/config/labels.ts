// Textos de los grupos y claves que define el backend
// (backend-configurations.helper.ts). Lo que no está aquí se muestra tal cual.

export const SECRET_MASK = "••••••••";

export const CATEGORY_LABELS = {
  GENERAL: { label: "General", severity: "info" },
  SECURITY: { label: "Seguridad", severity: "danger" },
  FRONTEND: { label: "Aplicación web", severity: "warning" },
  SYSTEM: { label: "Sistema", severity: "success" },
};

export const GROUP_LABELS = {
  FRONTEND_URLs: "Direcciones de la aplicación web",
  QZ_Tray_Configuration: "Impresión térmica (QZ Tray)",
  SECURITY_JWT: "Duración de las sesiones",
  Logs: "Registros del sistema",
  "Email-General": "Correo: datos generales",
  "Email-OAuth2": "Correo: cuenta de Google",
  "Email-SMTP": "Correo: servidor SMTP",
  "Telegram-API": "Telegram: API",
  "Telegram-Bots": "Telegram: bots",
  "Telegram-WEBHOOK": "Telegram: webhook",
};

export const KEY_HINTS = {
  FRONTEND_BASE_URL: "Dirección pública de la aplicación web",
  FRONTEND_CHANGE_PASSWORD_URL:
    "Enlace de los correos para fijar la contraseña. Termina en /#/change-password",
  QZ_PRIVATE_KEY: "Clave privada en formato PEM",
  QZ_PUBLIC_KEY: "Certificado público en formato PEM",
  ACCESS_TOKEN_EXPIRE_IN: "Segundos que dura el acceso antes de renovarse",
  REFRESH_TOKEN_EXPIRE_IN: "Segundos que dura una sesión sin actividad",
  CONFIRMATION_TOKEN_EXPIRE_IN:
    "Segundos que vale un enlace para fijar la contraseña",
  DAYS_TO_PRESERVE_LOGS: "Días que se guardan los registros",
  EMAIL_PROVIDER: "gmail_oauth2 (cuenta de Google) o smtp",
  FROM: "Nombre del remitente",
  FROM_EMAIL: "Dirección del remitente",
  EMAIL_USER:
    "Cuenta que envía. Con Google tiene que ser la misma que se autoriza",
  EMAIL_TEST_ON_STARTUP: "Enviar un correo de prueba al arrancar el servidor",
  EMAIL_TEST_RECIPIENT: "A quién se envía el correo de prueba",
  ENCRYPTION_KEY:
    "Cifra el token de Google guardado. Si cambia, hay que volver a autorizar la cuenta",
  EMAIL_REDIRECT_URI:
    "Dirección a la que Google vuelve tras autorizar: la pantalla Correo de la aplicación",
  TELEGRAM_BOTS: 'Objeto JSON: { "nombre": "token del bot" }',
};
