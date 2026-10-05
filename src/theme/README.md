# Sistema de diseño

Toda la apariencia de la aplicación sale de esta carpeta. Las pantallas no
definen estilos: componen componentes y usan clases de utilidad.

## Archivos

| Archivo | Qué contiene |
| --- | --- |
| `tokens.css` | Colores, tipografía, espaciado, radios, sombras y medidas. Única fuente de valores. |
| `primereact.generated.css` | Tema de PrimeReact enlazado a los tokens. Generado con `npm run theme:build`; no se edita. |
| `components.css` | Forma de los componentes de PrimeReact y estilos de `src/components/ui`. |
| `layout.css` | Base del documento, marco de la aplicación y pantallas de acceso. |
| `pages/*.css` | Composiciones propias de una pantalla que las utilidades no pueden expresar. Solo tokens. |
| `index.css` | Punto de entrada; lo importa `src/main.jsx` y nadie más. |

## Reglas

1. Ningún archivo `.css` fuera de `src/theme`, y ningún componente importa CSS.
2. Nada de `style={{ ... }}` ni de `headerStyle`, `bodyStyle`, `contentStyle`.
   El único caso admitido es un valor calculado en tiempo de ejecución (por
   ejemplo el ancho de una barra de progreso), con su comentario
   `eslint-disable-next-line` explicando por qué.
3. Ningún color, medida o sombra escritos a mano. En CSS se usa `var(--token)`;
   en JSX, clases de PrimeFlex (`flex`, `gap-3`, `col-12 md:col-6`, `w-10rem`,
   `text-color-secondary`, `mb-4`...).
4. Si falta algo, se añade aquí (un token, un componente en `src/components/ui`
   o una clase en `components.css`) y se reutiliza. No se resuelve en la pantalla.

## Cómo se construye una pantalla

- **Página de listado**: `<PageHeader title subtitle />` seguido de la tabla
  (`components/BaseTable`). Sin `Card` envolviendo la tabla.
- **Acciones de fila**: contenedor `actions-column` con
  `<Button text rounded icon severity tooltip />`.
- **Estados**: `<Tag severity value />` (`success`, `warning`, `danger`, `info`).
- **Formularios**: `<FormField label htmlFor required hint error>` con el control
  de PrimeReact dentro, sobre una rejilla `formgrid grid` y columnas
  `col-12 md:col-6`. El control marca el error con la propiedad `invalid`.
- **Diálogos**: `<Dialog>` con clase de ancho (`w-full md:w-30rem`); botones
  alineados a la derecha, primero «Cancelar» (`severity="secondary"`) y después
  la acción principal.
- **Botones**: uno principal por vista (sin `severity`); secundarios con
  `severity="secondary"`; destructivos con `severity="danger"`.
- **Vacío, carga y acceso**: `EmptyState`, `LoadingScreen`, `AuthLayout`.
