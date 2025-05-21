import React from "react";
import { Card } from "primereact/card";
import "../../styles/CompanyList.css";
import TeamTable from "../components/TeamTable";

export function TeamListPage() {
  return (
    <div className="team-list-page">
      <Card title="Gestión de Equipos">
        <TeamTable />
      </Card>
    </div>
  );
}