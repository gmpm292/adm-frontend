import React from "react";
import { PageHeader } from "../../../../components/ui";
import { InventoryMovementTable } from "../components/InventoryMovementTable";

export function InventoryMovementListPage() {
  return (
    <>
      <PageHeader
        title="Movimientos de inventario"
        subtitle="Revisa las entradas, salidas y ajustes de existencias."
      />
      <InventoryMovementTable />
    </>
  );
}
