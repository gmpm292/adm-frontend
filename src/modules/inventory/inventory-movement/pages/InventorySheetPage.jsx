import { PageHeader } from "../../../../components/ui";
import { InventorySheet } from "../components/InventorySheet";

export function InventorySheetPage() {
  return (
    <>
      <PageHeader
        title="Cargar o enviar"
        subtitle="Escribe las cantidades de todos los productos que quieras y guárdalas de una vez: como entrada en tu oficina o como envío a otra oficina de la empresa."
      />
      <InventorySheet />
    </>
  );
}
