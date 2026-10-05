import React from "react";
import { PageHeader } from "../../../components/ui";
import { ConfigTable } from "../components/ConfigTable";

export function ConfigListPage() {
  return (
    <>
      <PageHeader
        title="Configuraciones"
        subtitle="Consulta y ajusta los parámetros del sistema agrupados por categoría."
      />
      <ConfigTable />
    </>
  );
}
