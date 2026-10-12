import { useMemo } from "react";
import { useFilteredMenu } from "../../hooks/useFilteredMenu";
import { helpSections } from "./content";

// Pantallas fuera del menú lateral que todo usuario con sesión puede abrir
const ALWAYS_OPEN = ["/profile", "/help"];

const collectPaths = (items) =>
  items.flatMap((item) => [
    ...(item.path ? [item.path] : []),
    ...collectPaths(item.items ?? []),
  ]);

/** Quita tildes y mayúsculas para que la búsqueda no dependa de ellas */
export const normalize = (text) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

const guideText = (guide) =>
  normalize(
    [
      guide.title,
      guide.summary,
      ...(guide.before ?? []),
      ...guide.steps.map((step) => step.text),
      ...(guide.notes ?? []),
    ].join(" ")
  );

/**
 * Guías que el usuario puede seguir: las que explican al menos una pantalla
 * a la que tiene acceso. Usa el mismo filtro que el menú lateral, así nadie
 * ve la guía de una pantalla que no puede abrir.
 */
export function useHelpGuides() {
  const { filteredMenu, loading } = useFilteredMenu();

  return useMemo(() => {
    const paths = new Set([...collectPaths(filteredMenu), ...ALWAYS_OPEN]);
    const canOpen = (path) => paths.has(path);

    const sections = helpSections
      .map((section) => ({
        ...section,
        guides: section.guides
          .filter((guide) => guide.routes.some(canOpen))
          .map((guide) => ({
            ...guide,
            sectionLabel: section.label,
            searchText: guideText(guide),
          })),
      }))
      .filter((section) => section.guides.length > 0);

    const guides = sections.flatMap((section) => section.guides);
    const findGuide = (id) => guides.find((guide) => guide.id === id);
    const guidesForPath = (path) =>
      guides.filter((guide) => guide.routes.includes(path));

    return { sections, canOpen, findGuide, guidesForPath, loading };
  }, [filteredMenu, loading]);
}
