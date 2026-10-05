import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import { startOfMonth, startOfYear, subDays } from "date-fns";
import { toCalendarDay } from "../format";

export const PERIOD_PRESETS = [
  { label: "Hoy", value: "today" },
  { label: "7 días", value: "7d" },
  { label: "30 días", value: "30d" },
  { label: "Este mes", value: "month" },
  { label: "Este año", value: "year" },
  { label: "Personalizado", value: "custom" },
];

const DEFAULT_PRESET = "30d";

/** Primer y último día (inclusive) de cada periodo predefinido */
const getPresetRange = (preset) => {
  const today = new Date();
  switch (preset) {
    case "today":
      return [today, today];
    case "7d":
      return [subDays(today, 6), today];
    case "month":
      return [startOfMonth(today), today];
    case "year":
      return [startOfYear(today), today];
    default:
      return [subDays(today, 29), today];
  }
};

/**
 * Filtros compartidos por las vistas de estadísticas (periodo, moneda y
 * empresa) y la consulta que depende de ellos.
 *
 * @param query Consulta GraphQL que recibe `input: StatisticsFilterInput`
 * @param field Nombre del campo de la respuesta
 */
export function useStatistics(query, field) {
  const [preset, setPreset] = useState(DEFAULT_PRESET);
  const [customRange, setCustomRange] = useState(null);
  const [currency, setCurrency] = useState(null);
  const [businessId, setBusinessId] = useState(null);

  // El rango personalizado solo aplica cuando tiene sus dos fechas
  const customReady =
    preset === "custom" && customRange?.[0] && customRange?.[1];

  const input = useMemo(() => {
    const [from, to] = customReady ? customRange : getPresetRange(preset);
    return {
      dateFrom: toCalendarDay(from),
      dateTo: toCalendarDay(to),
      currency,
      businessId,
      utcOffsetMinutes: -new Date().getTimezoneOffset(),
    };
  }, [preset, customRange, customReady, currency, businessId]);

  const { data, previousData, loading, error, refetch } = useQuery(query, {
    variables: { input },
    fetchPolicy: "cache-and-network",
    skip: preset === "custom" && !customReady,
  });

  // Mientras llega un periodo nuevo se sigue mostrando el anterior
  const statistics = (data ?? previousData)?.[field] ?? null;

  return {
    statistics,
    loading,
    error,
    refetch,
    filters: {
      preset,
      setPreset,
      customRange,
      setCustomRange,
      currency: currency ?? statistics?.period?.currency ?? null,
      setCurrency,
      currencies: statistics?.period?.currencies ?? [],
      businessId,
      setBusinessId,
    },
  };
}
