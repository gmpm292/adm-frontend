import { useQuery } from "@apollo/client";
import { Dialog } from "primereact/dialog";
import { ProgressSpinner } from "primereact/progressspinner";
import { Tag } from "primereact/tag";
import { InfoRow, NoData } from "../../../../components/ui";
import { getErrorMessage } from "../../../../utils/errors";
import { GET_INVENTORY_BY_ID } from "../graphql/queries";
import { GET_INVENTORY_MOVEMENTS } from "../../inventory-movement/graphql/queries";
import {
  MOVEMENT_TYPE,
  formatDateTime,
  formatMoney,
  formatQuantity,
  inventoryPlace,
  movementReference,
  personName,
  reasonLabel,
  stockStatus,
} from "../../format";

const LAST_MOVEMENTS = 10;

/** Ficha de un inventario: existencias, su valor y los últimos movimientos */
export function InventoryDetailForm({ inventoryId, onHide }) {
  const { data, loading, error } = useQuery(GET_INVENTORY_BY_ID, {
    variables: { id: inventoryId },
    fetchPolicy: "network-only",
  });
  const { data: movementData, loading: loadingMovements } = useQuery(
    GET_INVENTORY_MOVEMENTS,
    {
      variables: {
        options: {
          take: LAST_MOVEMENTS,
          filters: [
            {
              property: "inventory.id",
              operator: "EQUAL",
              value: String(inventoryId),
            },
          ],
          sorts: [{ property: "createdAt", direction: "DESC" }],
        },
      },
      fetchPolicy: "network-only",
    },
  );

  const inventory = data?.inventory;
  const product = inventory?.product;
  const unit = product?.unitOfMeasure;
  const status = inventory && stockStatus(inventory);
  const movements = movementData?.inventoryMovements?.data ?? [];
  const totalMovements = movementData?.inventoryMovements?.totalCount ?? 0;

  return (
    <Dialog
      header={
        inventory ? (
          <span className="flex align-items-center gap-2">
            {product?.name}
            <Tag severity={status.severity} value={status.label} />
          </span>
        ) : (
          "Inventario"
        )
      }
      visible
      onHide={onHide}
      className="ui-dialog--wide"
      modal
    >
      {loading && !inventory ? (
        <div className="flex justify-content-center p-5">
          <ProgressSpinner strokeWidth="4" />
        </div>
      ) : !inventory ? (
        <NoData
          message={
            error ? getErrorMessage(error) : "No se encontró el inventario"
          }
        />
      ) : (
        <>
          <ul className="ui-info-list">
            <InfoRow
              icon="pi pi-map-marker"
              label="Ubicación"
              detail={inventory.business?.name}
            >
              {inventoryPlace(inventory)}
            </InfoRow>
            <InfoRow
              icon="pi pi-box"
              label="Existencias"
              detail={
                inventory.minStock
                  ? `Mínimo ${formatQuantity(inventory.minStock, unit)}`
                  : "Sin mínimo"
              }
            >
              {formatQuantity(inventory.currentStock, unit)}
            </InfoRow>
            <InfoRow
              icon="pi pi-wallet"
              label="Valor al costo"
              detail={`A precio de venta: ${formatMoney(
                inventory.currentStock * product.basePrice,
                product.baseCurrency,
              )}`}
            >
              {formatMoney(
                inventory.currentStock * product.costPrice,
                product.costCurrency,
              )}
            </InfoRow>
            <InfoRow
              icon="pi pi-calendar"
              label="Abierto"
              detail={personName(inventory.createdBy)}
            >
              {formatDateTime(inventory.createdAt)}
            </InfoRow>
          </ul>

          <h3 className="flex align-items-center gap-2 text-base font-semibold text-900 mt-4 mb-2">
            Últimos movimientos
            {totalMovements > LAST_MOVEMENTS && (
              <span className="font-normal text-color-secondary">
                {LAST_MOVEMENTS} de {totalMovements}
              </span>
            )}
          </h3>
          {loadingMovements && !movements.length ? (
            <div className="flex justify-content-center p-3">
              <ProgressSpinner strokeWidth="4" className="w-3rem h-3rem" />
            </div>
          ) : movements.length ? (
            <ul className="ui-info-list">
              {movements.map((movement) => {
                const type = MOVEMENT_TYPE[movement.type];
                return (
                  <InfoRow
                    key={movement.id}
                    icon={type.icon}
                    label={reasonLabel(movement.reason)}
                    detail={[
                      formatDateTime(movement.createdAt),
                      personName(movement.user),
                      movementReference(movement),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  >
                    <Tag
                      severity={type.severity}
                      value={`${movement.type === "OUT" ? "−" : "+"}${formatQuantity(movement.quantity, unit)}`}
                    />
                  </InfoRow>
                );
              })}
            </ul>
          ) : (
            <NoData message="Aún no tiene movimientos" />
          )}
        </>
      )}
    </Dialog>
  );
}
