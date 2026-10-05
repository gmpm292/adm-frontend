import React from "react";
import { PageHeader } from "../../../../components/ui";
import DepartmentTable from "../components/DepartmentTable";

export function DepartmentListPage() {
  return (
    <>
      <PageHeader
        title="Departamentos"
        subtitle="Organiza los departamentos que componen cada oficina."
      />
      <DepartmentTable />
    </>
  );
}
