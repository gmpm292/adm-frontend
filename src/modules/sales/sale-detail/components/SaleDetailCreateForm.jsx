import React, { useState, useRef, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { useMutation, useLazyQuery } from "@apollo/client";
import { CREATE_SALE_DETAIL } from "../graphql/queries";
import { Toast } from "primereact/toast";
import { GET_PRODUCTS } from "../../../inventory/product/graphql/queries";
import { PublicistSelector } from "./PublicistSelector";
import { FormField } from "../../../../components/ui";

export const SaleDetailCreateForm = ({ saleId, visible, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    saleId: saleId,
    productId: null,
    quantity: 1,
    publicistIds: []
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

  const handlePublicistsChange = (publicistIds) => {
    setFormData(prev => ({ ...prev, publicistIds }));
  };

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
            publicistIds: formData.publicistIds
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
        publicistIds: []
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
    <>
      <Button 
        label="Cancelar" 
        icon="pi pi-times" 
        onClick={onHide} 
        severity="secondary"
      />
      <Button 
        label="Crear" 
        icon="pi pi-check" 
        onClick={handleSubmit} 
        autoFocus 
      />
    </>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header="Agregar Producto a Venta"
        visible={visible}
        className="w-full md:w-30rem"
        footer={footer}
        onHide={onHide}
      >
        <div className="formgrid grid">
          <div className="col-12">
            <FormField label="Producto" htmlFor="productId" required>
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
            </FormField>
          </div>

          <div className="col-12">
            <FormField label="Cantidad" htmlFor="quantity" required>
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
            </FormField>
          </div>

          <div className="col-12">
            <PublicistSelector
              selectedPublicistIds={formData.publicistIds}
              onPublicistsChange={handlePublicistsChange}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};