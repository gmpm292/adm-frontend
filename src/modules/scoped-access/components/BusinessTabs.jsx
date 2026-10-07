import { useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { GET_BUSINESS_OPTIONS } from "../../company/shared/queries";

/** Filtro por empresa: `null` son todas */
export function BusinessTabs({ selectedBusiness, onBusinessChange }) {
  const { data, loading } = useQuery(GET_BUSINESS_OPTIONS);
  const businesses = data?.businesses?.data ?? [];

  // Pestaña activa: contorno principal; el resto, texto neutro
  const tabProps = (isActive) => ({
    size: "small",
    outlined: isActive,
    text: !isActive,
    severity: isActive ? undefined : "secondary",
  });

  return (
    <div className="flex flex-wrap align-items-center gap-1">
      <Button
        icon="pi pi-building"
        label="Todas"
        {...tabProps(selectedBusiness === null)}
        onClick={() => onBusinessChange(null)}
      />
      {businesses.map((business) => (
        <Button
          key={business.id}
          label={business.name}
          {...tabProps(selectedBusiness === business.id)}
          onClick={() => onBusinessChange(business.id)}
        />
      ))}
      {loading && <i className="pi pi-spinner pi-spin ml-2" />}
    </div>
  );
}
