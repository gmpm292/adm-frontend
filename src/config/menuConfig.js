import { routePermissions } from "./routes";

/**
 * Configuración completa del menú con permisos explícitos
 * Cada item tiene su ruta y hereda permisos de routePermissions
 */
export const menuConfig = [
  {
    label: "Panel Principal",
    icon: "pi pi-home",
    key: "panel",
    items: [
      {
        label: "Análisis",
        icon: "pi pi-chart-line",
        path: "/statistics/analytics",
        permissions:
          routePermissions["/statistics/analytics"]?.permissions || [],
        requiredRoles:
          routePermissions["/statistics/analytics"]?.requiredRoles || [],
      },
      {
        label: "Ventas",
        icon: "pi pi-dollar",
        path: "/statistics/sales",
        permissions: routePermissions["/statistics/sales"]?.permissions || [],
        requiredRoles:
          routePermissions["/statistics/sales"]?.requiredRoles || [],
      },
    ],
  },
  {
    label: "Ventas",
    icon: "pi pi-shopping-cart",
    key: "sales",
    items: [
      {
        label: "Venta Integrada",
        icon: "pi pi-plus-circle",
        path: "/sales/integrated-sale",
        permissions:
          routePermissions["/sales/integrated-sale"]?.permissions || [],
        requiredRoles:
          routePermissions["/sales/integrated-sale"]?.requiredRoles || [],
      },
      {
        label: "Clientes",
        icon: "pi pi-users",
        path: "/sales/customers",
        permissions: routePermissions["/sales/customers"]?.permissions || [],
        requiredRoles:
          routePermissions["/sales/customers"]?.requiredRoles || [],
      },
      {
        label: "Ventas",
        icon: "pi pi-money-bill",
        path: "/sales/sales",
        permissions: routePermissions["/sales/sales"]?.permissions || [],
        requiredRoles: routePermissions["/sales/sales"]?.requiredRoles || [],
      },
      {
        label: "Detalles de Venta",
        icon: "pi pi-list",
        path: "/sales/sale-details",
        permissions: routePermissions["/sales/sale-details"]?.permissions || [],
        requiredRoles:
          routePermissions["/sales/sale-details"]?.requiredRoles || [],
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
        path: "/users",
        permissions: routePermissions["/users"]?.permissions || [],
        requiredRoles: routePermissions["/users"]?.requiredRoles || [],
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
        path: "/company/business",
        permissions: routePermissions["/company/business"]?.permissions || [],
        requiredRoles:
          routePermissions["/company/business"]?.requiredRoles || [],
      },
      {
        label: "Oficinas",
        icon: "pi pi-map-marker",
        path: "/company/office",
        permissions: routePermissions["/company/office"]?.permissions || [],
        requiredRoles: routePermissions["/company/office"]?.requiredRoles || [],
      },
      {
        label: "Departamentos",
        icon: "pi pi-sitemap",
        path: "/company/department",
        permissions: routePermissions["/company/department"]?.permissions || [],
        requiredRoles:
          routePermissions["/company/department"]?.requiredRoles || [],
      },
      {
        label: "Equipos",
        icon: "pi pi-users",
        path: "/company/team",
        permissions: routePermissions["/company/team"]?.permissions || [],
        requiredRoles: routePermissions["/company/team"]?.requiredRoles || [],
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
        path: "/inventory/categories",
        permissions:
          routePermissions["/inventory/categories"]?.permissions || [],
        requiredRoles:
          routePermissions["/inventory/categories"]?.requiredRoles || [],
      },
      {
        label: "Productos",
        icon: "pi pi-shopping-bag",
        path: "/inventory/products",
        permissions: routePermissions["/inventory/products"]?.permissions || [],
        requiredRoles:
          routePermissions["/inventory/products"]?.requiredRoles || [],
      },
      {
        label: "Inventarios",
        icon: "pi pi-database",
        path: "/inventory/inventories",
        permissions:
          routePermissions["/inventory/inventories"]?.permissions || [],
        requiredRoles:
          routePermissions["/inventory/inventories"]?.requiredRoles || [],
      },
      {
        label: "Movimientos",
        icon: "pi pi-sync",
        path: "/inventory/movements",
        permissions:
          routePermissions["/inventory/movements"]?.permissions || [],
        requiredRoles:
          routePermissions["/inventory/movements"]?.requiredRoles || [],
      },
      {
        label: "Unidades de Medida",
        icon: "pi pi-ruler",
        path: "/inventory/units-of-measure",
        permissions:
          routePermissions["/inventory/units-of-measure"]?.permissions || [],
        requiredRoles:
          routePermissions["/inventory/units-of-measure"]?.requiredRoles || [],
      },
    ],
  },
  {
    label: "Nómina",
    icon: "pi pi-money-bill",
    key: "payroll",
    items: [
      {
        label: "Asistencia",
        icon: "pi pi-calendar-times", // "pi pi-clock" o "pi pi-calendar" también es bueno
        path: "/payroll/attendance",
        permissions: routePermissions["/payroll/attendance"]?.permissions || [],
        requiredRoles:
          routePermissions["/payroll/attendance"]?.requiredRoles || [],
      },
      {
        label: "Monedas",
        icon: "pi pi-dollar",
        path: "/payroll/currencies",
        permissions: routePermissions["/payroll/currencies"]?.permissions || [],
        requiredRoles:
          routePermissions["/payroll/currencies"]?.requiredRoles || [],
      },
      {
        label: "Reglas de Pago",
        icon: "pi pi-book",
        path: "/payroll/payment-rules",
        permissions:
          routePermissions["/payroll/payment-rules"]?.permissions || [],
        requiredRoles:
          routePermissions["/payroll/payment-rules"]?.requiredRoles || [],
      },
      {
        label: "Períodos",
        icon: "pi pi-calendar",
        path: "/payroll/payroll-periods",
        permissions:
          routePermissions["/payroll/payroll-periods"]?.permissions || [],
        requiredRoles:
          routePermissions["/payroll/payroll-periods"]?.requiredRoles || [],
      },
      {
        label: "Horarios",
        icon: "pi pi-clock",
        path: "/payroll/work-schedules",
        permissions:
          routePermissions["/payroll/work-schedules"]?.permissions || [],
        requiredRoles:
          routePermissions["/payroll/work-schedules"]?.requiredRoles || [],
      },
      {
        label: "Trabajadores",
        icon: "pi pi-users",
        path: "/payroll/workers",
        permissions: routePermissions["/payroll/workers"]?.permissions || [],
        requiredRoles:
          routePermissions["/payroll/workers"]?.requiredRoles || [],
      },
      {
        label: "Pagos",
        icon: "pi pi-wallet",
        path: "/payroll/worker-payments",
        permissions:
          routePermissions["/payroll/worker-payments"]?.permissions || [],
        requiredRoles:
          routePermissions["/payroll/worker-payments"]?.requiredRoles || [],
      },
      {
        label: "Costos de Materiales",
        icon: "pi pi-dollar",
        path: "/payroll/material-costs",
        permissions:
          routePermissions["/payroll/material-costs"]?.permissions || [],
        requiredRoles:
          routePermissions["/payroll/material-costs"]?.requiredRoles || [],
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
        path: "/configurations",
        permissions: routePermissions["/configurations"]?.permissions || [],
        requiredRoles: routePermissions["/configurations"]?.requiredRoles || [],
      },
      {
        label: "Correo OAuth2",
        icon: "pi pi-envelope",
        path: "/system/email",
        permissions: routePermissions["/system/email"]?.permissions || [],
        requiredRoles: routePermissions["/system/email"]?.requiredRoles || [],
      },
      {
        label: "Impresión Térmica",
        icon: "pi pi-print",
        path: "/system/printing",
        permissions: routePermissions["/system/printing"]?.permissions || [],
        requiredRoles:
          routePermissions["/system/printing"]?.requiredRoles || [],
      },
      {
        label: "Seguridad",
        icon: "pi pi-shield",
        key: "security",
        items: [
          {
            label: "Permisos GraphQL",
            icon: "pi pi-key",
            path: "/system/security/role-guards",
            permissions:
              routePermissions["/system/security/role-guards"]?.permissions ||
              [],
            requiredRoles:
              routePermissions["/system/security/role-guards"]?.requiredRoles ||
              [],
          },
          {
            label: "Niveles de Acceso",
            icon: "pi pi-lock",
            path: "/system/security/scoped-access",
            permissions:
              routePermissions["/system/security/scoped-access"]?.permissions ||
              [],
            requiredRoles:
              routePermissions["/system/security/scoped-access"]
                ?.requiredRoles || [],
          },
        ],
      },
    ],
  },
];
