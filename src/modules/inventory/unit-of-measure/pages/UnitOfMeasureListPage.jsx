import React from "react";
import { PageHeader } from "../../../../components/ui";
import { UnitOfMeasureTable } from "../components/UnitOfMeasureTable";

export const UnitOfMeasureListPage = () => {
  return (
    <>
      <PageHeader
        title="Unidades de medida"
        subtitle="Define las unidades en las que se compran, almacenan y venden los productos."
      />
      <UnitOfMeasureTable />
    </>
  );
};

export default UnitOfMeasureListPage;
