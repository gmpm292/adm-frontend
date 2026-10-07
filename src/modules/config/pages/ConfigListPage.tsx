import React from "react";
import { PageHeader } from "../../../components/ui";
import { ConfigTable } from "../components/ConfigTable";

export function ConfigListPage() {
  return (
    <>
      <PageHeader
        title="Configuraciones"
        subtitle="Valores que usa el servidor, por grupos. Los grupos los define el sistema; aquí se ajustan sus valores."
      />
      <ConfigTable />
    </>
  );
}
