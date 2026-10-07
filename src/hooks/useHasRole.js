import { useAuthContext } from "../modules/auth/components/AuthContext";

/**
 * `hasRole("SUPER", "PRINCIPAL")`: si el usuario tiene alguno de esos roles.
 * Cada pantalla oculta lo que el backend no le dejaría hacer.
 */
export function useHasRole() {
  const { user } = useAuthContext();
  return (...roles) => roles.some((role) => user?.role?.includes(role));
}
