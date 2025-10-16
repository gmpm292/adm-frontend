import { useState, useCallback } from "react";
import { printService } from "../services/printService";
import { toast } from "primereact/toast";

export const usePrint = () => {
  const [printing, setPrinting] = useState(false);
  const [printerStatus, setPrinterStatus] = useState(null);

  const checkPrinterStatus = useCallback(async () => {
    try {
      const status = await printService.getPrinterStatus();
      setPrinterStatus(status);
      return status;
    } catch (error) {
      const errorStatus = {
        connected: false,
        error: error.message,
        online: false,
      };
      setPrinterStatus(errorStatus);
      return errorStatus;
    }
  }, []);

  const print = useCallback(
    async (ticketData, successMessage = "Ticket impreso correctamente") => {
      setPrinting(true);

      try {
        // Verificar estado de la impresora primero
        const status = await checkPrinterStatus();

        if (!status.connected) {
          throw new Error(`Impresora no disponible: ${status.error}`);
        }

        // Realizar impresión
        const result = await printService.printTicket(ticketData);

        if (successMessage) {
          toast.current.show({
            severity: "success",
            summary: "Impresión Exitosa",
            detail: successMessage,
            life: 3000,
          });
        }

        return result;
      } catch (error) {
        console.error("Error en hook usePrint:", error);

        toast.current.show({
          severity: "error",
          summary: "Error de Impresión",
          detail: error.message || "No se pudo imprimir el ticket",
          life: 5000,
        });

        throw error;
      } finally {
        setPrinting(false);
      }
    },
    [checkPrinterStatus]
  );

  // Métodos específicos
  const printSale = useCallback(
    (ventaData, template = "default") => {
      return print(
        {
          type: "VENTA",
          data: ventaData,
          template,
        },
        "Ticket de venta impreso"
      );
    },
    [print]
  );

  const printCashCut = useCallback(
    (corteData, template = "default") => {
      return print(
        {
          type: "CORTE_CAJA",
          data: corteData,
          template,
        },
        "Corte de caja impreso"
      );
    },
    [print]
  );

  const printReturn = useCallback(
    (devolucionData, template = "default") => {
      return print(
        {
          type: "DEVOLUCION",
          data: devolucionData,
          template,
        },
        "Ticket de devolución impreso"
      );
    },
    [print]
  );

  const printPreSale = useCallback(
    (preVentaData, template = "default") => {
      return print(
        {
          type: "PREVENTA",
          data: preVentaData,
          template,
        },
        "Ticket de pre-venta impreso"
      );
    },
    [print]
  );

  return {
    printing,
    printerStatus,
    checkPrinterStatus,
    print,
    printSale,
    printCashCut,
    printReturn,
    printPreSale,
  };
};
