import React, { useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { useLazyQuery } from "@apollo/client";
import { GET_INVENTORY_BY_ID } from "../graphql/queries";
import { ProgressSpinner } from "primereact/progressspinner";
import { formatDate } from "../../../../utils/dateUtils";
import { formatCurrency } from "../../../../utils/numberUtils";
import { Tag } from "primereact/tag";
import { Panel } from "primereact/panel";
import { DataView } from "primereact/dataview";
import { Badge } from "primereact/badge";
import { Divider } from "primereact/divider";
import { ScrollPanel } from "primereact/scrollpanel";

export function InventoryDetailForm({ inventoryId, visible, onHide }) {
  const [getInventory, { data, loading }] = useLazyQuery(GET_INVENTORY_BY_ID, {
    variables: { id: inventoryId },
    fetchPolicy: "network-only",
    skip: !inventoryId,
  });

  useEffect(() => {
    if (visible && inventoryId) {
      getInventory();
    }
  }, [visible, inventoryId, getInventory]);

  const inventory = data?.inventory;

  const renderSecurityEntities = (inventory) => {
    return (
      <div className="p-grid">
        <div className="p-col-6 p-md-3">
          <div className="field">
            <b>Empresa:</b> {inventory.business?.name || "N/A"}
          </div>
        </div>
        <div className="p-col-6 p-md-3">
          <div className="field">
            <b>Oficina:</b> {inventory.office?.name || "N/A"}
          </div>
        </div>
        <div className="p-col-6 p-md-3">
          <div className="field">
            <b>Departamento:</b> {inventory.department?.name || "N/A"}
          </div>
        </div>
        <div className="p-col-6 p-md-3">
          <div className="field">
            <b>Equipo:</b> {inventory.team?.name || "N/A"}
          </div>
        </div>
      </div>
    );
  };

  const renderBasicInfo = (inventory) => {
    const stockStatus =
      inventory.currentStock <= (inventory.minStock || 0)
        ? "danger"
        : inventory.currentStock <= (inventory.minStock || 0) * 1.5
        ? "warning"
        : "success";

    return (
      <div className="p-grid">
        <div className="p-col-12 p-md-6">
          <div className="field">
            <b>Producto:</b> {inventory.product?.name || "N/A"}
          </div>
        </div>
        <div className="p-col-12 p-md-6">
          <div className="field">
            <b>Unidad de Medida:</b> {inventory.product?.unitOfMeasure || "N/A"}
          </div>
        </div>
        <div className="p-col-12 p-md-6">
          <div className="field">
            <b>Stock Actual:</b>
            <Tag
              value={inventory.currentStock}
              severity={stockStatus}
              className="ml-2"
            />
          </div>
        </div>
        <div className="p-col-12 p-md-6">
          <div className="field">
            <b>Stock Mínimo:</b> {inventory.minStock || "N/A"}
          </div>
        </div>
        <div className="p-col-12 p-md-6">
          <div className="field">
            <b>Ubicación:</b> {inventory.location || "N/A"}
          </div>
        </div>
        <div className="p-col-12 p-md-6">
          <div className="field">
            <b>Categoría:</b> {inventory.product?.category?.name || "N/A"}
          </div>
        </div>
      </div>
    );
  };

  const renderProductPricing = (product) => {
    if (!product) return <p>No hay información de precios disponible</p>;

    return (
      <div className="p-grid">
        <div className="p-col-12 p-md-6">
          <div className="field">
            <b>Precio Costo:</b>{" "}
            {formatCurrency(product.costPrice, product.costCurrency)}
          </div>
        </div>
        <div className="p-col-12 p-md-6">
          <div className="field">
            <b>Precio Venta:</b>{" "}
            {formatCurrency(product.basePrice, product.baseCurrency)}
          </div>
        </div>
        <div className="p-col-12">
          <div className="field">
            <b>Valor Total en Inventario:</b>
            {formatCurrency(
              inventory.currentStock * product.costPrice,
              product.costCurrency
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderMovementItem = (movement) => {
    const movementTypeSeverity = {
      IN: "success",
      OUT: "danger",
      ADJUSTMENT: "info",
    };

    return (
      <div className="p-grid p-fluid p-ai-center border-bottom-1 surface-border pb-2 mb-2">
        <div className="p-col-12 p-md-2">
          <Tag
            value={movement.type}
            severity={movementTypeSeverity[movement.type] || "info"}
          />
        </div>
        <div className="p-col-12 p-md-2">
          <b>Cantidad:</b> {movement.quantity}
        </div>
        <div className="p-col-12 p-md-3">
          <b>Fecha:</b> {formatDate(movement.createdAt)}
        </div>
        <div className="p-col-12 p-md-3">
          <b>Usuario:</b> {movement.user?.name || "N/A"}
        </div>
        <div className="p-col-12 p-md-2">
          <b>Razón:</b> {movement.reason}
        </div>
      </div>
    );
  };

  const renderMovements = (movements) => {
    if (!movements || movements.length === 0) {
      return <p>No hay movimientos registrados</p>;
    }

    return (
      <ScrollPanel style={{ width: "100%", height: "300px" }}>
        {movements.map((movement, index) => (
          <div key={index}>{renderMovementItem(movement)}</div>
        ))}
      </ScrollPanel>
    );
  };

  const renderAuditInfo = (inventory) => {
    return (
      <div className="p-grid">
        <div className="p-col-12 p-md-6">
          <div className="field">
            <b>Creado por:</b> {inventory.createdBy?.name || "N/A"}
          </div>
          <div className="field">
            <b>Fecha creación:</b> {formatDate(inventory.createdAt)}
          </div>
        </div>
        <div className="p-col-12 p-md-6">
          <div className="field">
            <b>Actualizado por:</b> {inventory.updatedBy?.name || "N/A"}
          </div>
          <div className="field">
            <b>Última actualización:</b> {formatDate(inventory.updatedAt)}
          </div>
        </div>
        {inventory.deletedAt && (
          <div className="p-col-12 p-md-6">
            <div className="field">
              <b>Eliminado por:</b> {inventory.deletedBy?.name || "N/A"}
            </div>
            <div className="field">
              <b>Fecha eliminación:</b> {formatDate(inventory.deletedAt)}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog
      header={`Detalles del Inventario: ${inventory?.product?.name || ""}`}
      visible={visible}
      style={{ width: "70vw" }}
      onHide={onHide}
      modal
      resizable
      draggable
    >
      {loading ? (
        <div className="flex justify-center">
          <ProgressSpinner />
        </div>
      ) : inventory ? (
        <div className="p-fluid">
          <Panel header="Entidades de Seguridad" toggleable>
            {renderSecurityEntities(inventory)}
          </Panel>

          <Panel header="Información Básica" toggleable className="mt-3">
            {renderBasicInfo(inventory)}
          </Panel>

          <Panel header="Información de Precios" toggleable className="mt-3">
            {renderProductPricing(inventory.product)}
          </Panel>

          <Panel header="Movimientos de Inventario" toggleable className="mt-3">
            <Divider align="left">
              <b>Historial de Movimientos</b>
            </Divider>
            {renderMovements(inventory.inventoryMovements)}
          </Panel>

          <Panel header="Información de Auditoría" toggleable className="mt-3">
            {renderAuditInfo(inventory)}
          </Panel>
        </div>
      ) : (
        <p>No se encontró información del inventario.</p>
      )}
    </Dialog>
  );
}
