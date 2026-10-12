/**
 * Guías del centro de ayuda, por área.
 *
 * Cada guía:
 * - `id`: identificador estable (va en la dirección: /help?guia=id).
 * - `routes`: pantallas que explica. La guía solo la ve quien puede abrir
 *   alguna, y sale en el panel de ayuda (botón ?) de esas pantallas.
 * - `summary`, `before` (qué tiene que existir antes), `steps` (con `path`,
 *   la pantalla a la que lleva el paso), `notes` y `related` (ids).
 *
 * En los textos, lo que va entre «» es algo que se ve en pantalla (un botón,
 * un campo, una opción): se escribe tal cual aparece para poder encontrarlo.
 * Si cambia un texto en una pantalla, hay que cambiarlo aquí.
 */
import { startGuides } from "./start";
import { salesGuides } from "./sales";
import { inventoryGuides } from "./inventory";
import { payrollGuides } from "./payroll";
import { settingsGuides } from "./settings";

export const helpSections = [
  {
    key: "start",
    label: "Primeros pasos",
    icon: "pi pi-flag",
    guides: startGuides,
  },
  {
    key: "sales",
    label: "Ventas",
    icon: "pi pi-shopping-cart",
    guides: salesGuides,
  },
  {
    key: "inventory",
    label: "Inventario y nomencladores",
    icon: "pi pi-box",
    guides: inventoryGuides,
  },
  {
    key: "payroll",
    label: "Nómina",
    icon: "pi pi-wallet",
    guides: payrollGuides,
  },
  {
    key: "settings",
    label: "Configuración",
    icon: "pi pi-cog",
    guides: settingsGuides,
  },
];
