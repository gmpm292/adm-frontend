import React, { useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { useLazyQuery } from "@apollo/client";
import { GET_INVENTORY_BY_ID } from "../graphql/queries";
import { ProgressSpinner } from "primereact/progressspinner";
import { formatDate } from "../../../../utils/dateUtils";
import { formatCurrency } from "../../../../utils/numberUtils";
import { Tag } from "primereact/tag";
import { Panel } from "primereact/panel";
import { Divider } from "primereact/divider";
import { ScrollPanel } from "primereact/scrollpanel";
import { DetailField } from "../../components/DetailField";

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
      <div className="grid">
        <DetailField label="Empresa" className="col-6 md:col-3">
          {inventory.business?.name || "N/A"}
        </DetailField>
        <DetailField label="Oficina" className="col-6 md:col-3">
          {inventory.office?.name || "N/A"}
        </DetailField>
        <DetailField label="Departamento" className="col-6 md:col-3">
          {inventory.department?.name || "N/A"}
        </DetailField>
        <DetailField label="Equipo" className="col-6 md:col-3">
          {inventory.team?.name || "N/A"}
        </DetailField>
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
      <div className="grid">
        <DetailField label="Producto">
          {inventory.product?.name || "N/A"}
        </DetailField>
        <DetailField label="Unidad de Medida">
          {inventory.product?.unitOfMeasure || "N/A"}
        </DetailField>
        <DetailField label="Stock Actual">
          <Tag value={inventory.currentStock} severity={stockStatus} />
        </DetailField>
        <DetailField label="Stock Mínimo">
          {inventory.minStock || "N/A"}
        </DetailField>
        <DetailField label="Ubicación">
          {inventory.location || "N/A"}
        </DetailField>
        <DetailField label="Categoría">
          {inventory.product?.category?.name || "N/A"}
        </DetailField>
      </div>
    );
  };

  const renderProductPricing = (product) => {
    if (!product) return <p>No hay información de precios disponible</p>;

    return (
      <div className="grid">
        <DetailField label="Precio Costo">
          {formatCurrency(product.costPrice, product.costCurrency)}
        </DetailField>
        <DetailField label="Precio Venta">
          {formatCurrency(product.basePrice, product.baseCurrency)}
        </DetailField>
        <DetailField label="Valor Total en Inventario" className="col-12">
          {formatCurrency(
            inventory.currentStock * product.costPrice,
            product.costCurrency
          )}
        </DetailField>
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
      <div className="grid align-items-center border-bottom-1 surface-border pb-2 mb-2">
        <div className="col-12 md:col-2">
          <Tag
            value={movement.type}
            severity={movementTypeSeverity[movement.type] || "info"}
          />
        </div>
        <DetailField label="Cantidad" className="col-12 md:col-2">
          {movement.quantity}
        </DetailField>
        <DetailField label="Fecha" className="col-12 md:col-3">
          {formatDate(movement.createdAt)}
        </DetailField>
        <DetailField label="Usuario" className="col-12 md:col-3">
          {movement.user?.name || "N/A"}
        </DetailField>
        <DetailField label="Razón" className="col-12 md:col-2">
          {movement.reason}
        </DetailField>
      </div>
    );
  };

  const renderMovements = (movements) => {
    if (!movements || movements.length === 0) {
      return <p>No hay movimientos registrados</p>;
    }

    return (
      <ScrollPanel className="w-full h-20rem">
        {movements.map((movement, index) => (
          <div key={index}>{renderMovementItem(movement)}</div>
        ))}
      </ScrollPanel>
    );
  };

  const renderAuditInfo = (inventory) => {
    return (
      <div className="grid">
        <DetailField label="Creado por">
          {inventory.createdBy?.name || "N/A"}
        </DetailField>
        <DetailField label="Actualizado por">
          {inventory.updatedBy?.name || "N/A"}
        </DetailField>
        <DetailField label="Fecha creación">
          {formatDate(inventory.createdAt)}
        </DetailField>
        <DetailField label="Última actualización">
          {formatDate(inventory.updatedAt)}
        </DetailField>
        {inventory.deletedAt && (
          <>
            <DetailField label="Eliminado por">
              {inventory.deletedBy?.name || "N/A"}
            </DetailField>
            <DetailField label="Fecha eliminación">
              {formatDate(inventory.deletedAt)}
            </DetailField>
          </>
        )}
      </div>
    );
  };

  return (
    <Dialog
      header={`Detalles del Inventario: ${inventory?.product?.name || ""}`}
      visible={visible}
      className="w-full lg:w-8"
      onHide={onHide}
      modal
      resizable
      draggable
    >
      {loading ? (
        <div className="flex justify-content-center">
          <ProgressSpinner />
        </div>
      ) : inventory ? (
        <div>
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
