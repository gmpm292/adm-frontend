/**
 * Roles del sistema: cómo se llaman en pantalla, hasta dónde alcanza cada uno
 * y qué parte de la estructura de la empresa hay que indicarle.
 */
export const ROLES = {
  SUPER: {
    label: "Super",
    scope: "Toda la plataforma",
    levels: [],
  },
  PRINCIPAL: {
    label: "Principal",
    scope: "Una empresa completa",
    levels: ["business"],
  },
  ADMIN: {
    label: "Administrador",
    scope: "Una oficina",
    levels: ["business", "office"],
  },
  MANAGER: {
    label: "Gerente",
    scope: "Un departamento",
    levels: ["business", "office", "department"],
  },
  SUPERVISOR: {
    label: "Supervisor",
    scope: "Un equipo",
    levels: ["business", "office", "department", "team"],
  },
  AGENT: {
    label: "Agente",
    scope: "Su trabajo dentro de un equipo",
    levels: ["business", "office", "department", "team"],
  },
};

// Rol de las cuentas de cliente: se muestra, pero no se asigna desde aquí
const CUSTOMER_ROLE_LABEL = "Cliente";

export const ROLE_OPTIONS = Object.entries(ROLES).map(([value, role]) => ({
  value,
  label: role.label,
  scope: role.scope,
}));

export const roleLabel = (role) =>
  ROLES[role]?.label ?? (role === "USER" ? CUSTOMER_ROLE_LABEL : (role ?? "—"));

/** Dónde trabaja un usuario: "Tienda Central · Ventas · Mostrador" */
export const userPlace = (user) =>
  [user?.office?.name, user?.department?.name, user?.team?.name]
    .filter(Boolean)
    .join(" · ") ||
  user?.business?.name ||
  null;

export const SYSTEM_USER_EMAIL = "system@admin.com";
