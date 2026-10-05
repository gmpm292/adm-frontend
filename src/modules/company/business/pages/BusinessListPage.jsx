import React from "react";
import { PageHeader } from "../../../../components/ui";
import BusinessTable from "../components/BusinessTable";

export function BusinessListPage() {
  return (
    <>
      <PageHeader
        title="Empresas"
        subtitle="Registra las empresas y sus datos fiscales y de contacto."
      />
      <BusinessTable />
    </>
  );
}
