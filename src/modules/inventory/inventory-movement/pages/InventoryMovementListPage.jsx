import { PageHeader } from "../../../../components/ui";
import { InventoryMovementTable } from "../components/InventoryMovementTable";

export function InventoryMovementListPage() {
  return (
    <>
      <PageHeader
        title="Movimientos de inventario"
        subtitle="Todo lo que entra y sale: compras, ventas, devoluciones, traslados y ajustes."
      />
      <InventoryMovementTable />
    </>
  );
}
