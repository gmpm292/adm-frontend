// Categorías de unidad: las mismas que admite el backend (unit-categories.ts)
export const UNIT_CATEGORIES = [
  { value: "unidades", label: "Unidades" },
  { value: "peso", label: "Peso" },
  { value: "volumen", label: "Volumen" },
  { value: "longitud", label: "Longitud" },
  { value: "área", label: "Área" },
  { value: "tiempo", label: "Tiempo" },
  { value: "energía", label: "Energía" },
  { value: "potencia", label: "Potencia" },
  { value: "temperatura", label: "Temperatura" },
];

export const unitCategoryLabel = (value) =>
  UNIT_CATEGORIES.find((category) => category.value === value)?.label ??
  value;
