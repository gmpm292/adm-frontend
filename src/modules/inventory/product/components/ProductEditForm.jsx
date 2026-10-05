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
import { FormField } from "../../../../components/ui";

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
    <>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        onClick={onHide}
        severity="secondary"
      />
      <Button
        label="Guardar"
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
        header="Editar Producto"
        visible={visible}
        className="w-full md:w-8 lg:w-6"
        footer={footer}
        onHide={onHide}
      >
        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p>Error al cargar producto</p>
        ) : (
          <div className="formgrid grid p-fluid">
            <div className="col-12 md:col-6">
              <FormField label="Nombre" htmlFor="name">
                <InputText
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </FormField>
            </div>

            <div className="col-12 md:col-6">
              <FormField label="Unidad de Medida" htmlFor="unitOfMeasure">
                <InputText
                  id="unitOfMeasure"
                  name="unitOfMeasure"
                  value={formData.unitOfMeasure}
                  onChange={handleChange}
                />
              </FormField>
            </div>

            <div className="col-12 md:col-6">
              <FormField label="Categoría" htmlFor="categoryId">
                <CategorySelector
                  onCategorySelect={handleCategorySelect}
                  selectedCategoryId={formData.categoryId}
                />
              </FormField>
            </div>

            <div className="col-12 md:col-6">
              <FormField label="Garantía" htmlFor="warranty">
                <InputText
                  id="warranty"
                  name="warranty"
                  value={formData.warranty}
                  onChange={handleChange}
                />
              </FormField>
            </div>

            <div className="col-12 md:col-6">
              <FormField label="Precio Costo" htmlFor="costPrice">
                <InputNumber
                  inputId="costPrice"
                  name="costPrice"
                  value={formData.costPrice}
                  onValueChange={handleNumberChange}
                  mode="currency"
                  currency="USD"
                  locale="en-US"
                  min={0}
                />
              </FormField>
            </div>

            <div className="col-12 md:col-6">
              <FormField label="Precio Venta" htmlFor="salePrice">
                <InputNumber
                  inputId="salePrice"
                  name="salePrice"
                  value={formData.salePrice}
                  onValueChange={handleNumberChange}
                  mode="currency"
                  currency="USD"
                  locale="en-US"
                  min={0}
                />
              </FormField>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
};
