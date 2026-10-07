export const routePermissions = {
  "/statistics/analytics": {
    permissions: [],
    requiredRoles: [],
    title: "Resumen",
  },
  "/statistics/sales": {
    permissions: [],
    requiredRoles: [],
    title: "Reporte de ventas",
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
    requiredRoles: ["SUPER"],
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
    requiredRoles: ["SUPER", "PRINCIPAL", "ADMIN", "MANAGER"],
    title: "Productos",
  },
  "/inventory/inventories": {
    permissions: [],
    requiredRoles: ["SUPER", "PRINCIPAL", "ADMIN", "MANAGER", "SUPERVISOR"],
    title: "Inventarios",
  },
  "/inventory/movements": {
    permissions: [],
    requiredRoles: ["SUPER", "PRINCIPAL", "ADMIN", "MANAGER", "SUPERVISOR"],
    title: "Movimientos",
  },
  "/inventory/units-of-measure": {
    permissions: [],
    requiredRoles: [],
    title: "Unidades de Medida",
  },
  "/payroll/attendance": {
    permissions: [],
    requiredRoles: ["SUPER", "PRINCIPAL", "ADMIN", "MANAGER"],
    title: "Asistencia",
  },
  "/payroll/currencies": {
    permissions: [],
    requiredRoles: [],
    title: "Monedas",
  },
  "/payroll/payment-rules": {
    permissions: [],
    requiredRoles: ["SUPER", "PRINCIPAL", "ADMIN", "MANAGER"],
    title: "Reglas de pago",
  },
  "/payroll/payroll-periods": {
    permissions: [],
    requiredRoles: ["SUPER", "PRINCIPAL", "ADMIN", "MANAGER"],
    title: "Períodos",
  },
  "/payroll/work-schedules": {
    permissions: [],
    requiredRoles: ["SUPER", "PRINCIPAL", "ADMIN", "MANAGER"],
    title: "Horarios",
  },
  "/payroll/workers": {
    permissions: [],
    requiredRoles: ["SUPER", "PRINCIPAL", "ADMIN", "MANAGER"],
    title: "Trabajadores",
  },
  "/payroll/worker-payments": {
    permissions: [],
    requiredRoles: ["SUPER", "PRINCIPAL", "ADMIN", "MANAGER", "SUPERVISOR"],
    title: "Pagos",
  },
  "/payroll/material-costs": {
    permissions: [],
    requiredRoles: [],
    title: "Costos de Materiales",
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
  "/sales/deliveries": {
    permissions: [],
    requiredRoles: [],
    title: "Mensajerías",
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
