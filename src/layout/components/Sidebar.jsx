import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { PanelMenu } from "primereact/panelmenu";
import "../styles/Sidebar.css";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState({});
  const navigate = useNavigate();

  const handleToggle = (key) => {
    setExpandedKeys((prevKeys) => {
      const isExpanded = prevKeys[key];
      // Colapsa todos excepto el que se hizo clic
      return isExpanded ? {} : { [key]: true };
    });
  };

  // Claves únicas para cada grupo de menú
  const menuItems = [
    {
      label: "Panel Principal",
      icon: "pi pi-home",
      key: "panel",
      items: [
        {
          label: "Análisis",
          icon: "pi pi-chart-line",
          command: () => navigate("/statistics/analytics"),
        },
        {
          label: "Ventas",
          icon: "pi pi-dollar",
          command: () => navigate("/statistics/sales"),
        },
      ],
    },
    {
      label: "Ventas",
      icon: "pi pi-shopping-cart",
      key: "sales",
      items: [
        {
          label: "Clientes",
          icon: "pi pi-users",
          command: () => navigate("/sales/customers"),
        },
        {
          label: "Transacciones",
          icon: "pi pi-money-bill",
          command: () => navigate("/sales/sales"),
        },
      ],
    },
    {
      label: "Usuarios",
      icon: "pi pi-users",
      key: "users",
      items: [
        {
          label: "Lista de Usuarios",
          icon: "pi pi-list",
          command: () => navigate("/users"),
        },
      ],
    },
    {
      label: "Empresa",
      icon: "pi pi-building",
      key: "company",
      items: [
        {
          label: "Empresas",
          icon: "pi pi-briefcase",
          command: () => navigate("/company/business"),
        },
        {
          label: "Oficinas",
          icon: "pi pi-map-marker",
          command: () => navigate("/company/office"),
        },
        {
          label: "Departamentos",
          icon: "pi pi-sitemap",
          command: () => navigate("/company/department"),
        },
        {
          label: "Equipos",
          icon: "pi pi-users",
          command: () => navigate("/company/team"),
        },
      ],
    },
    {
      label: "Inventario",
      icon: "pi pi-box",
      key: "inventory",
      items: [
        {
          label: "Categorías",
          icon: "pi pi-tags",
          command: () => navigate("/inventory/categories"),
        },
        {
          label: "Productos",
          icon: "pi pi-shopping-bag",
          command: () => navigate("/inventory/products"),
        },
        {
          label: "Inventarios",
          icon: "pi pi-database",
          command: () => navigate("/inventory/inventories"),
        },
        {
          label: "Movimientos",
          icon: "pi pi-sync",
          command: () => navigate("/inventory/movements"),
        },
      ],
    },
    {
      label: "Nómina",
      icon: "pi pi-money-bill",
      key: "payroll",
      items: [
        {
          label: "Monedas",
          icon: "pi pi-dollar",
          command: () => navigate("/payroll/currencies"),
        },
        {
          label: "Reglas de Pago",
          icon: "pi pi-book",
          command: () => navigate("/payroll/payment-rules"),
        },
        {
          label: "Períodos",
          icon: "pi pi-calendar",
          command: () => navigate("/payroll/payroll-periods"),
        },
        {
          label: "Horarios",
          icon: "pi pi-clock",
          command: () => navigate("/payroll/work-schedules"),
        },
        {
          label: "Trabajadores",
          icon: "pi pi-users",
          command: () => navigate("/payroll/workers"),
        },
        {
          label: "Pagos",
          icon: "pi pi-wallet",
          command: () => navigate("/payroll/worker-payments"),
        },
      ],
    },
    {
      label: "Configuración",
      icon: "pi pi-cog",
      key: "settings",
      items: [
        {
          label: "Configuraciones",
          icon: "pi pi-sliders-h",
          command: () => navigate("/configurations"),
        },
        {
          label: "Sistema",
          icon: "pi pi-desktop",
        },
        {
          label: "Seguridad",
          icon: "pi pi-shield",
        },
      ],
    },
  ].map((item) => ({
    ...item,
    command: () => handleToggle(item.key),
  }));

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <Button
          icon={collapsed ? "pi pi-angle-right" : "pi pi-angle-left"}
          onClick={() => setCollapsed(!collapsed)}
          className="p-button-text"
        />
      </div>
      <div className="sidebar-content">
        <PanelMenu
          model={menuItems}
          expandedKeys={expandedKeys}
          onPanelMenuItemClick={(e) => {
            if (e.item.key) handleToggle(e.item.key);
          }}
          className={`sidebar-menu ${collapsed ? "icons-only" : ""}`}
        />
      </div>
    </div>
  );
}
