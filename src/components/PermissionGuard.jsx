import { useEffect, useState } from "react";
import { usePermissions } from "../hooks/usePermissions";
import { useAuthContext } from "../modules/auth/components/AuthContext";

/**
 * Componente que muestra contenido solo si el usuario tiene los permisos requeridos
 *
 * @param {Object} props
 * @param {ReactNode} props.children - Contenido a mostrar si tiene permisos
 * @param {string[]} props.permissions - Permisos GraphQL requeridos
 * @param {string[]} props.requiredRoles - Roles requeridos
 * @param {boolean} props.showFallback - Si mostrar contenido alternativo
 * @param {ReactNode} props.fallback - Contenido alternativo si no tiene permisos
 * @param {string} props.fallbackMessage - Mensaje alternativo simple
 */
const PermissionGuard = ({
  children,
  permissions = [],
  requiredRoles = [],
  showFallback = false,
  fallback = null,
  fallbackMessage = null,
}) => {
  const { user } = useAuthContext();
  const { hasRole, hasAnyPermission } = usePermissions();
  const [hasAccess, setHasAccess] = useState(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setHasAccess(false);
        return;
      }

      // SUPER users tienen acceso total
      if (user.roles?.includes("SUPER")) {
        setHasAccess(true);
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
    };

    checkAccess();
  }, [user, permissions, requiredRoles, hasRole, hasAnyPermission]);

  // Estado de carga
  if (hasAccess === null) {
    return (
      <div className="permission-guard-loading">
        <i className="pi pi-spin pi-spinner" style={{ fontSize: "1rem" }}></i>
      </div>
    );
  }

  // Sin acceso
  if (!hasAccess) {
    if (showFallback) {
      return (
        fallback || (
          <div className="permission-guard-fallback">
            {fallbackMessage || "No tiene permisos para esta acción"}
          </div>
        )
      );
    }
    return null;
  }

  // Con acceso
  return children;
};

export default PermissionGuard;

//Ejemplo: Botones con PermissionGuard

// // components/UserActions.jsx
// import { Button } from 'primereact/button';
// import PermissionGuard from './PermissionGuard';

// export const UserActions = () => {
//   return (
//     <div className="flex gap-2">
//       {/* Botón que solo ven SUPER y ADMIN */}
//       <PermissionGuard requiredRoles={['SUPER', 'ADMIN']}>
//         <Button
//           label="Crear Usuario"
//           icon="pi pi-plus"
//           className="p-button-success"
//         />
//       </PermissionGuard>

//       {/* Botón que requiere permiso específico */}
//       <PermissionGuard permissions={['DELETE_USERS']}>
//         <Button
//           label="Eliminar"
//           icon="pi pi-trash"
//           className="p-button-danger"
//         />
//       </PermissionGuard>

//       {/* Botón con fallback (se muestra pero deshabilitado) */}
//       <PermissionGuard
//         permissions={['EDIT_USERS']}
//         showFallback
//         fallback={
//           <Button
//             label="Editar"
//             icon="pi pi-pencil"
//             disabled
//             tooltip="No tienes permisos para editar"
//           />
//         }
//       >
//         <Button
//           label="Editar"
//           icon="pi pi-pencil"
//           className="p-button-warning"
//         />
//       </PermissionGuard>

//       {/* Botón que requiere ambos: rol Y permiso */}
//       <PermissionGuard
//         requiredRoles={['MANAGER']}
//         permissions={['APPROVE_REQUESTS']}
//       >
//         <Button
//           label="Aprobar"
//           icon="pi pi-check"
//           className="p-button-info"
//         />
//       </PermissionGuard>
//     </div>
//   );
// };
