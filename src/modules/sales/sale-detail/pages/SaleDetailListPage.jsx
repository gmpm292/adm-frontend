import React from "react";
import { useParams } from "react-router-dom";
import { SaleDetailTable } from "../components/SaleDetailTable";
import { SaleDetailGeneralTable } from "../components/SaleDetailGeneralTable";
import { PageHeader } from "../../../../components/ui";
import { useHasRole } from "../../../../hooks/useHasRole";

export function SaleDetailListPage() {
  const { saleId } = useParams();
  const hasRole = useHasRole();
  // Un vendedor sin mando solo ve sus ventas (lo filtra el backend)
  const sellerOnly = !hasRole("SUPER", "PRINCIPAL", "ADMIN", "MANAGER", "SUPERVISOR");

  // Vista general cuando no hay saleId (accedido desde el menú)
  if (!saleId) {
    return (
      <>
        <PageHeader
          title="Detalles de ventas"
          subtitle={
            sellerOnly
              ? "Consulta los productos vendidos en tus ventas."
              : "Consulta los productos vendidos en todas las ventas."
          }
        />
        <SaleDetailGeneralTable />
      </>
    );
  }

  // Vista específica de una venta
  return (
    <>
      <PageHeader
        title={`Detalles de venta #${saleId}`}
        subtitle="Productos incluidos en esta venta."
      />
      <SaleDetailTable saleId={parseInt(saleId)} />
    </>
  );
}
