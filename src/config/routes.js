export const routePermissions = {
  "/statistics/analytics": {
    permissions: [],
    requiredRoles: [],
    title: "Análisis",
  },
  "/statistics/sales": {
    permissions: [],
    requiredRoles: [],
    title: "Ventas",
  },
  "/users": {
    permissions: [],
    requiredRoles: ["SUPER"],
    title: "Usuarios",
  },
  "/profile": {
    permissions: [],
    requiredRoles: [],
    title: "Perfil",
  },
  "/configurations": {
    permissions: ["configs"],
    requiredRoles: ["SUPER"],
    title: "Configuraciones",
  },
  "/company/business": {
    permissions: [],
    requiredRoles: ["SUPER", "PRINCIPAL"],
    title: "Empresas",
  },
  "/company/office": {
    permissions: [],
    requiredRoles: ["SUPER", "PRINCIPAL"],
    title: "Oficinas",
  },
  "/company/department": {
    permissions: [],
    requiredRoles: ["SUPER", "PRINCIPAL", "ADMIN"],
    title: "Departamentos",
  },
  "/company/team": {
    permissions: [],
    requiredRoles: ["SUPER", "PRINCIPAL", "ADMIN", "MANAGER"],
    title: "Equipos",
  },
  "/inventory/categories": {
    permissions: [],
    requiredRoles: [],
    title: "Categorías",
  },
  "/inventory/products": {
    permissions: [],
    requiredRoles: [],
    title: "Productos",
  },
  "/inventory/inventories": {
    permissions: [],
    requiredRoles: [],
    title: "Inventarios",
  },
  "/inventory/movements": {
    permissions: [],
    requiredRoles: [],
    title: "Movimientos",
  },
  "/payroll/currencies": {
    permissions: [],
    requiredRoles: [],
    title: "Monedas",
  },
  "/payroll/payment-rules": {
    permissions: [],
    requiredRoles: [],
    title: "Reglas de Pago",
  },
  "/payroll/payroll-periods": {
    permissions: [],
    requiredRoles: [],
    title: "Períodos",
  },
  "/payroll/work-schedules": {
    permissions: [],
    requiredRoles: [],
    title: "Horarios",
  },
  "/payroll/workers": {
    permissions: [],
    requiredRoles: [],
    title: "Trabajadores",
  },
  "/payroll/worker-payments": {
    permissions: [],
    requiredRoles: [],
    title: "Pagos",
  },
  "/sales/integrated-sale": {
    permissions: [],
    requiredRoles: [],
    title: "Venta Integrada",
  },
  "/sales/customers": {
    permissions: [],
    requiredRoles: [],
    title: "Clientes",
  },
  "/sales/sales": {
    permissions: [],
    requiredRoles: [],
    title: "Ventas",
  },
  "/sales/sale-details": {
    permissions: [],
    requiredRoles: [],
    title: "Detalles de Venta",
  },
  "/system/email": {
    permissions: [],
    requiredRoles: ["SUPER"],
    title: "Correo OAuth2",
  },
  "/system/printing": {
    permissions: [],
    requiredRoles: ["SUPER"],
    title: "Impresión Térmica",
  },
  "/system/security/role-guards": {
    permissions: [],
    requiredRoles: ["SUPER"],
    title: "Permisos GraphQL",
  },
  "/system/security/scoped-access": {
    permissions: [],
    requiredRoles: ["SUPER"],
    title: "Niveles de Acceso",
  },
  // ... Agrega aquí el resto de tus rutas
};
