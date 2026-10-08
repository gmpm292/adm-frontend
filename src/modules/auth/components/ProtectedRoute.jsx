/* eslint-disable react-hooks/exhaustive-deps */
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getTwoFactorStep, useAuthContext } from "./AuthContext";
import { LoadingScreen } from "../../../components/ui";
import { useEffect, useState, useRef } from "react";
import { routePermissions } from "../../../config/routes";
import { usePermissions } from "../../../hooks/usePermissions";

/**
 * Componente ProtectedRoute - Protege rutas basado en autenticación y permisos
 * Verifica tanto autenticación como permisos de roles y operaciones GraphQL
 */
const ProtectedRoute = () => {
  const { isAuthenticated, loading, authFailed, ready } = useAuthContext();
  const { hasAnyPermission, hasRole } = usePermissions();
  const location = useLocation();

  // Estados para controlar la verificación de permisos
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  // Ref para evitar verificaciones duplicadas de la misma ruta
  const lastCheckedPath = useRef("");

  useEffect(() => {
    setPermissionChecked(false);
    setHasAccess(false);
    lastCheckedPath.current = "";
  }, [location.pathname]);

  useEffect(() => {
    /**
     * Verifica los permisos para la ruta actual
     * Se ejecuta solo cuando cambia la ruta o el estado de autenticación
     */
    const checkPermissions = async () => {
      // Solo verificar si está autenticado y listo
      if (!isAuthenticated || !ready) {
        setPermissionChecked(false);
        return;
      }

      const currentPath = location.pathname;

      // Evitar verificar la misma ruta múltiples veces
      if (lastCheckedPath.current === currentPath && permissionChecked) {
        return;
      }

      lastCheckedPath.current = currentPath;

      // Obtener configuración de permisos para la ruta actual
      const routeConfig = routePermissions[currentPath] || {};
      const { permissions = [], requiredRoles = [] } = routeConfig;

      let access = true;

      // 1. Verificación de roles (síncrona - rápida)
      if (requiredRoles.length > 0) {
        const hasRequiredRole = hasRole(requiredRoles);
        if (!hasRequiredRole) {
          access = false;
        }
      }

      // 2. Verificación de permisos GraphQL (asíncrona)
      if (access && permissions.length > 0) {
        try {
          const hasPerms = await hasAnyPermission(permissions);
          if (!hasPerms) {
            access = false;
          }
        } catch (error) {
          console.error("Error en verificación de permisos:", error);
          access = false;
        } finally {
          setHasAccess(access);
          setPermissionChecked(true);
        }
      }

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
    return <LoadingScreen />;
  }

  // Verificación de autenticación
  if (!isAuthenticated || authFailed) {
    // Sesión iniciada pero con el segundo factor pendiente
    if (getTwoFactorStep()) {
      return <Navigate to="/two-factor" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  // Esperar verificación de permisos
  if (!permissionChecked) {
    return <LoadingScreen message="Verificando permisos..." />;
  }

  // Verificación de acceso
  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Acceso concedido
  return <Outlet />;
};

export default ProtectedRoute;
