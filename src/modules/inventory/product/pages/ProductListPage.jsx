import { PageHeader } from "../../../../components/ui";
import { ProductTable } from "../components/ProductTable";

export function ProductListPage() {
  return (
    <>
      <PageHeader
        title="Productos"
        subtitle="Catálogo de lo que se vende: precios en cada moneda, reglas de venta y existencias."
      />
      <ProductTable />
    </>
  );
}
