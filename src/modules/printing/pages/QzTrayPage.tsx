import React from "react";
import { Card } from "primereact/card";
import { QzTrayConfig } from "../components/QzTrayConfig";

export function QzTrayPage() {
  return (
    <div className="p-4">
      <Card title="Configuración de Impresión Térmica">
        <QzTrayConfig />
      </Card>
    </div>
  );
}
