import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { useMutation, useQuery } from "@apollo/client";
import { GET_PRODUCT_BY_ID, UPDATE_PRODUCT } from "../graphql/queries";
import { Toast } from "primereact/toast";
import { CategorySelector } from "../../category/components/CategorySelector";
//import { CategorySelector } from "../../category/components/CategorySelector";

export const ProductEditForm = ({ productId, visible, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    unitOfMeasure: "",
    costPrice: 0,
    salePrice: 0,
    warranty: "",
    categoryId: null,
  });
  const toast = useRef(null);
  const [updateProduct] = useMutation(UPDATE_PRODUCT);

  const { loading, error } = useQuery(GET_PRODUCT_BY_ID, {
    variables: { id: productId },
    skip: !productId,
    onCompleted: (data) => {
      if (data?.product) {
        setFormData({
          name: data.product.name || "",
          unitOfMeasure: data.product.unitOfMeasure || "",
          costPrice: data.product.costPrice || 0,
          salePrice: data.product.salePrice || 0,
          warranty: data.product.warranty || "",
          categoryId: data.product.category?.id || null,
        });
      }
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.value }));
  };

  const handleCategorySelect = (categoryId) => {
    setFormData((prev) => ({ ...prev, categoryId }));
  };

  const handleSubmit = async () => {
    try {
      await updateProduct({
        variables: {
          product: {
            id: productId,
            name: formData.name,
            unitOfMeasure: formData.unitOfMeasure,
            costPrice: formData.costPrice,
            salePrice: formData.salePrice,
            warranty: formData.warranty,
            categoryId: formData.categoryId,
          },
        },
      });

      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Producto actualizado correctamente",
        life: 3000,
      });

      onSuccess();
      onHide();
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: err.message,
        life: 3000,
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
        label="Guardar"
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
        header="Editar Producto"
        visible={visible}
        style={{ width: "50vw" }}
        footer={footer}
        onHide={onHide}
      >
        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p>Error al cargar producto</p>
        ) : (
          <div className="p-fluid">
            <div className="p-field">
              <label htmlFor="name">Nombre</label>
              <InputText
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="p-field">
              <label htmlFor="unitOfMeasure">Unidad de Medida</label>
              <InputText
                id="unitOfMeasure"
                name="unitOfMeasure"
                value={formData.unitOfMeasure}
                onChange={handleChange}
              />
            </div>

            <div className="p-field">
              <label htmlFor="categoryId">Categoría</label>
              <CategorySelector
                onCategorySelect={handleCategorySelect}
                selectedCategoryId={formData.categoryId}
              />
            </div>

            <div className="p-field">
              <label htmlFor="costPrice">Precio Costo</label>
              <InputNumber
                id="costPrice"
                name="costPrice"
                value={formData.costPrice}
                onValueChange={handleNumberChange}
                mode="currency"
                currency="USD"
                locale="en-US"
                min={0}
              />
            </div>

            <div className="p-field">
              <label htmlFor="salePrice">Precio Venta</label>
              <InputNumber
                id="salePrice"
                name="salePrice"
                value={formData.salePrice}
                onValueChange={handleNumberChange}
                mode="currency"
                currency="USD"
                locale="en-US"
                min={0}
              />
            </div>

            <div className="p-field">
              <label htmlFor="warranty">Garantía</label>
              <InputText
                id="warranty"
                name="warranty"
                value={formData.warranty}
                onChange={handleChange}
              />
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
};
