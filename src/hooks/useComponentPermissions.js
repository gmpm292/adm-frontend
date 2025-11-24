/* eslint-disable react-hooks/exhaustive-deps */
// hooks/useComponentPermissions.js
import { usePermissions } from "./usePermissions";
import { useAuthContext } from "../modules/auth/components/AuthContext";
import { useState, useEffect } from "react";

/**
 * Hook para gestionar permisos de componentes específicos
 * @returns {Object} - Métodos para verificación de permisos en componentes
 */
export const useComponentPermissions = () => {
  const { user } = useAuthContext();
  const { hasRole, hasAnyPermission, hasPermission } = usePermissions();

  /**
   * Verifica si se puede mostrar un componente basado en permisos/roles
   * @param {Object} options - Opciones de verificación
   * @returns {[boolean, boolean]} - [hasAccess, isLoading]
   */
  const useAccess = ({ permissions = [], requiredRoles = [] }) => {
    const [hasAccess, setHasAccess] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const checkAccess = async () => {
        setIsLoading(true);

        if (!user) {
          setHasAccess(false);
          setIsLoading(false);
          return;
        }

        // SUPER users tienen acceso total
        if (user.roles?.includes("SUPER")) {
          setHasAccess(true);
          setIsLoading(false);
          return;
        }

        let access = true;

        // Verificar roles
        if (requiredRoles.length > 0) {
          access = hasRole(requiredRoles);
        }

        // Verificar permisos GraphQL
        if (access && permissions.length > 0) {
          access = await hasAnyPermission(permissions);
        }

        setHasAccess(access);
        setIsLoading(false);
      };

      checkAccess();
    }, [user, permissions, requiredRoles, hasRole, hasAnyPermission]);

    return [hasAccess, isLoading];
  };

  /**
   * Hook rápido para verificación de roles (síncrono)
   */
  const useRoleAccess = (requiredRoles = []) => {
    if (!user) return false;
    if (user.roles?.includes("SUPER")) return true;
    return hasRole(requiredRoles);
  };

  /**
   * Hook para verificación de un permiso específico
   */
  const usePermissionAccess = (permission) => {
    const [hasAccess, setHasAccess] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const checkPermission = async () => {
        if (!user) {
          setHasAccess(false);
          setIsLoading(false);
          return;
        }

        if (user.roles?.includes("SUPER")) {
          setHasAccess(true);
          setIsLoading(false);
          return;
        }

        const access = await hasPermission(permission);
        setHasAccess(access);
        setIsLoading(false);
      };

      checkPermission();
    }, [user, permission, hasPermission]);

    return [hasAccess, isLoading];
  };

  return {
    useAccess,
    useRoleAccess,
    usePermissionAccess,
    // Métodos directos (para casos simples)
    hasRole,
    hasPermission: (permission) => {
      if (!user) return false;
      if (user.roles?.includes("SUPER")) return true;
      return hasPermission(permission);
    },
  };
};

// Ejemplo: Usando el hook en componentes.

// // components/UserManagement.jsx
// import { useComponentPermissions } from '../hooks/useComponentPermissions';
// import { DataTable } from 'primereact/datatable';
// import { Column } from 'primereact/column';

// export const UserManagement = () => {
//   const { 
//     useAccess, 
//     useRoleAccess,
//     usePermissionAccess 
//   } = useComponentPermissions();

//   // Verificaciones individuales
//   const canCreateUsers = useRoleAccess(['SUPER', 'ADMIN']);
//   const [canDeleteUsers, isLoadingDelete] = usePermissionAccess('DELETE_USERS');
//   const [canExportData, isLoadingExport] = useAccess({
//     permissions: ['EXPORT_USERS_DATA'],
//     requiredRoles: ['SUPER', 'ADMIN', 'MANAGER']
//   });

//   // Acción de fila condicional
//   const actionsTemplate = (rowData) => {
//     const [canEditUser] = useAccess({
//       permissions: ['EDIT_USERS'],
//       requiredRoles: ['SUPER', 'ADMIN']
//     });

//     return (
//       <div className="flex gap-1">
//         {canEditUser && (
//           <Button 
//             icon="pi pi-pencil" 
//             className="p-button-warning p-button-sm"
//             tooltip="Editar usuario"
//           />
//         )}
//         {canDeleteUsers && !isLoadingDelete && (
//           <Button 
//             icon="pi pi-trash" 
//             className="p-button-danger p-button-sm"
//             tooltip="Eliminar usuario"
//           />
//         )}
//       </div>
//     );
//   };

//   if (isLoadingDelete || isLoadingExport) {
//     return <div>Cargando permisos...</div>;
//   }

//   return (
//     <div className="card">
//       <div className="flex justify-content-between align-items-center mb-3">
//         <h2>Gestión de Usuarios</h2>
//         <div className="flex gap-2">
//           {canCreateUsers && (
//             <Button 
//               label="Nuevo Usuario" 
//               icon="pi pi-plus" 
//               className="p-button-success"
//             />
//           )}
//           {canExportData && (
//             <Button 
//               label="Exportar" 
//               icon="pi pi-download" 
//               className="p-button-help"
//             />
//           )}
//         </div>
//       </div>

//       <DataTable value={[]}>
//         <Column field="name" header="Nombre" />
//         <Column field="email" header="Email" />
//         <Column field="role" header="Rol" />
//         <Column body={actionsTemplate} header="Acciones" />
//       </DataTable>
//     </div>
//   );
// };