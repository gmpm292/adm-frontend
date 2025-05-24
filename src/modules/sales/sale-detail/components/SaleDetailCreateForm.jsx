import React, { useState, useRef, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { useMutation, useLazyQuery } from "@apollo/client";
import { CREATE_SALE_DETAIL } from "../graphql/queries";
import { Toast } from "primereact/toast";
import { GET_PRODUCTS } from "../../../inventory/product/graphql/queries";

export const SaleDetailCreateForm = ({ saleId, visible, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    saleId: saleId,
    productId: null,
    quantity: 1,
    discountPercentage: 0
  });
  
  const [products, setProducts] = useState([]);
  const toast = useRef(null);
  const [createSaleDetail] = useMutation(CREATE_SALE_DETAIL);
  const [getProducts] = useLazyQuery(GET_PRODUCTS, {
    onCompleted: (data) => {
      setProducts(data?.products?.data?.map(p => ({
        label: `${p.code} - ${p.name}`,
        value: p.id
      })) || []);
    }
  });

  useEffect(() => {
    if (visible) {
      getProducts();
    }
  }, [visible, getProducts]);

  const handleSubmit = async () => {
    try {
      if (!formData.productId || formData.quantity <= 0) {
        throw new Error("Producto y cantidad son requeridos");
      }

      await createSaleDetail({
        variables: {
          saleDetail: {
            saleId: formData.saleId,
            productId: formData.productId,
            quantity: formData.quantity,
            discountPercentage: formData.discountPercentage
          }
        }
      });

      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Detalle de venta creado correctamente",
        life: 3000
      });

      onSuccess();
      onHide();
      setFormData({
        saleId: saleId,
        productId: null,
        quantity: 1,
        discountPercentage: 0
      });
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: err.message,
        life: 3000
      });
    }
  };

  const footer = (
    <div>
      <Button 
        label="Cancelar" 
        icon="pi pi-times" 
        onClick={onHide} 
        className="p-button-text" 
      />
      <Button 
        label="Crear" 
        icon="pi pi-check" 
        onClick={handleSubmit} 
        autoFocus 
      />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header="Agregar Producto a Venta"
        visible={visible}
        style={{ width: "50vw" }}
        footer={footer}
        onHide={onHide}
      >
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="productId">Producto*</label>
            <Dropdown
              id="productId"
              value={formData.productId}
              options={products}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                productId: e.value 
              }))}
              optionLabel="label"
              placeholder="Seleccione producto"
              filter
              required
            />
          </div>

          <div className="p-field">
            <label htmlFor="quantity">Cantidad*</label>
            <InputNumber
              id="quantity"
              value={formData.quantity}
              onValueChange={(e) => setFormData(prev => ({ 
                ...prev, 
                quantity: e.value 
              }))}
              min={1}
              required
            />
          </div>

          <div className="p-field">
            <label htmlFor="discountPercentage">Descuento (%)</label>
            <InputNumber
              id="discountPercentage"
              value={formData.discountPercentage}
              onValueChange={(e) => setFormData(prev => ({ 
                ...prev, 
                discountPercentage: e.value 
              }))}
              min={0}
              max={100}
              suffix="%"
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};