import React from "react";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

export const SaleSummary = ({ saleDetails, totalAmount, customer }) => {
  const priceBodyTemplate = (rowData) => {
    const unitPrice = rowData.unitPrice || 0;
    return `$${unitPrice.toFixed(2)} ${rowData.baseCurrency || ""}`;
  };

  const subtotalBodyTemplate = (rowData) => {
    const subtotal = rowData.subtotal || 0;
    return `$${subtotal.toFixed(2)} ${rowData.baseCurrency || ""}`;
  };

  return (
    <div className="sale-summary">
      <Card title="Resumen de Venta">
        {customer && (
          <div className="customer-info mb-4">
            <h4>Cliente</h4>
            <p>
              <strong>Nombre:</strong> {customer.fullName}
            </p>
            {customer.ci && (
              <p>
                <strong>CI:</strong> {customer.ci}
              </p>
            )}
            {customer.email && (
              <p>
                <strong>Email:</strong> {customer.email}
              </p>
            )}
            {customer.phone && (
              <p>
                <strong>Teléfono:</strong> {customer.phone}
              </p>
            )}
          </div>
        )}

        {saleDetails.length > 0 ? (
          <>
            <DataTable value={saleDetails} className="p-datatable-sm">
              <Column field="productName" header="Producto"></Column>
              <Column field="quantity" header="Cantidad"></Column>
              <Column
                field="unitPrice"
                header="Precio Unitario"
                body={priceBodyTemplate}
              ></Column>
              <Column
                field="subtotal"
                header="Subtotal"
                body={subtotalBodyTemplate}
              ></Column>
            </DataTable>

            <div
              className="total-section mt-3 p-3 border-round"
              style={{ backgroundColor: "#f8f9fa" }}
            >
              <div className="flex justify-content-between align-items-center">
                <h4 className="m-0">Total:</h4>
                <h4 className="m-0 text-primary">
                  ${totalAmount.toFixed(2)} {saleDetails[0]?.baseCurrency || ""}
                </h4>
              </div>
            </div>
          </>
        ) : (
          <p>No hay productos agregados</p>
        )}
      </Card>
    </div>
  );
};
