import { useQuery } from "@apollo/client";
import { Dropdown } from "primereact/dropdown";
import { FormField } from "../../../components/ui";
import { ALL_BUSINESSES } from "./business";
import { GET_BUSINESS_OPTIONS } from "./queries";

/**
 * Empresa de lo que crea un SUPER (se muestra con `useChoosesBusiness`).
 * `value` es el id, `ALL_BUSINESSES` o `null` (sin elegir). Con `allowAll`
 * ofrece «Todas las empresas»; `businessIdFor` lo traduce para la API.
 */
export function BusinessField({
  id,
  value,
  onChange,
  error,
  hint,
  allowAll = false,
}) {
  const { data, loading } = useQuery(GET_BUSINESS_OPTIONS);
  const options = [
    ...(allowAll
      ? [{ name: "Todas las empresas (común)", id: ALL_BUSINESSES }]
      : []),
    ...(data?.businesses?.data ?? []),
  ];

  return (
    <FormField label="Empresa" htmlFor={id} required hint={hint} error={error}>
      <Dropdown
        inputId={id}
        value={value}
        options={options}
        optionLabel="name"
        optionValue="id"
        onChange={(e) => onChange(e.value)}
        placeholder="Elige la empresa"
        emptyMessage="No hay empresas"
        loading={loading}
        filter={options.length > 8}
        invalid={!!error}
      />
    </FormField>
  );
}
