import { PageHeader } from "../../../../components/ui";
import { InventoryTable } from "../components/InventoryTable";

export function InventoryListPage() {
  return (
    <>
      <PageHeader
        title="Inventarios"
        subtitle="Existencias de cada producto en cada oficina. Registra aquí sus entradas y salidas."
      />
      <InventoryTable />
    </>
  );
}
