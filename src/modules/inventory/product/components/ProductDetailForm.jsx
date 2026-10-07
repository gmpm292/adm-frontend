import { useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { ProgressSpinner } from "primereact/progressspinner";
import { Tag } from "primereact/tag";
import { InfoRow, NoData } from "../../../../components/ui";
import { getErrorMessage } from "../../../../utils/errors";
import { GET_PRODUCT_BY_ID } from "../graphql/queries";
import {
  formatDateTime,
  formatMoney,
  formatQuantity,
  inventoryPlace,
  personName,
  stockStatus,
} from "../../format";

/** Ficha de un producto: precios, reglas de venta y dónde hay existencias */
export function ProductDetailForm({ productId, onHide, onEdit }) {
  const { data, loading, error } = useQuery(GET_PRODUCT_BY_ID, {
    variables: { id: productId },
    fetchPolicy: "network-only",
  });
  const product = data?.product;

  const inventories = product?.inventories ?? [];
  const stock = inventories.reduce((sum, i) => sum + i.currentStock, 0);
  const margin =
    product &&
    product.costCurrency === product.baseCurrency &&
    product.basePrice > 0
      ? ((product.basePrice - product.costPrice) / product.basePrice) * 100
      : null;
  const pricing = product?.pricingConfig;
  const otherCurrencies = (pricing?.acceptedCurrencies ?? []).filter(
    (code) => code !== product?.baseCurrency,
  );
  const rules = product?.saleRules;
  const attributes = Object.entries(product?.attributes ?? {});

  return (
    <Dialog
      header={product?.name ?? "Producto"}
      visible
      onHide={onHide}
      className="ui-dialog--wide"
      modal
      footer={
        product && onEdit ? (
          <>
            <Button label="Cerrar" severity="secondary" onClick={onHide} />
            <Button label="Editar" icon="pi pi-pencil" onClick={onEdit} />
          </>
        ) : undefined
      }
    >
      {loading && !product ? (
        <div className="flex justify-content-center p-5">
          <ProgressSpinner strokeWidth="4" />
        </div>
      ) : !product ? (
        <NoData
          message={error ? getErrorMessage(error) : "No se encontró el producto"}
        />
      ) : (
        <>
          <ul className="ui-info-list">
            <InfoRow
              icon="pi pi-tag"
              label="Categoría"
              detail={
                product.unitOfMeasure
                  ? `Se cuenta en ${product.unitOfMeasure.name.toLowerCase()} (${product.unitOfMeasure.symbol})`
                  : undefined
              }
            >
              {product.category?.name ?? "—"}
            </InfoRow>
            <InfoRow
              icon="pi pi-dollar"
              label="Precio de venta"
              detail={[
                `Costo ${formatMoney(product.costPrice, product.costCurrency)}`,
                margin !== null &&
                  `margen ${new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 }).format(margin)} %`,
              ]
                .filter(Boolean)
                .join(" · ")}
            >
              {formatMoney(product.basePrice, product.baseCurrency)}
            </InfoRow>
            {otherCurrencies.map((code) => {
              const fixed = pricing.fixedPrices?.find(
                (p) => p.currency === code,
              );
              return (
                <InfoRow
                  key={code}
                  icon="pi pi-money-bill"
                  label={`Cobro en ${code}`}
                  detail={
                    fixed
                      ? "Precio fijo"
                      : pricing.exchangeRateMargin
                        ? `Por tasa de cambio, con ${pricing.exchangeRateMargin} % de recargo`
                        : "Por tasa de cambio"
                  }
                >
                  {fixed ? formatMoney(fixed.amount, code) : "Variable"}
                </InfoRow>
              );
            })}
            {(rules?.minQuantity || rules?.maxQuantity) && (
              <InfoRow icon="pi pi-sort-numeric-up" label="Cantidad por venta">
                {[
                  rules.minQuantity && `mínimo ${rules.minQuantity}`,
                  rules.maxQuantity && `máximo ${rules.maxQuantity}`,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </InfoRow>
            )}
            {(rules?.bulkDiscounts ?? []).map((discount, index) => (
              <InfoRow
                key={index}
                icon="pi pi-percentage"
                label={`Desde ${discount.minQty} unidades`}
                detail={`En ${discount.applicableCurrencies.join(", ")}`}
              >
                −{discount.discount} %
              </InfoRow>
            ))}
            <InfoRow icon="pi pi-shield" label="Garantía">
              {product.warranty || "Sin garantía"}
            </InfoRow>
            {product.materialCost && (
              <InfoRow
                icon="pi pi-box"
                label="Material"
                detail={`${formatMoney(product.materialCost.costPrice, product.materialCost.currency?.code)} por ${product.materialCost.unitOfMeasure?.symbol ?? "unidad"}`}
              >
                {product.materialCost.name}
              </InfoRow>
            )}
            {attributes.map(([key, value]) => (
              <InfoRow key={key} icon="pi pi-list" label={key}>
                {String(value)}
              </InfoRow>
            ))}
          </ul>

          <h3 className="flex align-items-center gap-2 text-base font-semibold text-900 mt-4 mb-2">
            Existencias
            <span className="font-normal text-color-secondary">
              {formatQuantity(stock, product.unitOfMeasure)} en total
            </span>
          </h3>
          {inventories.length ? (
            <ul className="ui-info-list">
              {inventories.map((inventory) => {
                const status = stockStatus(inventory);
                return (
                  <InfoRow
                    key={inventory.id}
                    icon="pi pi-database"
                    label={inventoryPlace(inventory)}
                    detail={
                      inventory.minStock
                        ? `Mínimo ${formatQuantity(inventory.minStock, product.unitOfMeasure)}`
                        : undefined
                    }
                  >
                    <span className="flex align-items-center gap-2">
                      {formatQuantity(
                        inventory.currentStock,
                        product.unitOfMeasure,
                      )}
                      {status.severity !== "success" && (
                        <Tag severity={status.severity} value={status.label} />
                      )}
                    </span>
                  </InfoRow>
                );
              })}
            </ul>
          ) : (
            <NoData message="Aún no tiene inventario: ábrelo desde la pantalla Inventarios" />
          )}

          <p className="text-sm text-color-secondary mt-4 mb-0">
            Creado el {formatDateTime(product.createdAt)}
            {personName(product.createdBy) &&
              ` por ${personName(product.createdBy)}`}
            {product.updatedAt !== product.createdAt &&
              ` · Modificado el ${formatDateTime(product.updatedAt)}`}
            {personName(product.updatedBy) &&
              product.updatedAt !== product.createdAt &&
              ` por ${personName(product.updatedBy)}`}
          </p>
        </>
      )}
    </Dialog>
  );
}
