import React from "react";
import { Card } from "primereact/card";
import "../../styles/CompanyList.css";
import DepartmentTable from "../components/DepartmentTable";

export function DepartmentListPage() {
  return (
    <div className="department-list-page">
      <Card title="Gestión de Departamentos">
        <DepartmentTable />
      </Card>
    </div>
  );
}