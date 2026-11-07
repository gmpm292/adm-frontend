import { useHasRole } from "../../../hooks/useHasRole";

/** Valor de «Todas las empresas» en `BusinessField`: registro común a todas */
export const ALL_BUSINESSES = "ALL";

/**
 * Si el formulario debe pedir la empresa: solo al crear y solo a SUPER, que
 * no tiene empresa en su sesión. Los demás crean en la suya.
 */
export function useChoosesBusiness(isEdit) {
  const hasRole = useHasRole();
  return !isEdit && hasRole("SUPER");
}

/** `businessId` para la API: «Todas las empresas» se envía como `null` */
export const businessIdFor = (value) =>
  value === ALL_BUSINESSES ? null : value;
