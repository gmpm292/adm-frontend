import React from "react";
import { Button } from "primereact/button";
import { useLazyQuery } from "@apollo/client";
import { GET_BUSINESSES } from "../../company/business/graphql/queries";

export function BusinessTabs({ selectedBusiness, onBusinessChange }) {
  const [getBusinesses, { data, loading }] = useLazyQuery(GET_BUSINESSES, {
    variables: { options: { take: 100 } },
    fetchPolicy: "network-only",
  });

  React.useEffect(() => {
    getBusinesses();
  }, [getBusinesses]);

  const businesses = data?.businesses?.data || [];

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
        label="Todos"
        {...tabProps(selectedBusiness === "ALL")}
        onClick={() => onBusinessChange("ALL")}
      />
      {businesses.map((business) => (
        <Button
          key={business.id}
          label={business.name}
          {...tabProps(selectedBusiness === business.id.toString())}
          onClick={() => onBusinessChange(business.id.toString())}
        />
      ))}
      {loading && <i className="pi pi-spinner pi-spin ml-2"></i>}
    </div>
  );
}
