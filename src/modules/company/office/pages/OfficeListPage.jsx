import React from "react";
import { Card } from "primereact/card";
import "../../styles/CompanyList.css";
import OfficeTable from "../components/OfficeTable";

export function OfficeListPage() {
  return (
    <div className="office-list-page">
      <Card title="Gestión de Oficinas">
        <OfficeTable />
      </Card>
    </div>
  );
}
