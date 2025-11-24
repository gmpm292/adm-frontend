/* eslint-disable react-hooks/exhaustive-deps */
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthContext } from "./AuthContext";
import { ProgressSpinner } from "primereact/progressspinner";
import { useEffect, useState, useRef } from "react";
import { routePermissions } from "../../../config/routes";
import { usePermissions } from "../../../hooks/usePermissions";

/**
 * Componente ProtectedRoute - Protege rutas basado en autenticación y permisos
 * Verifica tanto autenticación como permisos de roles y operaciones GraphQL
 */
const ProtectedRoute = () => {
  const { isAuthenticated, loading, authFailed, ready } =
    useAuthContext();
  const { hasAnyPermission, hasRole } = usePermissions();
  const location = useLocation();

  // Estados para controlar la verificación de permisos
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  // Ref para evitar verificaciones duplicadas de la misma ruta
  const lastCheckedPath = useRef("");

  useEffect(() => {
    /**
     * Verifica los permisos para la ruta actual
     * Se ejecuta solo cuando cambia la ruta o el estado de autenticación
     */
    const checkPermissions = async () => {
      // Solo verificar si está autenticado y listo
      if (!isAuthenticated || !ready) return;

      const currentPath = location.pathname;

      // Evitar verificar la misma ruta múltiples veces
      if (lastCheckedPath.current === currentPath && permissionChecked) {
        return;
      }

      lastCheckedPath.current = currentPath;

      console.log(`🔐 Verificando permisos para ruta: ${currentPath}`);

      // Obtener configuración de permisos para la ruta actual
      const routeConfig = routePermissions[currentPath] || {};
      const { permissions = [], requiredRoles = [] } = routeConfig;

      console.log(`📋 Configuración de ruta:`, { permissions, requiredRoles });

      let access = true;

      // 1. Verificación de roles (síncrona - rápida)
      if (requiredRoles.length > 0) {
        const hasRequiredRole = hasRole(requiredRoles);
        if (!hasRequiredRole) {
          console.log(
            `❌ Acceso denegado por roles. Requeridos: ${requiredRoles.join(
              ", "
            )}`
          );
          access = false;
        } else {
          console.log(`✅ Roles verificados: ${requiredRoles.join(", ")}`);
        }
      }

      // 2. Verificación de permisos GraphQL (asíncrona)
      if (access && permissions.length > 0) {
        try {
          const hasPerms = await hasAnyPermission(permissions);
          if (!hasPerms) {
            console.log(
              `❌ Acceso denegado por permisos. Requeridos: ${permissions.join(
                ", "
              )}`
            );
            access = false;
          } else {
            console.log(`✅ Permisos verificados: ${permissions.join(", ")}`);
          }
        } catch (error) {
          console.error("Error en verificación de permisos:", error);
          access = false;
        }
      }

      // 3. Si no hay configuración de permisos, permitir acceso
      if (permissions.length === 0 && requiredRoles.length === 0) {
        console.log(
          `⚠️ Ruta sin configuración de permisos, acceso permitido por defecto`
        );
      }

      console.log(
        `🎯 Resultado final para ${currentPath}: ${
          access ? "ACCESO CONCEDIDO" : "ACCESO DENEGADO"
        }`
      );

      setHasAccess(access);
      setPermissionChecked(true);
    };

    checkPermissions();
  }, [
    isAuthenticated,
    ready,
    location.pathname, // Solo dependemos del pathname, no de las funciones
    // Removemos hasAnyPermission y hasRole de las dependencias
    // ya que están memoizadas con useCallback
  ]);

  // Estado de carga inicial
  if (!ready || loading) {
    return (
      <div
        className="flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <ProgressSpinner />
        <span className="ml-2">Cargando...</span>
      </div>
    );
  }

  // Verificación de autenticación
  if (!isAuthenticated || authFailed) {
    console.log("🔐 Redirigiendo a login - No autenticado");
    return <Navigate to="/login" replace />;
  }

  // Esperar verificación de permisos
  if (!permissionChecked) {
    return (
      <div
        className="flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <ProgressSpinner />
        <span className="ml-2">Verificando permisos...</span>
      </div>
    );
  }

  // Verificación de acceso
  if (!hasAccess) {
    console.log("🚫 Redirigiendo a unauthorized - Sin permisos");
    return <Navigate to="/unauthorized" replace />;
  }

  // Acceso concedido
  console.log("✅ Acceso concedido a ruta protegida");
  return <Outlet />;
};

export default ProtectedRoute;
