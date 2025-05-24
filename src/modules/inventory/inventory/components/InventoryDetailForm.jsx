import React, { useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { useLazyQuery } from "@apollo/client";
import { GET_INVENTORY_BY_ID } from "../graphql/queries";
import { ProgressSpinner } from "primereact/progressspinner";
import { formatDate } from "../../../../utils/dateUtils";

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

  return (
    <Dialog
      header="Detalles del Inventario"
      visible={visible}
      style={{ width: "600px" }}
      onHide={onHide}
      modal
    >
      {loading ? (
        <div className="flex justify-center">
          <ProgressSpinner />
        </div>
      ) : inventory ? (
        <div className="p-fluid">
          <div className="field"><b>Producto:</b> {inventory.product?.name || 'N/A'}</div>
          <div className="field"><b>Stock Actual:</b> {inventory.currentStock}</div>
          <div className="field"><b>Stock Mínimo:</b> {inventory.minStock || 'N/A'}</div>
          <div className="field"><b>Ubicación:</b> {inventory.location || 'N/A'}</div>
          <div className="field"><b>Fecha de creación:</b> {formatDate(inventory.createdAt)}</div>
          <div className="field"><b>Última actualización:</b> {formatDate(inventory.updatedAt)}</div>
        </div>
      ) : (
        <p>No se encontró información del inventario.</p>
      )}
    </Dialog>
  );
}