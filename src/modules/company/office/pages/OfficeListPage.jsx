import React from "react";
import { PageHeader } from "../../../../components/ui";
import OfficeTable from "../components/OfficeTable";

export function OfficeListPage() {
  return (
    <>
      <PageHeader
        title="Oficinas"
        subtitle="Administra las oficinas y sucursales de cada empresa."
      />
      <OfficeTable />
    </>
  );
}
