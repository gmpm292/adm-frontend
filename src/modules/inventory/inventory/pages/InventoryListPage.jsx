import React from "react";
import { PageHeader } from "../../../../components/ui";
import { InventoryTable } from "../components/InventoryTable";

export function InventoryListPage() {
  return (
    <>
      <PageHeader
        title="Inventarios"
        subtitle="Consulta las existencias de cada producto y registra sus movimientos."
      />
      <InventoryTable />
    </>
  );
}
