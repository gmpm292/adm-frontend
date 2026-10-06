import { SaleTable } from "../../sale/components/SaleTable";

/** Mensajerías: las ventas que llevan entrega, con su mensajero */
export function DeliveryTable() {
  return <SaleTable deliveryOnly />;
}

export default DeliveryTable;
