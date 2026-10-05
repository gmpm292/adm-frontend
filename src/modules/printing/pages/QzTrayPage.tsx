import React from "react";
import { PageHeader } from "../../../components/ui";
import { QzTrayConfig } from "../components/QzTrayConfig";

export function QzTrayPage() {
  return (
    <>
      <PageHeader
        title="Impresión Térmica"
        subtitle="Descarga el certificado de seguridad e instálalo en QZ Tray para habilitar la impresión."
      />
      <div className="grid">
        <div className="col-12 lg:col-8 xl:col-6">
          <QzTrayConfig />
        </div>
      </div>
    </>
  );
}
