import React from "react";
import { useParams } from "react-router-dom";
import { Card } from "primereact/card";
import { SaleDetailTable } from "../components/SaleDetailTable";
import "../styles/SaleDetailList.css";
import { SaleDetailGeneralTable } from "../components/SaleDetailGeneralTable";

export function SaleDetailListPage() {
  const { saleId } = useParams();

  // Vista general cuando no hay saleId (accedido desde el menú)
  if (!saleId) {
    return (
      <div className="sale-detail-list-page">
        <Card title="Todos los Detalles de Ventas">
          <SaleDetailGeneralTable />
        </Card>
      </div>
    );
  }

  // Vista específica de una venta
  return (
    <div className="sale-detail-list-page">
      <Card title={`Detalles de Venta #${saleId}`}>
        <SaleDetailTable saleId={parseInt(saleId)} />
      </Card>
    </div>
  );
}
