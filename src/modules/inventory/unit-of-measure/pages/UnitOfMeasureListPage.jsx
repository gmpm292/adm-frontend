import React from "react";
import { PageHeader } from "../../../../components/ui";
import { UnitOfMeasureTable } from "../components/UnitOfMeasureTable";

export const UnitOfMeasureListPage = () => {
  return (
    <>
      <PageHeader
        title="Unidades de medida"
        subtitle="Unidades en las que se compran, almacenan y venden los productos. Son comunes a todas las empresas."
      />
      <UnitOfMeasureTable />
    </>
  );
};

export default UnitOfMeasureListPage;
