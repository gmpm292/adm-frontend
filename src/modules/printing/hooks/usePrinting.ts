import { useState, useCallback } from "react";
import { useApolloClient } from "@apollo/client";
import { PrintingService } from "../services/printing.service";

/** Impresión térmica con QZ Tray; `isPrinting` mientras se envía */
export const usePrinting = () => {
  const [isPrinting, setIsPrinting] = useState(false);
  const apolloClient = useApolloClient();

  const run = useCallback(
    async (send: (service: PrintingService) => Promise<boolean>) => {
      setIsPrinting(true);
      try {
        return await send(PrintingService.getInstance(apolloClient));
      } finally {
        setIsPrinting(false);
      }
    },
    [apolloClient],
  );

  const printTicket = useCallback(
    (ventaData: Parameters<PrintingService["printTicket"]>[0]) =>
      run((service) => service.printTicket(ventaData)),
    [run],
  );

  const printMovement = useCallback(
    (movementData: Parameters<PrintingService["printMovement"]>[0]) =>
      run((service) => service.printMovement(movementData)),
    [run],
  );

  /** Hoja corta para comprobar que QZ Tray y la impresora responden */
  const printTest = useCallback(
    () =>
      run((service) =>
        service.print({
          type: "TEST",
          content: [
            "********************************",
            "      PRUEBA DE IMPRESIÓN",
            "********************************",
            new Date().toLocaleString("es-ES"),
            "Si lees esto, la impresión",
            "funciona correctamente.",
          ].map((line) => `${line}\n`),
          config: { cutAfterPrint: true },
        }),
      ),
    [run],
  );

  return { isPrinting, printTicket, printMovement, printTest };
};
