# Administración Mipyme — Frontend

Aplicación web de administración para una Mipyme. Este repositorio contiene el
**frontend**; depende de un backend GraphQL para autenticar usuarios y leer o
modificar los datos de negocio. No incluye el servidor, el esquema completo de
la API ni la base de datos.

> Este documento describe el estado observado del código el 4 de octubre de
> 2026. Las observaciones sobre operaciones del backend deben confirmarse con
> el equipo que mantiene esa API.

## Propósito del sistema

El producto busca reunir en una sola aplicación la gestión de una empresa y sus
operaciones cotidianas: estructura organizativa, inventario, ventas, clientes,
personal y nómina. También incluye controles administrativos, reportes y
conexiones con servicios de correo e impresión.

El modelo organizativo visible en el frontend contempla esta jerarquía:

**Empresa → Oficina → Departamento → Equipo**

La interfaz permite trabajar con estos ámbitos en distintas entidades. La
aplicación consulta permisos y roles del usuario, pero la autorización efectiva
debe aplicarse y validarse también en el backend.

## Funcionalidades por área

| Área | Funcionalidades incluidas |
| --- | --- |
| Autenticación | Inicio y cierre de sesión, perfil, cambio de contraseña y consultas relacionadas con recuperación de acceso y 2FA. |
| Usuarios y administración | Listado de usuarios, configuración general y perfil personal. |
| Organización | Gestión de empresas, oficinas, departamentos y equipos. |
| Inventario | Categorías, productos, unidades de medida, existencias y movimientos de inventario. |
| Ventas | Clientes, ventas, detalles, entregas y un flujo de venta integrada. |
| Venta integrada | Selección o creación de cliente, productos, personal asociado, entrega y procesamiento de pagos; las ventas pendientes se guardan localmente en el navegador. |
| Nómina y personal | Trabajadores, asistencia, monedas, reglas de pago, períodos, horarios, pagos a trabajadores y costos de materiales. |
| Seguridad administrativa | Configuración de controles por rol y acceso por entidad. |
| Estadísticas | Paneles y resúmenes de ventas. Actualmente algunos gráficos y cifras son datos estáticos de ejemplo, no reportes conectados al backend. |
| Correo | Flujo de autorización OAuth de Google y consulta del estado del servicio de correo. |
| Impresión | Integración con QZ Tray para impresoras disponibles en el entorno del usuario. |

## Tecnologías

- **React 19** y **React DOM 19** para la interfaz.
- **Vite 6** y `@vitejs/plugin-react` para desarrollo y empaquetado.
- **JavaScript y TypeScript**: el código mezcla `.js`/`.jsx` y `.ts`/`.tsx`.
- **React Router 7** con `HashRouter`, adecuado para navegación SPA en hosting estático.
- **Apollo Client 3** y **GraphQL 16** para comunicarse con la API.
- **PrimeReact 10**, **PrimeFlex 4**, **PrimeIcons 7** y **PrimeLocale** para controles, estilos e internacionalización.
- **Formik** y **Yup** para formularios y validaciones.
- **Chart.js 4** para visualizaciones.
- **date-fns** y **uuid** para utilidades de fechas e identificadores.

Las versiones declaradas están en `package.json`; `package-lock.json` fija el
árbol de dependencias instalado.

## Arquitectura del frontend

- `src/main.jsx`: punto de entrada React.
- `src/App.jsx`: proveedores globales, navegación, rutas y composición de los
  módulos.
- `src/modules/`: funcionalidades agrupadas por dominio; cada módulo suele
  contener páginas, componentes y consultas GraphQL.
- `src/apollo/`: configuración compartida de Apollo Client, transporte GraphQL
  y manejo de errores/autenticación.
- `src/config/`: definición del menú y configuración de roles/permisos de ruta.
- `src/hooks/`: hooks compartidos para autenticación y permisos.
- `src/layout/`: estructura visual, barra superior y menú lateral.
- `src/components/` y `src/utils/`: componentes y funciones compartidas.
- `public/`: recursos servidos sin empaquetar, incluido el cliente de QZ Tray.

### Comunicación y sesión

Apollo envía operaciones a la URL definida por `VITE_API_URL` e incluye
credenciales de navegador (`credentials: "include"`). El frontend consulta el
perfil al iniciar y usa cookies y una operación GraphQL de renovación de token.
Los detalles de emisión, caducidad y validación de tokens pertenecen al backend
y deben revisarse allí.

Las rutas privadas pasan por un guard de autenticación/permisos. Existe además
un menú filtrado por roles y permisos. Estos controles son parte de la
experiencia de usuario, no sustituyen las reglas de autorización del servidor.

### Persistencia local

Las ventas pendientes del flujo integrado se guardan en `localStorage` del
navegador. No son un almacenamiento compartido ni una copia sincronizada con el
backend; pueden no estar disponibles en otro navegador o dispositivo.

## Requisitos y configuración local

- Node.js y npm instalados. El workflow actual de despliegue usa Node.js 18.
- Acceso a una instancia compatible con la API GraphQL del sistema.
- Para probar impresión, QZ Tray instalado y disponible en el equipo cliente.
- Para probar OAuth de correo, configuración válida en el backend y en Google.

Crear un archivo `.env` en la raíz con la dirección GraphQL del entorno:

```dotenv
VITE_API_URL=https://api.ejemplo.com/graphql
```

Reemplaza el valor de ejemplo por la URL real que entregue el equipo del
backend. Las variables con prefijo `VITE_` se incluyen en el código enviado al
navegador: **no guardar secretos, contraseñas, claves privadas ni tokens en
ellas**.

El repositorio ignora `.env` para cambios futuros, pero el archivo `.env`
aparece actualmente versionado. Antes de trabajar con credenciales reales, los
responsables deben comprobar su contenido e historial, retirar del repositorio
cualquier dato sensible y rotar cualquier secreto que se haya publicado. No
usar el valor del archivo versionado como configuración de producción sin
revisarlo.

## Comandos

Desde la raíz del proyecto:

```bash
# Instalar exactamente las versiones del lockfile (recomendado para CI)
npm ci

# Alternativa para instalación/actualización local de dependencias
npm install

# Servidor local de desarrollo; Vite usa el puerto 3001
npm run dev

# Exponer el servidor de desarrollo en la red local
npm run dev:net

# Crear el paquete optimizado de producción en dist/
npm run build

# Servir localmente el paquete creado con npm run build
npm run preview

# Ejecutar ESLint
npm run lint
```

`npm run deploy` publica el directorio `dist/` usando `gh-pages`; primero hay
que generar el build. El despliegue automatizado actual se describe a
continuación.

## Infraestructura y despliegue

### Frontend

El workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
despliega a **GitHub Pages** cuando hay un `push` a la rama `develop`. Usa
GitHub Actions, instala dependencias, ejecuta `npm run build` y publica `dist/`
en la rama `gh-pages`. La configuración Vite establece:

- Puerto local de desarrollo: `3001`.
- Directorio de salida: `dist/`.
- Prefijo base de publicación: `/adm-frontend/`.

El router usa fragmentos (`/#/...`), por lo que la navegación de la SPA no
requiere que GitHub Pages resuelva rutas profundas en el servidor. Si se mueve
la aplicación a otro dominio o subdirectorio, revisar juntos `base` en
`vite.config.js`, el `homepage` de `package.json`, los recursos públicos y las
URLs de callback de OAuth.

### Dependencias externas

- **Backend GraphQL**: proporciona autenticación, datos, mutaciones, reglas de
  negocio y los servicios relacionados con correo e impresión.
- **Google OAuth**: autorización externa para configurar el correo; el frontend
  participa en el inicio y callback, pero los secretos y tokens deben
  permanecer en el servidor.
- **QZ Tray**: aplicación/servicio local que permite imprimir desde el equipo
  cliente. El repositorio incluye `public/qz-tray.js`; la firma y el
  certificado se solicitan al backend.
- **GitHub Actions y GitHub Pages**: construcción automatizada y hosting del
  frontend.

No se encontró infraestructura de backend, base de datos, almacenamiento de
ventas pendientes en servidor ni definición completa del esquema GraphQL en
este repositorio.

## Estado conocido, limitaciones y riesgos

Los siguientes puntos se identificaron mediante inspección del frontend; no
todos se pueden confirmar sin ejecutar la aplicación conectada al backend:

1. **Flujo de venta con entrega:** la ruta que finaliza una venta con entrega
   parece crear o actualizar la venta y reiniciar la interfaz sin pasar por el
   mismo procesamiento de pago que usa la venta normal. Confirmar la semántica
   del backend y probar si la venta queda efectivamente cobrada/confirmada.
2. **Precios y pagos:** la selección de productos usa el precio base mientras
   existen campos para configuración de precios, monedas y reglas de venta.
   Verificar descuentos, moneda y totales con el comportamiento del backend.
3. **Roles y permisos:** varias rutas no tienen restricciones declaradas en la
   configuración del frontend, y algunos helpers consultan `user.roles`
   mientras las consultas de perfil visibles solicitan `role`. Normalizar el
   modelo y verificar autorización del lado servidor.
4. **Ruta de acceso denegado:** el guard navega a `/unauthorized`, pero no se
   encontró una ruta explícita para esa página en la configuración principal.
5. **Renovación de sesión:** el manejo de varias solicitudes no autorizadas
   concurrentes en el cliente Apollo requiere pruebas específicas para evitar
   reintentos o cierres de sesión incorrectos.
6. **Segundo factor:** hay operaciones GraphQL relacionadas con 2FA, pero el
   botón de configuración visible en el perfil no muestra una acción conectada.
   Confirmar y completar el recorrido de configuración y autenticación.
7. **Ventas pendientes:** se guardan solo en el navegador y en
   `localStorage`; no hay sincronización entre dispositivos ni vínculo visible
   al usuario autenticado.
8. **Estadísticas:** varios gráficos y cifras son valores de ejemplo; no deben
   usarse para decisiones operativas hasta conectarlos a datos reales.
9. **Validación automatizada:** no se encontraron pruebas automatizadas ni un
   script de pruebas en `package.json`. Tampoco hay un script de typecheck.
10. **Lint:** la ejecución de ESLint sobre `src` reportó errores en múltiples
    archivos. El comando general también analiza `public/qz-tray.js`, una
    librería vendorizada con errores de lint propios.
11. **Tamaño del build:** Vite advierte que el bundle JavaScript principal
    supera el umbral de 500 kB; evaluar carga diferida de módulos y gráficas.
12. **Dependencias:** una instalación reciente reportó vulnerabilidades en el
    árbol de dependencias. Revisar `npm audit` y evaluar cada actualización,
    evitando actualizaciones mayores automáticas sin pruebas.
13. **CI:** el workflow de despliegue compila, pero no ejecuta lint ni pruebas
    antes de publicar.
14. **Documentación:** el README anterior era la plantilla inicial de Vite; no
    se encontró documentación de la API ni guía del backend en este repositorio.

### Validación observada

En el análisis del 4 de octubre de 2026:

- `npm run build`: compiló correctamente, con advertencia de tamaño de bundle.
- ESLint sobre `src`: reportó 40 errores en 25 archivos.
- No se encontraron archivos `test`/`spec` ni un comando de pruebas.
- `npm install` reportó 25 vulnerabilidades en dependencias (3 bajas,
  3 moderadas y 19 altas). El resultado puede cambiar al actualizar el lockfile
  o las dependencias.

Un build exitoso confirma que Vite puede empaquetar la aplicación; no prueba la
disponibilidad del backend, la compatibilidad del esquema GraphQL ni la
corrección de los flujos de negocio.

## Prioridades recomendadas para estabilizar el producto

1. Acordar contratos y reglas con el backend, empezando por el ciclo de venta,
   cobros, moneda, inventario y cancelaciones.
2. Probar manualmente y automatizar los flujos críticos: autenticación,
   permisos por rol y entidad, venta normal, venta con entrega, pago mixto,
   movimientos de inventario y renovación de sesión.
3. Unificar el modelo de roles/permisos y asegurar que todas las mutaciones y
   consultas estén protegidas por el backend.
4. Completar los flujos de 2FA y acceso denegado, y revisar persistencia y
   limpieza de datos locales al cerrar sesión.
5. Añadir validaciones de build, lint y pruebas al workflow de CI antes del
   despliegue.
6. Resolver errores de lint, revisar vulnerabilidades de dependencias y medir
   el impacto del code splitting.
7. Reemplazar los datos estáticos de estadísticas y documentar los contratos
   de API y configuración por entorno.

## Referencias del proyecto

- Configuración de dependencias y scripts: [`package.json`](./package.json).
- Build, puerto y base de publicación: [`vite.config.js`](./vite.config.js).
- Despliegue en GitHub Actions: [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml).
- Rutas principales de la aplicación: [`src/App.jsx`](./src/App.jsx).
- Consultas de autenticación: [`src/modules/auth/graphql/queries.js`](./src/modules/auth/graphql/queries.js).
- Cliente GraphQL: [`src/apollo/client.js`](./src/apollo/client.js).
