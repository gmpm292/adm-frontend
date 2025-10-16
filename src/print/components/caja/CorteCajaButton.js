import React from "react";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { usePrint } from "../../hooks/usePrint";
import { formatCashCutData } from "../../utils/ticketFormatters";

const CorteCajaButton = ({ corteData, onCorteCompletado }) => {
  const { printCashCut, printing } = usePrint();

  const confirmarCorte = () => {
    confirmDialog({
      message:
        "¿Está seguro de realizar el corte de caja? Se imprimirá un ticket con el resumen.",
      header: "Confirmar Corte de Caja",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sí, realizar corte",
      rejectLabel: "Cancelar",
      accept: async () => {
        try {
          const ticketData = formatCashCutData(corteData);
          await printCashCut(ticketData);

          if (onCorteCompletado) {
            onCorteCompletado(corteData);
          }
        } catch (error) {
          console.error("Error en corte de caja:", error);
        }
      },
    });
  };

  return (
    <>
      <ConfirmDialog />
      <Button
        label={printing ? "Imprimiendo corte..." : "Corte de Caja"}
        icon={printing ? "pi pi-spin pi-spinner" : "pi pi-chart-bar"}
        severity="warning"
        onClick={confirmarCorte}
        disabled={printing}
        className="w-full"
      />
    </>
  );
};

export default CorteCajaButton;
