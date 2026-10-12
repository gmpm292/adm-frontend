import { useHasRole } from "../../hooks/useHasRole";

/**
 * Qué puede hacer el usuario en Ventas; lo mismo que exige el backend.
 * Vender, cobrar, cancelar borradores y crear o editar clientes: todos los
 * roles de la empresa (sin comprobar aquí). Lo demás:
 * - Devolver, agregar productos a un borrador, eliminar o restaurar
 *   clientes: SUPER, PRINCIPAL, ADMIN y MANAGER.
 * - Cambiar la cantidad de un producto del borrador: SUPER, PRINCIPAL y ADMIN.
 * - Quitar un producto del borrador y eliminar ventas: SUPER y PRINCIPAL.
 * - Restaurar ventas y ver las eliminadas: solo SUPER.
 */
export function useSalesRoles() {
  const hasRole = useHasRole();
  return {
    canRefund: hasRole("SUPER", "PRINCIPAL", "ADMIN", "MANAGER"),
    canAddProduct: hasRole("SUPER", "PRINCIPAL", "ADMIN", "MANAGER"),
    canChangeQuantity: hasRole("SUPER", "PRINCIPAL", "ADMIN"),
    canRemoveProduct: hasRole("SUPER", "PRINCIPAL"),
    canDeleteSale: hasRole("SUPER", "PRINCIPAL"),
    canRestoreSale: hasRole("SUPER"),
    canManageCustomers: hasRole("SUPER", "PRINCIPAL", "ADMIN", "MANAGER"),
  };
}
