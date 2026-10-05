import React, { useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { useLazyQuery } from "@apollo/client";
import { GET_PRODUCT_BY_ID } from "../graphql/queries";
import { ProgressSpinner } from "primereact/progressspinner";
import { formatDate } from "../../../../utils/dateUtils";
import { formatCurrency } from "../../../../utils/numberUtils";
import { Tag } from "primereact/tag";
import { Panel } from "primereact/panel";
import { DataView } from "primereact/dataview";
import { Divider } from "primereact/divider";
import { DetailField } from "../../components/DetailField";

export function ProductDetailForm({ productId, visible, onHide }) {
  const [getProduct, { data, loading }] = useLazyQuery(GET_PRODUCT_BY_ID, {
    variables: { id: productId },
    fetchPolicy: "network-only",
    skip: !productId,
  });

  useEffect(() => {
    if (visible && productId) {
      getProduct();
    }
  }, [visible, productId, getProduct]);

  const product = data?.product;

  const renderSecurityEntities = (product) => {
    return (
      <div className="grid">
        <DetailField label="Empresa" className="col-6 md:col-3">
          {product.business?.name || 'N/A'}
        </DetailField>
        <DetailField label="Oficina" className="col-6 md:col-3">
          {product.office?.name || 'N/A'}
        </DetailField>
        <DetailField label="Departamento" className="col-6 md:col-3">
          {product.department?.name || 'N/A'}
        </DetailField>
        <DetailField label="Equipo" className="col-6 md:col-3">
          {product.team?.name || 'N/A'}
        </DetailField>
      </div>
    );
  };

  const renderBasicInfo = (product) => {
    return (
      <div className="grid">
        <DetailField label="Nombre">{product.name}</DetailField>
        <DetailField label="Categoría">
          {product.category?.name || 'N/A'}
        </DetailField>
        <DetailField label="Unidad de Medida">
          {product.unitOfMeasure}
        </DetailField>
        <DetailField label="Garantía">{product.warranty || 'N/A'}</DetailField>
      </div>
    );
  };

  const renderPricingInfo = (product) => {
    const margin = ((product.basePrice - product.costPrice) / product.costPrice * 100).toFixed(2);

    return (
      <div className="grid">
        <DetailField label="Precio Costo">
          {formatCurrency(product.costPrice, product.costCurrency)}
        </DetailField>
        <DetailField label="Precio Venta">
          {formatCurrency(product.basePrice, product.baseCurrency)}
        </DetailField>
        <DetailField label="Margen">
          <Tag
            value={`${margin}%`}
            severity={margin > 0 ? "success" : "danger"}
          />
        </DetailField>
        <DetailField label="Monedas aceptadas">
          <div className="flex flex-wrap gap-1">
            {product.pricingConfig?.acceptedCurrencies?.map(currency => (
              <Tag key={currency} value={currency} />
            ))}
          </div>
        </DetailField>
        <DetailField label="Margen sobre tipo de cambio">
          {product.pricingConfig?.exchangeRateMargin || 0}%
        </DetailField>
        <DetailField label="Decimales para redondeo">
          {product.pricingConfig?.decimalPlaces || 2}
        </DetailField>
      </div>
    );
  };

  const renderFixedPrices = (fixedPrices) => {
    if (!fixedPrices || fixedPrices.length === 0) {
      return <p>No hay precios fijos definidos</p>;
    }

    return (
      <div className="grid">
        {fixedPrices.map((price, index) => (
          <DetailField label={price.currency} key={index}>
            {formatCurrency(price.amount, price.currency)}
          </DetailField>
        ))}
      </div>
    );
  };

  const renderAttributes = (attributes) => {
    if (!attributes || Object.keys(attributes).length === 0) {
      return <p>No hay atributos definidos</p>;
    }

    return (
      <div className="grid">
        {Object.entries(attributes).map(([key, value]) => (
          <DetailField label={key} key={key}>
            {value}
          </DetailField>
        ))}
      </div>
    );
  };

  const renderSaleRules = (saleRules) => {
    if (!saleRules) return <p>No hay reglas de venta definidas</p>;

    return (
      <div className="grid">
        <DetailField label="Cantidad mínima">
          {saleRules.minQuantity || 'N/A'}
        </DetailField>
        <DetailField label="Cantidad máxima">
          {saleRules.maxQuantity || 'N/A'}
        </DetailField>
        <div className="col-12">
          <Divider align="left">
            <b>Descuentos por volumen</b>
          </Divider>
          {saleRules.bulkDiscounts?.length > 0 ? (
            <DataView
              value={saleRules.bulkDiscounts}
              itemTemplate={(discount) => (
                <div className="grid w-full">
                  <DetailField label="Cantidad mínima" className="col-12 md:col-3">
                    {discount.minQty}
                  </DetailField>
                  <DetailField label="Descuento" className="col-12 md:col-3">
                    {discount.discount}%
                  </DetailField>
                  <DetailField label="Monedas aplicables">
                    <div className="flex flex-wrap gap-1">
                      {discount.applicableCurrencies.map(currency => (
                        <Tag key={currency} value={currency} />
                      ))}
                    </div>
                  </DetailField>
                </div>
              )}
            />
          ) : (
            <p>No hay descuentos por volumen definidos</p>
          )}
        </div>
      </div>
    );
  };

  const renderAuditInfo = (product) => {
    return (
      <div className="grid">
        <DetailField label="Creado por">
          {product.createdBy?.name || 'N/A'}
        </DetailField>
        <DetailField label="Actualizado por">
          {product.updatedBy?.name || 'N/A'}
        </DetailField>
        <DetailField label="Fecha creación">
          {formatDate(product.createdAt)}
        </DetailField>
        <DetailField label="Última actualización">
          {formatDate(product.updatedAt)}
        </DetailField>
        {product.deletedAt && (
          <>
            <DetailField label="Eliminado por">
              {product.deletedBy?.name || 'N/A'}
            </DetailField>
            <DetailField label="Fecha eliminación">
              {formatDate(product.deletedAt)}
            </DetailField>
          </>
        )}
      </div>
    );
  };

  return (
    <Dialog
      header={`Detalles del Producto: ${product?.name || ''}`}
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
      ) : product ? (
        <div>
          <Panel header="Entidades de Seguridad" toggleable>
            {renderSecurityEntities(product)}
          </Panel>

          <Panel header="Información Básica" toggleable className="mt-3">
            {renderBasicInfo(product)}
          </Panel>

          <Panel header="Atributos" toggleable className="mt-3">
            {renderAttributes(product.attributes)}
          </Panel>

          <Panel header="Información de Precios" toggleable className="mt-3">
            {renderPricingInfo(product)}
          </Panel>

          <Panel header="Precios Fijos" toggleable className="mt-3">
            {renderFixedPrices(product.pricingConfig?.fixedPrices)}
          </Panel>

          <Panel header="Reglas de Venta" toggleable className="mt-3">
            {renderSaleRules(product.saleRules)}
          </Panel>

          <Panel header="Información de Auditoría" toggleable className="mt-3">
            {renderAuditInfo(product)}
          </Panel>
        </div>
      ) : (
        <p>No se encontró información del producto.</p>
      )}
    </Dialog>
  );
}
