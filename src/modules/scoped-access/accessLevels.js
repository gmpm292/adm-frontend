// Niveles de acceso: qué registros ve un usuario en una operación
export const ACCESS_LEVELS = [
  { value: "GENERAL", label: "Todo", hint: "Sin filtrar" },
  { value: "BUSINESS", label: "Su empresa" },
  { value: "OFFICE", label: "Su oficina" },
  { value: "DEPARTMENT", label: "Su departamento" },
  { value: "TEAM", label: "Su equipo" },
  { value: "PERSONAL", label: "Lo que creó o modificó" },
  { value: "RELATED", label: "Lo relacionado con él" },
];

export const accessLevelLabel = (value) =>
  ACCESS_LEVELS.find((level) => level.value === value)?.label ?? value;

// La API devuelve el estado como número: 1 activo, 0 inactivo
export const isEnabled = (scopedAccess) =>
  Number(scopedAccess?.entityStatus) === 1;
