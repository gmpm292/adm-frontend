import React from "react";
import { PageHeader } from "../../../../components/ui";
import { MaterialCostTable } from "../components/MaterialCostTable";

export const MaterialCostListPage = () => {
  return (
    <>
      <PageHeader
        title="Costos de materiales"
        subtitle="Registra los materiales, su unidad de medida y su precio de costo."
      />
      <MaterialCostTable />
    </>
  );
};

export default MaterialCostListPage;
