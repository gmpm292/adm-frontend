import React from "react";
import { Card } from "primereact/card";
import "../../styles/CompanyList.css";
import BusinessTable from "../components/BusinessTable";

export function BusinessListPage() {
  return (
    <div className="business-list-page">
      <Card title="Gestión de Empresas">
        <BusinessTable />
      </Card>
    </div>
  );
}
