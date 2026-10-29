import { useApolloClient } from "@apollo/client";
import { usePrinting } from "../../printing/printing.module";
import { saleTicket } from "../format";
import { GET_SALE_BY_ID } from "./graphql/queries";

export const PRINT_ERROR =
  "No se pudo imprimir. Comprueba que QZ Tray está abierto y la impresora configurada.";

/**
 * Imprime el vale de una venta. Acepta la venta completa (la ficha) o solo
 * su `id` (la fila del listado): en ese caso la carga antes de imprimir.
 * Devuelve `true` si se imprimió.
 */
export function useSaleReceipt() {
  const client = useApolloClient();
  const { printTicket, isPrinting } = usePrinting();

  const printSale = async (saleOrId) => {
    let sale = typeof saleOrId === "object" ? saleOrId : null;
    if (!sale?.details) {
      const { data } = await client.query({
        query: GET_SALE_BY_ID,
        variables: { id: sale?.id ?? saleOrId },
        fetchPolicy: "network-only",
      });
      sale = data?.sale;
    }
    if (!sale) return false;
    return !!(await printTicket(
      saleTicket(sale, { storeName: sale.business?.name ?? sale.office?.name }),
    ));
  };

  return { printSale, isPrinting };
}
