/**
 * Genera src/theme/primereact.generated.css a partir del tema Lara de PrimeReact,
 * sustituyendo sus colores y radios fijos por los tokens de src/theme/tokens.css.
 *
 * Así todos los componentes de PrimeReact toman el diseño del sistema desde un
 * único lugar. Ejecutar tras actualizar primereact:  npm run theme:build
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.join(
  root,
  "node_modules/primereact/resources/themes/lara-light-blue"
);
const targetDir = path.join(root, "src/theme");

/** Color fijo del tema Lara -> token del sistema */
const colors = {
  // Primario
  "#3b82f6": "var(--primary-600)",
  "#2563eb": "var(--primary-700)",
  "#1d4ed8": "var(--primary-700)",
  "#022354": "var(--primary-900)",
  "#bfdbfe": "var(--primary-200)",
  "#9dc1fb": "var(--primary-300)",
  "#70aeff": "var(--primary-300)",
  "#8cbeff": "var(--primary-200)",
  "#eff6ff": "var(--primary-50)",
  // Neutros
  "#f9fafb": "var(--surface-50)",
  "#f8f9fa": "var(--surface-50)",
  "#f8f8fa": "var(--surface-50)",
  "#f3f4f6": "var(--surface-100)",
  "#f2f2f2": "var(--surface-100)",
  "#e5e7eb": "var(--surface-200)",
  "#e2e8f0": "var(--surface-200)",
  "#d1d5db": "var(--surface-300)",
  "#b7bcc5": "var(--surface-300)",
  "#b0b9c6": "var(--surface-300)",
  "#9ca3af": "var(--surface-400)",
  "#6b7280": "var(--surface-500)",
  "#64748b": "var(--surface-500)",
  "#475569": "var(--surface-600)",
  "#4b5563": "var(--surface-700)",
  "#334155": "var(--surface-700)",
  "#374151": "var(--surface-800)",
  "#1f2937": "var(--surface-900)",
  // Estados
  "#22c55e": "var(--success-500)",
  "#16a34a": "var(--success-600)",
  "#1ea97c": "var(--success-600)",
  "#15803d": "var(--success-700)",
  "#bbf7d0": "var(--success-100)",
  "#f97316": "var(--warning-500)",
  "#ea580c": "var(--warning-600)",
  "#cc8925": "var(--warning-600)",
  "#c2410c": "var(--warning-700)",
  "#fde68a": "var(--warning-100)",
  "#ef4444": "var(--danger-500)",
  "#e24c4c": "var(--danger-500)",
  "#ff5757": "var(--danger-500)",
  "#ea5455": "var(--danger-500)",
  "#dc2626": "var(--danger-600)",
  "#b91c1c": "var(--danger-700)",
  "#fecaca": "var(--danger-100)",
  "#0ea5e9": "var(--info-500)",
  "#0284c7": "var(--info-600)",
  "#0369a1": "var(--info-700)",
  "#a855f7": "var(--help-500)",
  "#9333ea": "var(--help-600)",
  "#7e22ce": "var(--help-700)",
  "#e9d5ff": "var(--help-100)",
};

/** rgb(a) fijo del tema Lara -> canal RGB del sistema */
const channels = {
  "59,130,246": "var(--primary-rgb)",
  "100,116,139": "var(--surface-rgb)",
  "31,41,55": "var(--surface-rgb)",
  "34,197,94": "var(--success-rgb)",
  "249,115,22": "var(--warning-rgb)",
  "239,68,68": "var(--danger-rgb)",
  "14,165,233": "var(--info-rgb)",
  "168,85,247": "var(--help-rgb)",
};

/** Fondos translúcidos de mensajes -> tono claro del estado */
const tints = {
  "219,234,254": "var(--info-50)",
  "228,248,240": "var(--success-50)",
  "255,242,226": "var(--warning-50)",
  "255,231,230": "var(--danger-50)",
};

const tokenize = (css) =>
  css
    .replace(/#[0-9a-fA-F]{6}\b/g, (hex) => colors[hex.toLowerCase()] ?? hex)
    .replace(
      /rgba\(\s*(\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\s*\)/g,
      (match, r, g, b, alpha) => {
        const key = `${r},${g},${b}`;
        if (tints[key]) return tints[key];
        if (channels[key]) return `rgba(${channels[key]}, ${alpha})`;
        return match;
      }
    )
    .replace(/radius:[^;]+;/g, (decl) =>
      decl.replace(/\b6px\b/g, "var(--border-radius)")
    );

const source = fs.readFileSync(path.join(sourceDir, "theme.css"), "utf8");

// Las paletas declaradas en :root se conservan tal cual (las usa PrimeFlex);
// tokens.css se carga después y redefine las del sistema.
const output = source
  .split(/(:root\s*\{[^}]*\})/g)
  .map((chunk) => (chunk.startsWith(":root") ? chunk : tokenize(chunk)))
  .join("");

const banner =
  "/* ARCHIVO GENERADO por scripts/build-theme.mjs — no editar a mano.\n" +
  "   Los valores de diseño viven en tokens.css. */\n";

fs.mkdirSync(path.join(targetDir, "fonts"), { recursive: true });
fs.writeFileSync(path.join(targetDir, "primereact.generated.css"), banner + output);
for (const font of fs.readdirSync(path.join(sourceDir, "fonts"))) {
  fs.copyFileSync(
    path.join(sourceDir, "fonts", font),
    path.join(targetDir, "fonts", font)
  );
}

const leftovers = [
  ...new Set(
    output
      .replace(/:root\s*\{[^}]*\}/g, "")
      .match(/#[0-9a-fA-F]{6}\b/g)
      ?.map((hex) => hex.toLowerCase())
      .filter((hex) => hex !== "#ffffff") ?? []
  ),
];
console.log(`Tema generado en src/theme/primereact.generated.css`);
console.log(`Colores fijos sin token (${leftovers.length}): ${leftovers.join(" ")}`);
