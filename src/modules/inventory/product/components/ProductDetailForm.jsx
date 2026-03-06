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
import { Badge } from "primereact/badge";
import { Divider } from "primereact/divider";

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
      <div className="p-grid">
        <div className="p-col-6 p-md-3">
          <div className="field">
            <b>Empresa:</b> {product.business?.name || 'N/A'}
          </div>
        </div>
        <div className="p-col-6 p-md-3">
          <div className="field">
            <b>Oficina:</b> {product.office?.name || 'N/A'}
          </div>
        </div>
        <div className="p-col-6 p-md-3">
          <div className="field">
            <b>Departamento:</b> {product.department?.name || 'N/A'}
          </div>
        </div>
        <div className="p-col-6 p-md-3">
          <div className="field">
            <b>Equipo:</b> {product.team?.name || 'N/A'}
          </div>
        </div>
      </div>
    );
  };

  const renderBasicInfo = (product) => {
    return (
      <div className="p-grid">
        <div className="p-col-12 p-md-6">
          <div className="field">
            <b>Nombre:</b> {product.name}
          </div>
        </div>
        <div className="p-col-12 p-md-6">
          <div className="field">
            <b>Categoría:</b> {product.category?.name || 'N/A'}
          </div>
        </div>
        <div className="p-col-12 p-md-6">
          <div className="field">
            <b>Unidad de Medida:</b> {product.unitOfMeasure}
          </div>
        </div>
        <div className="p-col-12 p-md-6">
          <div className="field">
            <b>Garantía:</b> {product.warranty || 'N/A'}
          </div>
        </div>
      </div>
    );
  };

  const renderPricingInfo = (product) => {
    const margin = ((product.basePrice - product.costPrice) / product.costPrice * 100).toFixed(2);
    
    return (
      <div className="p-grid">
        <div className="p-col-12 p-md-6">
          <div className="field">
            <b>Precio Costo:</b> {formatCurrency(product.costPrice, product.costCurrency)}
          </div>
        </div>
        <div className="p-col-12 p-md-6">
          <div className="field">
            <b>Precio Venta:</b> {formatCurrency(product.basePrice, product.baseCurrency)}
          </div>
        </div>
        <div className="p-col-12 p-md-6">
          <div className="field">
            <b>Margen:</b> 
            <Tag 
              value={`${margin}%`} 
              severity={margin > 0 ? "success" : "danger"}
              className="ml-2"
            />
          </div>
        </div>
        <div className="p-col-12 p-md-6">
          <div className="field">
            <b>Monedas aceptadas:</b>
            <div className="mt-1">
              {product.pricingConfig?.acceptedCurrencies?.map(currency => (
                <Tag key={currency} value={currency} className="mr-1" />
              ))}
            </div>
          </div>
        </div>
        <div className="p-col-12">
          <div className="field">
            <b>Margen sobre tipo de cambio:</b> {product.pricingConfig?.exchangeRateMargin || 0}%
          </div>
        </div>
        <div className="p-col-12">
          <div className="field">
            <b>Decimales para redondeo:</b> {product.pricingConfig?.decimalPlaces || 2}
          </div>
        </div>
      </div>
    );
  };

  const renderFixedPrices = (fixedPrices) => {
    if (!fixedPrices || fixedPrices.length === 0) {
      return <p>No hay precios fijos definidos</p>;
    }

    return (
      <div className="p-grid">
        {fixedPrices.map((price, index) => (
          <div className="p-col-12 p-md-6" key={index}>
            <div className="p-inputgroup">
              <span className="p-inputgroup-addon">{price.currency}</span>
              <span className="p-inputgroup-addon">
                {formatCurrency(price.amount, price.currency)}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAttributes = (attributes) => {
    if (!attributes || Object.keys(attributes).length === 0) {
      return <p>No hay atributos definidos</p>;
    }

    return (
      <div className="p-grid">
        {Object.entries(attributes).map(([key, value]) => (
          <div className="p-col-12 p-md-6" key={key}>
            <div className="p-inputgroup">
              <span className="p-inputgroup-addon">{key}</span>
              <span className="p-inputgroup-addon">{value}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSaleRules = (saleRules) => {
    if (!saleRules) return <p>No hay reglas de venta definidas</p>;

    return (
      <div className="p-grid">
        <div className="p-col-12 p-md-6">
          <div className="field">
            <b>Cantidad mínima:</b> {saleRules.minQuantity || 'N/A'}
          </div>
        </div>
        <div className="p-col-12 p-md-6">
          <div className="field">
            <b>Cantidad máxima:</b> {saleRules.maxQuantity || 'N/A'}
          </div>
        </div>
        <div className="p-col-12">
          <Divider align="left">
            <b>Descuentos por volumen</b>
          </Divider>
          {saleRules.bulkDiscounts?.length > 0 ? (
            <DataView
              value={saleRules.bulkDiscounts}
              itemTemplate={(discount) => (
                <div className="p-grid p-fluid">
                  <div className="p-col-12 p-md-3">
                    <div className="field">
                      <b>Cantidad mínima:</b> {discount.minQty}
                    </div>
                  </div>
                  <div className="p-col-12 p-md-3">
                    <div className="field">
                      <b>Descuento:</b> {discount.discount}%
                    </div>
                  </div>
                  <div className="p-col-12 p-md-6">
                    <div className="field">
                      <b>Monedas aplicables:</b>
                      <div className="mt-1">
                        {discount.applicableCurrencies.map(currency => (
                          <Badge key={currency} value={currency} className="mr-1" />
                        ))}
                      </div>
                    </div>
                  </div>
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
      <div className="p-grid">
        <div className="p-col-12 p-md-6">
          <div className="field">
            <b>Creado por:</b> {product.createdBy?.name || 'N/A'}
          </div>
          <div className="field">
            <b>Fecha creación:</b> {formatDate(product.createdAt)}
          </div>
        </div>
        <div className="p-col-12 p-md-6">
          <div className="field">
            <b>Actualizado por:</b> {product.updatedBy?.name || 'N/A'}
          </div>
          <div className="field">
            <b>Última actualización:</b> {formatDate(product.updatedAt)}
          </div>
        </div>
        {product.deletedAt && (
          <div className="p-col-12 p-md-6">
            <div className="field">
              <b>Eliminado por:</b> {product.deletedBy?.name || 'N/A'}
            </div>
            <div className="field">
              <b>Fecha eliminación:</b> {formatDate(product.deletedAt)}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog
      header={`Detalles del Producto: ${product?.name || ''}`}
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
      ) : product ? (
        <div className="p-fluid">
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