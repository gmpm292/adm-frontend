// Mensajes del backend que llegan en inglés (validaciones) y su texto
const KNOWN_MESSAGES = [
  [
    /must be a valid phone number/i,
    "El teléfono debe llevar el código del país, por ejemplo +5351234567",
  ],
  [/must be an email/i, "El correo no es válido"],
  [
    /email of this user already exists, but/i,
    "Ese correo pertenece a un usuario eliminado: restáuralo desde el listado",
  ],
  [/email of this user already exists/i, "Ya hay un usuario con ese correo"],
  [
    /mobile of this user already exists, but/i,
    "Ese teléfono pertenece a un usuario eliminado: restáuralo desde el listado",
  ],
  [
    /mobile of this user already exists/i,
    "Ya hay un usuario con ese teléfono",
  ],
  [
    /longer than or equal to \d+ characters/i,
    "Uno de los campos es demasiado corto",
  ],
  [/^User disable/i, "La cuenta está inactiva"],
  [/^NotFoundError$/i, "No se encontró el registro"],
  [
    /has no business|does not have an? (business|office)|The office is required/i,
    "Falta indicar la empresa, oficina, departamento o equipo que exige el rol",
  ],
  [
    /cannot have an? /i,
    "Ese rol no admite la empresa, oficina, departamento o equipo indicados",
  ],
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
