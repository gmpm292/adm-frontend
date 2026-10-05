import React from "react";
import { useParams } from "react-router-dom";
import { SaleDetailTable } from "../components/SaleDetailTable";
import { SaleDetailGeneralTable } from "../components/SaleDetailGeneralTable";
import { PageHeader } from "../../../../components/ui";

export function SaleDetailListPage() {
  const { saleId } = useParams();

  // Vista general cuando no hay saleId (accedido desde el menú)
  if (!saleId) {
    return (
      <>
        <PageHeader
          title="Detalles de ventas"
          subtitle="Consulta los productos vendidos en todas las ventas."
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
