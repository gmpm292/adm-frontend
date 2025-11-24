import { useState, useEffect, useCallback } from "react";
import { usePermissions } from "./usePermissions";
import { menuConfig } from "../config/menuConfig";

/**
 * Hook que proporciona el menú filtrado según los permisos del usuario
 * @returns {Object} - Objeto con el menú filtrado y estado de carga
 */
export const useFilteredMenu = () => {
  const { hasRole, hasAnyPermission } = usePermissions();
  const [filteredMenu, setFilteredMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Verifica acceso a un item específico del menú
   */
  const checkItemAccess = useCallback(
    async (item) => {
      const { permissions = [], requiredRoles = [] } = item;

      let hasAccess = true;

      // 1. Verificar roles
      if (requiredRoles.length > 0) {
        hasAccess = hasRole(requiredRoles);
        if (!hasAccess) {
          console.log(`🚫 Acceso denegado por roles para: ${item.label}`);
          return false;
        }
      }

      // 2. Verificar permisos GraphQL
      if (hasAccess && permissions.length > 0) {
        hasAccess = await hasAnyPermission(permissions);
        if (!hasAccess) {
          console.log(`🚫 Acceso denegado por permisos para: ${item.label}`);
          return false;
        }
      }

      console.log(`✅ Acceso concedido para: ${item.label}`);
      return hasAccess;
    },
    [hasRole, hasAnyPermission]
  );

  /**
   * Filtra recursivamente los items del menú basado en permisos
   */
  const filterMenuItems = useCallback(
    async (items) => {
      const filteredItems = [];

      for (const item of items) {
        let shouldShowItem = true;

        // Si es un item terminal (tiene path), verificar acceso
        if (item.path) {
          shouldShowItem = await checkItemAccess(item);
        }

        // Si tiene hijos, filtrarlos recursivamente
        let filteredChildren = [];
        if (item.items && item.items.length > 0) {
          filteredChildren = await filterMenuItems(item.items);

          // Si es un grupo de menú, mostrarlo solo si tiene hijos visibles
          if (!item.path) {
            shouldShowItem = filteredChildren.length > 0;
          }
        }

        // Agregar item si debe mostrarse
        if (shouldShowItem) {
          const newItem = {
            ...item,
            // Solo incluir items si hay hijos filtrados
            ...(filteredChildren.length > 0 && { items: filteredChildren }),
          };
          filteredItems.push(newItem);
        }
      }

      return filteredItems;
    },
    [checkItemAccess]
  );

  // Efecto para filtrar el menú cuando cambian los permisos
  useEffect(() => {
    const filterMenu = async () => {
      setLoading(true);
      try {
        console.log("🔄 Filtrando menú según permisos...");
        const filtered = await filterMenuItems(menuConfig);
        console.log("✅ Menú filtrado:", filtered);
        setFilteredMenu(filtered);
      } catch (error) {
        console.error("❌ Error filtrando menú:", error);
        setFilteredMenu([]);
      } finally {
        setLoading(false);
      }
    };

    filterMenu();
  }, [filterMenuItems]);

  return {
    filteredMenu,
    loading,
  };
};
