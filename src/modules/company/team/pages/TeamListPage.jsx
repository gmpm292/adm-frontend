import React from "react";
import { PageHeader } from "../../../../components/ui";
import TeamTable from "../components/TeamTable";

export function TeamListPage() {
  return (
    <>
      <PageHeader
        title="Equipos"
        subtitle="Gestiona los equipos de trabajo de cada departamento."
      />
      <TeamTable />
    </>
  );
}
