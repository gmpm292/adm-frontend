# adm-frontend

Interfaz del sistema de administración para mipymes (ventas, inventario,
nómina, estructura de empresa). La API es `../adm-backend`.

## Stack

- React 19 con Vite, React Router (`HashRouter`: las rutas van tras `#`).
- PrimeReact 10 + PrimeFlex 4 + PrimeIcons. Formularios con Formik y Yup.
- Apollo Client contra GraphQL, con cookies (`credentials: "include"`).
- La mayoría del código es `.jsx`; hay 16 archivos `.tsx` que ESLint no revisa.

## Arrancar en local

- `.env.local` (ignorado por git): `VITE_API_URL=http://localhost:3000/graphql`.
  Tiene prioridad sobre `.env`, que está versionado con la URL de producción y
  no se toca. Usar `localhost` y no `127.0.0.1`, para que las cookies de sesión
  no sean de terceros.
- `npm run dev` → `http://localhost:3001/adm-frontend/`.
- `npm run lint`, `npm run build`, `npm run theme:build`.
- `npm run deploy` publica `dist` en GitHub Pages. Un `npm run build` local lee
  `.env.local`, así que ese `dist` apunta a `localhost`; para publicar a mano
  hay que compilar sin `.env.local`. El despliegue normal no pasa por aquí.

## Despliegue

- **Cada `push` a la rama `develop` publica en producción**
  (`https://gmpm292.github.io/adm-frontend/`): el workflow
  `.github/workflows/deploy.yml` compila y sube `dist` a la rama `gh-pages`,
  que es la que sirve GitHub Pages. Cualquier otra rama no despliega.
- El `.env` **está versionado** y es el que usa esa compilación. Nunca subirlo
  apuntando a `localhost`: el sitio publicado dejaría de conectar con la API.
- Si la compilación falla en GitHub Actions no se publica nada y el sitio sigue
  con la versión anterior. Antes de subir: `npm run lint` y `npm run build`.
- El backend se despliega solo en Heroku al hacer `push` a su rama `main`.
  Si un cambio toca ambos, primero el backend y después el frontend.

## Sistema de diseño (obligatorio)

Toda la apariencia sale de `src/theme`; las pantallas no definen estilos. Las
reglas completas están en `src/theme/README.md`. En corto:

1. Ningún `.css` fuera de `src/theme` y ningún componente importa CSS.
   `src/main.jsx` importa `src/theme/index.css` y nadie más.
2. Nada de `style={{}}`, `headerStyle`, `bodyStyle` ni `contentStyle`. ESLint lo
   rechaza (`no-restricted-syntax` en `eslint.config.js`). Excepción única: un
   valor calculado en tiempo de ejecución, con su `eslint-disable-next-line`
   justificado.
3. Ningún color, medida o sombra a mano: `var(--token)` en CSS y clases de
   PrimeFlex en JSX.
4. Si falta algo se añade al sistema (token, componente en `src/components/ui`
   o clase en `src/theme/components.css`), no a la pantalla.

Piezas:

- `src/theme/tokens.css`: única fuente de valores. Azul Pantone Classic Blue
  (`--primary-600: #0f4c81`), grises fríos (`--surface-*`), estados, tipografía,
  espaciado, radios, sombras y medidas del marco.
- `src/theme/primereact.generated.css`: tema Lara de PrimeReact con sus colores
  sustituidos por tokens. **No se edita**; se regenera con `npm run theme:build`
  (`scripts/build-theme.mjs`) tras actualizar `primereact`.
- `src/theme/components.css` y `layout.css`: forma de los componentes y marco.
- `src/components/ui/index.jsx`: `PageHeader`, `FormField`, `FormSection`
  (bloque con título de un formulario largo), `InfoRow` (fichas),
  `AuthLayout`, `EmptyState`, `LoadingScreen`, `OtpInput`, `QrPanel`.
- `src/components/BaseTable`: tabla de listados (búsqueda, columnas, filtros,
  paginación en servidor). Las columnas dan su ancho con `className`,
  `headerClassName` o `bodyClassName`.

Patrones: una página de listado es `<PageHeader>` + tabla, sin `Card`
envolviendo; acciones de fila en `actions-column` con `<Button text rounded>`;
estados con `<Tag severity>`; formularios con `FormField` sobre
`formgrid grid`; un solo botón principal por vista, «Cancelar» con
`severity="secondary"`.

## Estructura

- `src/layout/components`: `AppShell` (ruta de diseño con `Outlet`; se monta una
  vez), `Sidebar`, `TopBar`.
- `src/config/app.js`: nombre de la aplicación («Panel Administrativo»). Su
  icono es `BrandIcon` (gráfico de barras, en `src/components/ui`); con el menú
  contraído queda solo el icono.
- `src/config/routes.js`: título, roles y permisos de cada ruta.
  `src/config/menuConfig.js`: menú lateral; los catálogos de referencia van en
  el grupo «Nomencladores».
- `src/modules/<dominio>/<entidad>/{pages,components,graphql,hooks}`.
- `src/apollo/client.js`: cliente y renovación de sesión.

## Autenticación

- La sesión vive en cookies `HttpOnly` que pone el backend; el frontend no
  maneja tokens. `localStorage.isAuthenticated` es solo una pista para saber si
  vale la pena consultar el perfil al abrir `/login`.
- `AuthContext` consulta `profile` en las rutas protegidas y expone `user`,
  `login`, `completeLogin` y `logout`. `ProtectedRoute` valida sesión, roles y
  permisos.
- **Renovación**: el `errorLink` de Apollo, ante un `401` con mensaje
  `Unauthorized` o `UnauthorizedError`, ejecuta `refresh` una sola vez
  (promesa compartida entre consultas simultáneas) y repite la operación. Si
  falla, emite `auth-failed` y se vuelve al login.
- **2FA**: si el login devuelve `isTwoFactorEnabled`, `login()` manda a
  `/two-factor` y guarda el paso en `sessionStorage.twoFactorStep` (`verify` si
  ya hay dispositivo, `setup` si falta emparejarlo). Tras activar 2FA desde el
  perfil se llama a `verify2FA` con el mismo código, para que la sesión actual
  quede verificada.
- Pantallas públicas: `/login`, `/forgot-password`,
  `/change-password/:confirmationToken`, `/two-factor`, `/cfu` (primer usuario)
  y `/unauthorized`.
- En local existe el usuario de prueba `admin@local.test` (rol SUPER).

## Estadísticas (`src/modules/statistics`)

- «Resumen» (`pages/Analytics.jsx`) y «Reporte de ventas» (`pages/Sales.jsx`)
  leen `dashboardStatistics` y `salesStatistics`. Comparten
  `hooks/useStatistics.js` (periodo, moneda, empresa) y
  `components/StatisticsFilters.jsx`.
- **Gráficos**: una sola familia de color, azules de la marca y grises, leída
  de los tokens en `chartTheme.js`. No añadir colores sueltos por serie.
- **Sin datos no se dibuja nada**: `ChartCard`, `RankingList` y `NoData`
  muestran un aviso. Nunca cifras de ejemplo en el código.
- Los importes llevan siempre su moneda (`formatMoney`).

## Ventas (`src/modules/sales`)

- **Venta integrada** (`integrated-sale/pages/SalePointPage.jsx`): catálogo a la
  izquierda y ticket a la derecha. Lee `saleCatalog` (una consulta con
  productos, precios, existencias, monedas y personal), cotiza con `quoteSale`
  y cobra con `createSale` enviando `payments`: la venta nace ya cobrada. Sin
  pagos queda en borrador («Guardar borrador», reserva existencias).
- El estado del carrito y las cuentas viven en `integrated-sale/saleCart.js`.
  Los importes definitivos siempre los da el backend.
- «En espera» guarda carritos en `localStorage` (`pos.parkedSales`): no
  reservan existencias.
- `PaymentDialog` (cobro en una o varias monedas) lo comparten la venta
  integrada y el cobro de borradores (`sale/components/MakeSaleComponent.jsx`).
- **Ventas y Mensajerías** son la misma tabla (`sale/components/SaleTable.jsx`;
  Mensajerías la usa con `deliveryOnly`). Las acciones dependen de
  `saleStatus`: un borrador se cobra, edita o cancela; una venta cobrada solo
  se devuelve (entera o por producto, desde su ficha).
- **Clientes**: un solo formulario, `customer/components/CustomerForm.jsx`,
  para crear y editar; lo usa también la venta integrada.
- Textos de estado, nombres de trabajador y fechas: `sales/format.js`. Mensajes
  de error del backend: `utils/errors.js` (`getErrorMessage`).
- Los estilos de la venta integrada están en `src/theme/pages/pos.css`.

## Inventario (`src/modules/inventory`)

- **Productos**: un solo formulario, `product/components/ProductForm.jsx`, para
  crear y editar. Al crear puede abrir a la vez el inventario en varias
  oficinas. Los precios fijos se ponen junto a cada moneda aceptada; el margen
  es sobre el precio de venta y, si se escribe, calcula el precio.
- **Inventarios**: `inventory/components/InventoryForm.jsx` abre uno nuevo o
  edita su ubicación y su mínimo. Las existencias no se editan: cambian con
  movimientos. Al llegar al mínimo se marcan «Por reponer».
- **Movimientos**: `inventory-movement/components/MovementForm.jsx` registra
  una entrada o una salida, desde la tabla de inventarios (ya elegido) o desde
  Movimientos. Solo ofrece los motivos manuales; el backend rechaza el resto.
- Motivos, estados de existencias y cantidades con unidad: `inventory/format.js`.
  Qué botones ve cada rol: `inventory/useInventoryRoles.js` (lo mismo que exige
  el backend).

## Empresa y usuarios

- **Empresa** (`src/modules/company`): Empresas, Oficinas, Departamentos y
  Equipos comparten `shared/CompanyUnitTable.jsx` y `shared/CompanyUnitForm.jsx`.
  Cada nivel se describe en `shared/units.js` (textos, operaciones, columnas y
  campos); para cambiar una pantalla se cambia ahí.
- **Usuarios** (`src/modules/user`): `components/UserForm.jsx` crea y edita, con
  el rol y el lugar de la empresa que ese rol exige (`roles.js`).
- Ninguna tabla muestra la columna Id.
- Al reemplazar un componente se borra el anterior en el mismo cambio: no se
  dejan archivos sin uso, copias `.old` ni `.txt`.

## Trampas conocidas

- `InputNumber` de PrimeReact solo llama a `onValueChange` al salir del campo.
  Para recalcular mientras se escribe (margen, «Quedarán...») usar `onChange`.
- Los objetos que devuelve Apollo llevan `__typename`: al reenviarlos como
  `input` de una mutación hay que copiar los campos uno a uno.

- Los tipos de GraphQL cuyo `id` no identifica la fila (por ejemplo
  `StatisticsRanking`, que mezcla productos, vendedores y clientes) necesitan
  `keyFields: false` en `src/apollo/client.js`; si no, la caché de Apollo
  cruza filas de listados distintos.

- `SecurityEntitySelector` recibe de los formularios una función nueva en cada
  render; por eso guarda `onSelectionChange` en una referencia. Si se vuelve a
  poner en las dependencias del efecto, reaparece el bucle de renderizado.
- Las clases de PrimeFlex 2 (`p-grid`, `p-col-*`, `p-field`) no hacen nada con
  PrimeFlex 4; usar `grid`, `col-*`, `formgrid`.
- PrimeFlex no tiene `min-w-*rem` ni `font-mono`.
- La carpeta `.claude/` no se versiona.

## Pendiente

- Fallos anteriores sin corregir: el detalle de horarios consulta sin id
  (`WorkScheduleTable` pasa `scheduleId` y el formulario espera
  `workScheduleId`); la pestaña «Información adicional» del detalle de pagos
  nunca se muestra; `AttendanceTable` pasa `showDeleteFilter` y la tabla base
  espera `showDeleted`.
- Textos en inglés en `SecurityEntitySelector` («Business», «Select a
  business», «Clear»).
- El botón «Imprimir ticket» de la barra superior imprime un ticket de ejemplo.
