import { useLazyQuery } from "@apollo/client";
import { useAuthContext } from "../modules/auth/components/AuthContext";
import { CHECK_PERMISSIONS } from "../modules/role-guard/graphql/queries";
import { useCallback } from "react";

/**
 * Hook personalizado para gestionar permisos y roles de usuario
 * Proporciona métodos para verificar acceso basado en roles y permisos GraphQL
 */
export const usePermissions = () => {
  const { user } = useAuthContext();

  /**
   * Query lazy de GraphQL para verificar permisos en el backend
   * fetchPolicy: "network-only" asegura que siempre se consulte al servidor
   */
  const [checkPermissionsQuery] = useLazyQuery(CHECK_PERMISSIONS, {
    fetchPolicy: "network-only",
  });

  /**
   * Verifica si el usuario tiene permiso para ejecutar una operación GraphQL específica
   */
  const hasPermission = useCallback(
    async (operationName) => {
      if (!user) return false;
      if (user.roles?.includes("SUPER")) return true;

      try {
        const { data } = await checkPermissionsQuery({
          variables: { operationName },
        });
        return data?.checkPermissions?.allowed || false;
      } catch (error) {
        console.error("Error verificando permisos:", error);
        return false;
      }
    },
    [user, checkPermissionsQuery]
  );

  /**
   * Verifica si el usuario tiene al menos UN permiso de una lista de operaciones
   */
  const hasAnyPermission = useCallback(
    async (operationNames) => {
      if (!user) return false;
      if (user.roles?.includes("SUPER")) return true;

      for (const operationName of operationNames) {
        const hasPerm = await hasPermission(operationName);
        if (hasPerm) {
          console.log(`Permiso concedido para: ${operationName}`);
          return true;
        }
      }

      console.log(
        `No tiene permisos para ninguna de: ${operationNames.join(", ")}`
      );
      return false;
    },
    [user, hasPermission]
  );

  /**
   * Verifica si el usuario tiene al menos UN rol de una lista de roles requeridos
   */
  const hasRole = useCallback(
    (requiredRoles) => {
      if (!user) return false;
      //if (user.role?.includes("SUPER")) return true;

      const userRoles = user.role || [];
      const hasRequired = requiredRoles.some((role) =>
        userRoles.includes(role)
      );

      console.log(
        `Verificación de roles - Usuario: ${userRoles}, Requeridos: ${requiredRoles}, Resultado: ${hasRequired}`
      );
      return hasRequired;
    },
    [user]
  );

  return {
    hasPermission,
    hasAnyPermission,
    hasRole,
  };
};
