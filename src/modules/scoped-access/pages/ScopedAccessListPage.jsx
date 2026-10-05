import React from "react";
import { PageHeader } from "../../../components/ui";
import ScopedAccessTable from "../components/ScopedAccessTable";

export function ScopedAccessListPage() {
  return (
    <>
      <PageHeader
        title="Niveles de Acceso"
        subtitle="Configure qué alcance tendrán los usuarios al ejecutar cada operación en cada negocio."
      />
      <ScopedAccessTable />
    </>
  );
}
