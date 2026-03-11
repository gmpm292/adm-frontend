import React from "react";
import { Card } from "primereact/card";
import { MaterialCostTable } from "../components/MaterialCostTable";
import "../styles/MaterialCostList.css";

export const MaterialCostListPage = () => {
  return (
    <div className="material-cost-list-page">
      <Card title="Gestión de Costos de Materiales">
        <MaterialCostTable />
      </Card>
    </div>
  );
};

export default MaterialCostListPage;
