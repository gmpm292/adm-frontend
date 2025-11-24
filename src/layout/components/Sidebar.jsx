import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { PanelMenu } from "primereact/panelmenu";
import { ProgressSpinner } from "primereact/progressspinner";
import { useFilteredMenu } from "../../hooks/useFilteredMenu";
import "../styles/Sidebar.css";

/**
 * Componente Sidebar con menú dinámico filtrado por permisos
 * Muestra solo las opciones a las que el usuario tiene acceso
 */
export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState({});
  const navigate = useNavigate();
  const { filteredMenu, loading } = useFilteredMenu();

  /**
   * Maneja el toggle de expansión de items del menú
   * Solo permite un item expandido a la vez
   */
  const handleToggle = (key) => {
    setExpandedKeys((prevKeys) => {
      const isExpanded = prevKeys[key];
      // Colapsa todos excepto el que se hizo clic
      return isExpanded ? {} : { [key]: true };
    });
  };

  /**
   * Convierte el menú filtrado al formato que espera PanelMenu
   * Agrega los comandos de navegación y estructura recursiva
   */
  const convertMenuToPanelMenuFormat = (menuItems) => {
    return menuItems.map((item) => {
      const menuItem = {
        label: item.label,
        icon: item.icon,
        key: item.key,
        command: () => handleToggle(item.key),
      };

      // Procesar items hijos recursivamente
      if (item.items && item.items.length > 0) {
        menuItem.items = item.items.map((subItem) => {
          const subMenuItem = {
            label: subItem.label,
            icon: subItem.icon,
            key: subItem.key,
          };

          // Si el subitem tiene path, agregar comando de navegación
          if (subItem.path) {
            subMenuItem.command = () => {
              console.log(`🔄 Navegando a: ${subItem.path}`);
              navigate(subItem.path);
            };
          }

          // Procesar items anidados (tercer nivel)
          if (subItem.items && subItem.items.length > 0) {
            subMenuItem.items = subItem.items.map((nestedItem) => ({
              label: nestedItem.label,
              icon: nestedItem.icon,
              key: nestedItem.key,
              command: nestedItem.path
                ? () => {
                    console.log(`🔄 Navegando a: ${nestedItem.path}`);
                    navigate(nestedItem.path);
                  }
                : undefined,
            }));
          }

          return subMenuItem;
        });
      } else if (item.path) {
        // Si es un item terminal sin hijos, agregar comando directo
        menuItem.command = () => {
          console.log(`🔄 Navegando a: ${item.path}`);
          navigate(item.path);
        };
      }

      return menuItem;
    });
  };

  const menuItems = convertMenuToPanelMenuFormat(filteredMenu);

  // Estado de carga
  if (loading) {
    return (
      <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <Button
            icon={collapsed ? "pi pi-angle-right" : "pi pi-angle-left"}
            onClick={() => setCollapsed(!collapsed)}
            className="p-button-text"
            disabled={loading}
          />
        </div>
        <div className="sidebar-content flex justify-content-center align-items-center">
          <ProgressSpinner style={{ width: "40px", height: "40px" }} />
          <span className="ml-2">Cargando menú...</span>
        </div>
      </div>
    );
  }

  // Menú vacío (usuario sin permisos para nada)
  if (menuItems.length === 0) {
    return (
      <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <Button
            icon={collapsed ? "pi pi-angle-right" : "pi pi-angle-left"}
            onClick={() => setCollapsed(!collapsed)}
            className="p-button-text"
          />
        </div>
        <div className="sidebar-content flex justify-content-center align-items-center p-4">
          <div className="text-center">
            <i
              className="pi pi-lock"
              style={{ fontSize: "2rem", color: "#6c757d" }}
            ></i>
            <p className="mt-2 text-color-secondary">
              No tienes acceso a ninguna opción
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <Button
          icon={collapsed ? "pi pi-angle-right" : "pi pi-angle-left"}
          onClick={() => setCollapsed(!collapsed)}
          className="p-button-text"
          tooltip={collapsed ? "Expandir menú" : "Colapsar menú"}
          tooltipOptions={{ position: "right" }}
        />
      </div>
      <div className="sidebar-content">
        <PanelMenu
          model={menuItems}
          expandedKeys={expandedKeys}
          onPanelMenuItemClick={(e) => {
            // Manejar clicks en items que no son enlaces (solo grupos)
            if (e.item.key && !e.item.path) {
              handleToggle(e.item.key);
            }
          }}
          className={`sidebar-menu ${collapsed ? "icons-only" : ""}`}
        />
      </div>
    </div>
  );
}
