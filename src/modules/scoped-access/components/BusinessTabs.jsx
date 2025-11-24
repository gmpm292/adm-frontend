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

  return (
    <div className="flex align-items-center gap-1">
      <Button
        icon="pi pi-building"
        label="Todos"
        className={selectedBusiness === "ALL" ? "" : "p-button-outlined"}
        onClick={() => onBusinessChange("ALL")}
      />
      {businesses.map((business) => (
        <Button
          key={business.id}
          label={business.name}
          className={
            selectedBusiness === business.id.toString()
              ? ""
              : "p-button-outlined"
          }
          onClick={() => onBusinessChange(business.id.toString())}
        />
      ))}
      {loading && <i className="pi pi-spinner pi-spin ml-2"></i>}
    </div>
  );
}
