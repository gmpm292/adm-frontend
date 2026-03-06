import React from "react";
import { Card } from "primereact/card";
import { UnitOfMeasureTable } from "../components/UnitOfMeasureTable";
import "../styles/UnitOfMeasureList.css";

export const UnitOfMeasureListPage = () => {
  return (
    <div className="unit-of-measure-list-page">
      <Card title="Gestión de Unidades de Medida">
        <UnitOfMeasureTable />
      </Card>
    </div>
  );
};

export default UnitOfMeasureListPage;
