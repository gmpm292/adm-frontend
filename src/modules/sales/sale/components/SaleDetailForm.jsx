import React, { useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { useLazyQuery } from "@apollo/client";
import { GET_SALE_BY_ID } from "../graphql/queries";
import { ProgressSpinner } from "primereact/progressspinner";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Link } from "react-router-dom";
import { Button } from "primereact/button"; // Asegurar que Button esté importado

const DetailItem = ({ label, children }) => (
  <div className="col-12 md:col-6">
    <span className="block text-sm text-color-secondary mb-1">{label}</span>
    <span className="font-medium">{children}</span>
  </div>
);

export function SaleDetailForm({ saleId, visible, onHide }) {
  const [getSale, { data, loading }] = useLazyQuery(GET_SALE_BY_ID, {
    variables: { id: saleId },
    fetchPolicy: "network-only",
    skip: !saleId,
  });

  useEffect(() => {
    if (visible && saleId) {
      getSale();
    }
  }, [visible, saleId, getSale]);

  const sale = data?.sale;

  const formatCurrency = (value) => {
    // ✅ Agregar validación para valores nulos o undefined
    if (value === null || value === undefined) {
      return "$0.00";
    }

    // ✅ Asegurar que value sea un número
    const numericValue =
      typeof value === "number" ? value : parseFloat(value) || 0;

    return numericValue.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  };

  const detailColumns = [
    { field: "product.name", header: "Producto" },
    { field: "quantity", header: "Cantidad" },
    {
      field: "unitPrice",
      header: "Precio Unitario",
      body: (rowData) => formatCurrency(rowData.unitPrice),
    },
    {
      field: "subtotal",
      header: "Subtotal",
      body: (rowData) => formatCurrency(rowData.subtotal),
    },
  ];

  return (
    <Dialog
      header="Detalles de la Venta"
      visible={visible}
      className="w-full md:w-8 xl:w-6"
      onHide={onHide}
      modal
    >
      {loading ? (
        <div className="flex justify-content-center">
          <ProgressSpinner />
        </div>
      ) : sale ? (
        <div>
          <div className="grid">
            <DetailItem label="Fecha">
              {new Date(sale.effectiveDate).toLocaleDateString()}
            </DetailItem>
            <DetailItem label="Factura">{sale.invoiceNumber || "N/A"}</DetailItem>
            <DetailItem label="Monto Total">
              {formatCurrency(sale.totalAmount)}
            </DetailItem>
            <DetailItem label="Vendedor">
              {sale.salesUser?.name || "N/A"}
            </DetailItem>
            <DetailItem label="Método de Pago">
              {sale.paymentMethod === "CASH"
                ? "Efectivo"
                : sale.paymentMethod === "CARD"
                  ? "Tarjeta"
                  : sale.paymentMethod === "TRANSFER"
                    ? "Transferencia"
                    : "Otro"}
            </DetailItem>
            <DetailItem label="Cliente">{sale.customer?.name || "N/A"}</DetailItem>
          </div>

          <div className="mt-4">
            <div className="flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <h5 className="m-0">Detalles de Productos</h5>
              <Link to={`/sales/sales/${sale.id}/details`}>
                <Button
                  label="Administrar detalles"
                  icon="pi pi-external-link"
                  size="small"
                />
              </Link>
            </div>
            <DataTable
              value={sale.details || []} // ✅ Asegurar que siempre sea un array
              rows={5}
              paginator
              responsiveLayout="scroll"
              emptyMessage="No hay detalles de productos"
            >
              {detailColumns.map((col, i) => (
                <Column
                  key={i}
                  field={col.field}
                  header={col.header}
                  body={col.body}
                />
              ))}
            </DataTable>
          </div>
        </div>
      ) : (
        <p className="text-color-secondary">No se encontró información de la venta.</p>
      )}
    </Dialog>
  );
}
