import React from "react";
import { Card } from "primereact/card";
import "../styles/ScopedAccessList.css";
import ScopedAccessTable from "../components/ScopedAccessTable";

export function ScopedAccessListPage() {
  return (
    <div className="scoped-access-list-page">
      <Card title="Gestión de Niveles de Acceso">
        <p className="p-text-secondary mb-4">
          Configure los niveles de acceso por negocio y operación. Cada nivel de
          acceso define qué alcance tendrán los usuarios para ejecutar
          operaciones específicas.
        </p>
        <ScopedAccessTable />
      </Card>
    </div>
  );
}
