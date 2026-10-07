import { useState } from "react";
import { useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { ProgressSpinner } from "primereact/progressspinner";
import { Tag } from "primereact/tag";
import { InfoRow, NoData } from "../../../../components/ui";
import { getErrorMessage } from "../../../../utils/errors";
import { SaleDetailForm } from "../../../sales/sale/components/SaleDetailForm";
import { GET_INVENTORY_MOVEMENT_BY_ID } from "../graphql/queries";
import {
  MOVEMENT_TYPE,
  formatDateTime,
  formatQuantity,
  inventoryPlace,
  isSaleMovement,
  movementReference,
  personName,
  reasonLabel,
} from "../../format";

/** Ficha de un movimiento: qué entró o salió, de dónde, por qué y quién */
export function MovementDetailForm({ movementId, onHide }) {
  const [saleId, setSaleId] = useState(null);
  const { data, loading, error } = useQuery(GET_INVENTORY_MOVEMENT_BY_ID, {
    variables: { id: movementId },
    fetchPolicy: "network-only",
  });
  const movement = data?.inventoryMovement;
  const type = movement && MOVEMENT_TYPE[movement.type];
  const product = movement?.inventory?.product;
  const reference = movement && movementReference(movement);
  const fromSale = movement && isSaleMovement(movement);

  return (
    <>
      <Dialog
        header={
          movement ? `${type.label} de ${product?.name}` : "Movimiento"
        }
        visible
        onHide={onHide}
        className="w-full md:w-30rem"
        modal
      >
        {loading && !movement ? (
          <div className="flex justify-content-center p-5">
            <ProgressSpinner strokeWidth="4" />
          </div>
        ) : !movement ? (
          <NoData
            message={
              error ? getErrorMessage(error) : "No se encontró el movimiento"
            }
          />
        ) : (
          <ul className="ui-info-list">
            <InfoRow
              icon={type.icon}
              label="Cantidad"
              detail={product?.category?.name}
            >
              <Tag
                severity={type.severity}
                value={`${movement.type === "OUT" ? "−" : "+"}${formatQuantity(movement.quantity, product?.unitOfMeasure)}`}
              />
            </InfoRow>
            <InfoRow
              icon="pi pi-map-marker"
              label="Inventario"
              detail={
                movement.inventory?.deletedAt
                  ? "Este inventario ya se eliminó"
                  : undefined
              }
            >
              {inventoryPlace({
                ...movement.inventory,
                office: movement.office,
              })}
            </InfoRow>
            <InfoRow icon="pi pi-info-circle" label="Motivo" detail={reference}>
              {reasonLabel(movement.reason)}
            </InfoRow>
            <InfoRow
              icon="pi pi-calendar"
              label="Registrado"
              detail={personName(movement.user)}
            >
              {formatDateTime(movement.createdAt)}
            </InfoRow>
          </ul>
        )}
        {fromSale && movement.referenceId && (
          <div className="flex justify-content-end mt-3">
            <Button
              label="Ver la venta"
              icon="pi pi-shopping-cart"
              severity="secondary"
              onClick={() => setSaleId(Number(movement.referenceId))}
            />
          </div>
        )}
      </Dialog>
      {saleId && (
        <SaleDetailForm saleId={saleId} onHide={() => setSaleId(null)} />
      )}
    </>
  );
}
