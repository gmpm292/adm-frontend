import React from "react";

import { PageHeader } from "../../../components/ui";
import RoleGuardTable from "../components/RoleGuardTable";

export function RoleGuardListPage() {
  return (
    <>
      <PageHeader
        title="Permisos GraphQL"
        subtitle="Configure los roles permitidos para cada operación GraphQL; las operaciones nuevas se detectan automáticamente al iniciar el backend."
      />
      <RoleGuardTable />
    </>
  );
}
