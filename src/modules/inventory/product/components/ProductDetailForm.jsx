import React, { useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { useLazyQuery } from "@apollo/client";
import { GET_PRODUCT_BY_ID } from "../graphql/queries";
import { ProgressSpinner } from "primereact/progressspinner";
import { formatDate } from "../../../../utils/dateUtils";
import { formatCurrency } from "../../../../utils/numberUtils";
import { Tag } from "primereact/tag";

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

  return (
    <Dialog
      header="Detalles del Producto"
      visible={visible}
      style={{ width: "600px" }}
      onHide={onHide}
      modal
    >
      {loading ? (
        <div className="flex justify-center">
          <ProgressSpinner />
        </div>
      ) : product ? (
        <div className="p-fluid">
          <div className="field"><b>Nombre:</b> {product.name}</div>
          <div className="field"><b>Categoría:</b> {product.category?.name || 'N/A'}</div>
          <div className="field"><b>Unidad de Medida:</b> {product.unitOfMeasure}</div>
          <div className="field"><b>Precio Costo:</b> {formatCurrency(product.costPrice)}</div>
          <div className="field"><b>Precio Venta:</b> {formatCurrency(product.salePrice)}</div>
          <div className="field"><b>Margen:</b> 
            <Tag 
              value={`${((product.salePrice - product.costPrice) / product.costPrice * 100).toFixed(2)}%`} 
              severity="info"
              className="ml-2"
            />
          </div>
          <div className="field"><b>Garantía:</b> {product.warranty || 'N/A'}</div>
          <div className="field"><b>Fecha de creación:</b> {formatDate(product.createdAt)}</div>
          <div className="field"><b>Última actualización:</b> {formatDate(product.updatedAt)}</div>
        </div>
      ) : (
        <p>No se encontró información del producto.</p>
      )}
    </Dialog>
  );
}