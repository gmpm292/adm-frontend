import React from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Badge } from "primereact/badge";

export const PendingSalesManager = ({
  pendingSales,
  onLoadSale,
  onDeleteSale,
  currentSaleId,
}) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStepName = (step) => {
    const steps = {
      1: "Datos Cliente",
      2: "Agregar Productos",
      3: "Asignar Personal",
    };
    return steps[step] || "Paso " + step;
  };

  const getTotalAmount = (sale) => {
    return sale.saleDetails.reduce(
      (sum, detail) => sum + detail.quantity * detail.unitPrice,
      0
    );
  };

  const actionBodyTemplate = (rowData) => {
    const isCurrent = rowData.id === currentSaleId;

    return (
      <div className="actions-column">
        <Button
          icon="pi pi-folder-open"
          className="p-button-rounded p-button-text p-button-info"
          tooltip="Cargar venta"
          tooltipOptions={{ position: "top" }}
          onClick={() => onLoadSale(rowData)}
          disabled={isCurrent}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-text p-button-danger"
          tooltip="Eliminar venta"
          tooltipOptions={{ position: "top" }}
          onClick={() => onDeleteSale(rowData.id)}
        />
      </div>
    );
  };

  const customerBodyTemplate = (rowData) => {
    if (rowData.customerData) {
      return (
        <div>
          <div>
            <strong>{rowData.customerData.fullName}</strong>
          </div>
          {rowData.customerData.ci && (
            <div className="text-sm text-gray-600">
              CI: {rowData.customerData.ci}
            </div>
          )}
        </div>
      );
    }
    return <span className="text-gray-400">Sin cliente</span>;
  };

  const productsBodyTemplate = (rowData) => {
    return (
      <div>
        <div>{rowData.saleDetails.length} productos</div>
        <div className="text-sm text-gray-600">
          Total: ${getTotalAmount(rowData).toFixed(2)}
        </div>
      </div>
    );
  };

  const statusBodyTemplate = (rowData) => {
    return (
      <Badge
        value={getStepName(rowData.currentStep)}
        severity={getStatusSeverity(rowData.currentStep)}
      />
    );
  };

  const getStatusSeverity = (step) => {
    switch (step) {
      case 1:
        return "warning";
      case 2:
        return "info";
      case 3:
        return "success";
      default:
        return "secondary";
    }
  };

  if (pendingSales.length === 0) {
    return (
      <div className="no-pending-sales">
        <div className="empty-state">
          <i className="pi pi-inbox empty-icon"></i>
          <h3>No hay ventas pendientes</h3>
          <p>Las ventas que guardes como pendientes aparecerán aquí</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pending-sales-manager">
      <Card title={`Ventas Pendientes (${pendingSales.length})`}>
        <DataTable
          value={pendingSales}
          paginator
          rows={10}
          emptyMessage="No hay ventas pendientes"
          className="p-datatable-sm"
        >
          <Column
            field="createdAt"
            header="Creada"
            body={(rowData) => formatDate(rowData.createdAt)}
          />
          <Column header="Cliente" body={customerBodyTemplate} />
          <Column header="Productos" body={productsBodyTemplate} />
          <Column header="Estado" body={statusBodyTemplate} />
          <Column
            header="Acciones"
            body={actionBodyTemplate}
            style={{ width: "120px" }}
          />
        </DataTable>
      </Card>
    </div>
  );
};
