import React, { useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { useLazyQuery } from "@apollo/client";
import { GET_INVENTORY_MOVEMENT_BY_ID } from "../graphql/queries";
import { ProgressSpinner } from "primereact/progressspinner";
import { formatDate } from "../../../../utils/dateUtils";
import { Tag } from "primereact/tag";

export function InventoryMovementDetailForm({ movementId, visible, onHide }) {
  const [getMovement, { data, loading }] = useLazyQuery(GET_INVENTORY_MOVEMENT_BY_ID, {
    variables: { id: movementId },
    fetchPolicy: "network-only",
    skip: !movementId,
  });

  useEffect(() => {
    if (visible && movementId) {
      getMovement();
    }
  }, [visible, movementId, getMovement]);

  const movement = data?.inventoryMovement;

  return (
    <Dialog
      header="Detalles del Movimiento"
      visible={visible}
      style={{ width: "600px" }}
      onHide={onHide}
      modal
    >
      {loading ? (
        <div className="flex justify-center">
          <ProgressSpinner />
        </div>
      ) : movement ? (
        <div className="p-fluid">
          <div className="field"><b>Producto:</b> {movement.inventory?.product?.name || 'N/A'}</div>
          <div className="field">
            <b>Tipo:</b> 
            <Tag 
              value={movement.type === 'IN' ? 'ENTRADA' : 'SALIDA'} 
              severity={movement.type === 'IN' ? 'success' : 'danger'} 
              className="ml-2"
            />
          </div>
          <div className="field"><b>Cantidad:</b> {movement.quantity}</div>
          <div className="field"><b>Motivo:</b> {movement.reason || 'N/A'}</div>
          <div className="field"><b>Fecha:</b> {formatDate(movement.timestamp)}</div>
          <div className="field"><b>Usuario:</b> {movement.user?.name || 'N/A'}</div>
        </div>
      ) : (
        <p>No se encontró información del movimiento.</p>
      )}
    </Dialog>
  );
}