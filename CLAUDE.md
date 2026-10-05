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
- `src/components/ui/index.jsx`: `PageHeader`, `FormField`, `AuthLayout`,
  `EmptyState`, `LoadingScreen`, `OtpInput`, `QrPanel`.
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

## Trampas conocidas

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
- Archivos de respaldo sin uso: `ProductCreateForm.jsx.old`,
  `PublicistSection.jsx.txt`, `SaleSummary.jsx.txt`.
- El botón «Imprimir ticket» de la barra superior imprime un ticket de ejemplo.
