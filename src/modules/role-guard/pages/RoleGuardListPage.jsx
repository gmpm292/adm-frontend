import React from "react";
import { Card } from "primereact/card";

import "../styles/RoleGuardList.css";
import RoleGuardTable from "../components/RoleGuardTable";

export function RoleGuardListPage() {
  return (
    <div className="role-guard-list-page">
      <Card title="Gestión de Permisos GraphQL">
        <p className="p-text-secondary mb-4">
          Configure los roles permitidos para cada operación GraphQL (queries,
          mutations, subscriptions) del sistema. Las operaciones nuevas se
          detectan automáticamente al iniciar el backend.
        </p>
        <RoleGuardTable />
      </Card>
    </div>
  );
}
