import React from "react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { EmptyState } from "../../../../components/ui";

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
      4: "Procesar Pago", // Nuevo paso
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

    console.log("Cargando venta:", rowData); // Para debug

    return (
      <div className="actions-column flex justify-content-end gap-1">
        <Button
          icon="pi pi-folder-open"
          text
          rounded
          severity="info"
          tooltip="Cargar venta"
          tooltipOptions={{ position: "top" }}
          onClick={() => onLoadSale(rowData)}
          disabled={isCurrent}
        />
        <Button
          icon="pi pi-trash"
          text
          rounded
          severity="danger"
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
            <div className="text-sm text-color-secondary">
              CI: {rowData.customerData.ci}
            </div>
          )}
        </div>
      );
    }
    return <span className="text-color-secondary">Sin cliente</span>;
  };

  const productsBodyTemplate = (rowData) => {
    return (
      <div>
        <div>{rowData.saleDetails.length} productos</div>
        <div className="text-sm text-color-secondary">
          Total: ${getTotalAmount(rowData).toFixed(2)}
        </div>
      </div>
    );
  };

  const statusBodyTemplate = (rowData) => {
    return (
      <Tag
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
      case 4:
        return "info"; // Paso de pago
      default:
        return undefined;
    }
  };

  if (pendingSales.length === 0) {
    return (
      <EmptyState icon="pi pi-inbox" title="No hay ventas pendientes">
        <p className="m-0">
          Las ventas que guardes como pendientes aparecerán aquí
        </p>
      </EmptyState>
    );
  }

  return (
    <DataTable
      value={pendingSales}
      paginator
      rows={10}
      emptyMessage="No hay ventas pendientes"
      size="small"
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
        className="w-8rem"
      />
    </DataTable>
  );
};
