// Mensajes del backend que llegan en inglés (validaciones) y su texto
const KNOWN_MESSAGES = [
  [
    /must be a valid phone number/i,
    "El teléfono debe llevar el código del país, por ejemplo +5351234567",
  ],
  [/must be an email/i, "El correo no es válido"],
  [/Forbidden resource/i, "No tienes permiso para realizar esta acción"],
  [/Failed to fetch|NetworkError/i, "No se pudo conectar con el servidor"],
];

/** Texto para mostrar al usuario a partir de un error de Apollo */
export function getErrorMessage(
  error,
  fallback = "Ocurrió un error inesperado",
) {
  let message =
    error?.graphQLErrors?.[0]?.message ??
    error?.networkError?.message ??
    error?.message;

  // Las validaciones del backend llegan como lista
  if (Array.isArray(message)) message = message.join(". ");
  if (!message) return fallback;

  const known = KNOWN_MESSAGES.find(([pattern]) => pattern.test(message));
  return known ? known[1] : String(message);
}
