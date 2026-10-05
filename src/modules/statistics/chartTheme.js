// Los colores de un gráfico son datos de configuración de Chart.js, no CSS:
// se leen de los tokens de diseño (src/theme/tokens.css) en tiempo de ejecución.
const readToken = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/**
 * Paleta de los gráficos: una sola familia, azules de la marca y grises.
 * Las series se distinguen por tono, no por colores distintos.
 */
export function getChartColors() {
  return {
    primary: readToken("--primary-600"),
    area: `rgba(${readToken("--primary-rgb")}, 0.08)`,
    series: [
      readToken("--primary-600"),
      readToken("--primary-400"),
      readToken("--primary-200"),
      readToken("--surface-400"),
      readToken("--primary-800"),
      readToken("--surface-300"),
    ],
    surface: readToken("--surface-0"),
    text: readToken("--surface-600"),
    grid: readToken("--surface-200"),
  };
}

/** Opciones comunes: el gráfico ocupa el alto de su contenedor */
export function getBaseChartOptions(colors, { legend = true } = {}) {
  return {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: legend,
        position: "bottom",
        labels: { color: colors.text, usePointStyle: true },
      },
    },
  };
}

/** Eje con los tonos del tema */
export function getAxis(colors, { grid = true, format } = {}) {
  return {
    ticks: { color: colors.text, ...(format && { callback: format }) },
    grid: { color: colors.grid, display: grid },
    border: { color: colors.grid },
  };
}
