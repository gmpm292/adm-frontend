import { useState, useCallback } from "react";
import { ApolloClient, useApolloClient } from "@apollo/client";
import { PrintingService, PrintData } from "../services/printing.service";

export const usePrinting = () => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apolloClient = useApolloClient();

  const print = useCallback(
    async (printData: PrintData): Promise<boolean> => {
      setIsPrinting(true);
      setError(null);

      try {
        const printingService = PrintingService.getInstance(apolloClient);
        const success = await printingService.print(printData);

        if (!success) {
          throw new Error("No se pudo completar la impresión");
        }

        return true;
      } catch (err: any) {
        const errorMessage = err.message || "Error desconocido al imprimir";
        setError(errorMessage);
        console.error("Error en usePrinting:", err);
        return false;
      } finally {
        setIsPrinting(false);
      }
    },
    [apolloClient]
  );

  const printTicket = useCallback(
    async (ventaData: any) => {
      const printingService = PrintingService.getInstance(apolloClient);
      return printingService.printTicket(ventaData);
    },
    [apolloClient]
  );

  const printWarranty = useCallback(
    async (garantiaData: any) => {
      const printingService = PrintingService.getInstance(apolloClient);
      return printingService.printWarranty(garantiaData);
    },
    [apolloClient]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isPrinting,
    error,
    print,
    printTicket,
    printWarranty,
    clearError,
  };
};
