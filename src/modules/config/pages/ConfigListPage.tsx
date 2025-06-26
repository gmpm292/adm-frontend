import React from "react";
import { Card } from "primereact/card";
import { ConfigTable } from "../components/ConfigTable";

export function ConfigListPage() {
  return (
    <div className="config-list-page">
      <Card title="Gestión de Configuraciones">
        <ConfigTable />
      </Card>
    </div>
  );
}
