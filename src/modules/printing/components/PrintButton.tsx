// printing/components/PrintButton.tsx
import React from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { usePrinting } from "../hooks/usePrinting";
import { PrintData } from "../services/printing.service";

interface PrintButtonProps {
  printData: PrintData;
  label?: string;
  icon?: string;
  className?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const PrintButton: React.FC<PrintButtonProps> = ({
  printData,
  label = "Imprimir",
  icon = "pi pi-print",
  className = "",
  onSuccess,
  onError,
}) => {
  const { isPrinting, error, print, clearError } = usePrinting();
  const toast = React.useRef<Toast>(null);

  React.useEffect(() => {
    if (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error de Impresión",
        detail: error,
        life: 2000,
      });
      onError?.(error);
      clearError();
    }
  }, [error, onError, clearError]);

  const handlePrint = async () => {
    const success = await print(printData);
    if (success) {
      toast.current?.show({
        severity: "success",
        summary: "Éxito",
        detail: "Documento enviado a impresión",
        life: 2000,
      });
      onSuccess?.();
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Button
        label={label}
        icon={icon}
        loading={isPrinting}
        onClick={handlePrint}
        className={className}
        disabled={isPrinting}
      />
    </>
  );
};
