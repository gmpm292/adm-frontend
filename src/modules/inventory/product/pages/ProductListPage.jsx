import React from "react";
import { PageHeader } from "../../../../components/ui";
import { ProductTable } from "../components/ProductTable";

export function ProductListPage() {
  return (
    <>
      <PageHeader
        title="Productos"
        subtitle="Administra el catálogo de productos, sus precios y reglas de venta."
      />
      <ProductTable />
    </>
  );
}
