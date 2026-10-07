import { useAuthContext } from "../auth/components/AuthContext";

/**
 * Qué puede hacer el usuario en Inventario; lo mismo que exige el backend.
 * Crear y editar: SUPER, PRINCIPAL y ADMIN. Eliminar: SUPER y PRINCIPAL.
 * Restaurar y ver lo eliminado: solo SUPER.
 */
export function useInventoryRoles() {
  const { user } = useAuthContext();
  const has = (...roles) => roles.some((role) => user?.role?.includes(role));
  return {
    canEdit: has("SUPER", "PRINCIPAL", "ADMIN"),
    canDelete: has("SUPER", "PRINCIPAL"),
    canRestore: has("SUPER"),
  };
}
