import React, { useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { useLazyQuery } from "@apollo/client";
import { GET_INVENTORY_MOVEMENT_BY_ID } from "../graphql/queries";
import { ProgressSpinner } from "primereact/progressspinner";
import { formatDate } from "../../../../utils/dateUtils";
import { Tag } from "primereact/tag";
import { DetailField } from "../../components/DetailField";

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
      className="w-full md:w-8 lg:w-6"
      onHide={onHide}
      modal
    >
      {loading ? (
        <div className="flex justify-content-center">
          <ProgressSpinner />
        </div>
      ) : movement ? (
        <div className="grid">
          <DetailField label="Producto">
            {movement.inventory?.product?.name || 'N/A'}
          </DetailField>
          <DetailField label="Tipo">
            <Tag
              value={movement.type === 'IN' ? 'ENTRADA' : 'SALIDA'}
              severity={movement.type === 'IN' ? 'success' : 'danger'}
            />
          </DetailField>
          <DetailField label="Cantidad">{movement.quantity}</DetailField>
          <DetailField label="Motivo">{movement.reason || 'N/A'}</DetailField>
          <DetailField label="Fecha">{formatDate(movement.timestamp)}</DetailField>
          <DetailField label="Usuario">{movement.user?.name || 'N/A'}</DetailField>
        </div>
      ) : (
        <p>No se encontró información del movimiento.</p>
      )}
    </Dialog>
  );
}
