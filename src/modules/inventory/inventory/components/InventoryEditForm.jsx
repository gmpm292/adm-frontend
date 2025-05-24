import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { useMutation, useQuery } from "@apollo/client";
import { GET_INVENTORY_BY_ID, UPDATE_INVENTORY } from "../graphql/queries";
import { Toast } from "primereact/toast";
import { ProductSelector } from "../../product/components/ProductSelector";

export const InventoryEditForm = ({
  inventoryId,
  visible,
  onHide,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    productId: null,
    currentStock: 0,
    minStock: null,
    location: "",
  });
  const toast = useRef(null);
  const [updateInventory] = useMutation(UPDATE_INVENTORY);

  const { loading, error } = useQuery(GET_INVENTORY_BY_ID, {
    variables: { id: inventoryId },
    skip: !inventoryId,
    onCompleted: (data) => {
      if (data?.inventory) {
        setFormData({
          productId: data.inventory.product?.id || null,
          currentStock: data.inventory.currentStock,
          minStock: data.inventory.minStock,
          location: data.inventory.location || "",
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

  const handleProductSelect = (productId) => {
    setFormData((prev) => ({ ...prev, productId }));
  };

  const handleSubmit = async () => {
    try {
      await updateInventory({
        variables: {
          inventory: {
            id: inventoryId,
            productId: formData.productId,
            currentStock: formData.currentStock,
            minStock: formData.minStock,
            location: formData.location,
          },
        },
      });

      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Inventario actualizado correctamente",
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
        header="Editar Inventario"
        visible={visible}
        style={{ width: "50vw" }}
        footer={footer}
        onHide={onHide}
      >
        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p>Error al cargar inventario</p>
        ) : (
          <div className="p-fluid">
            <div className="p-field">
              <label htmlFor="productId">Producto</label>
              <ProductSelector
                onProductSelect={handleProductSelect}
                selectedProductId={formData.productId}
              />
            </div>

            <div className="p-field">
              <label htmlFor="currentStock">Stock Actual</label>
              <InputNumber
                id="currentStock"
                name="currentStock"
                value={formData.currentStock}
                onValueChange={handleNumberChange}
                mode="decimal"
                min={0}
              />
            </div>

            <div className="p-field">
              <label htmlFor="minStock">Stock Mínimo</label>
              <InputNumber
                id="minStock"
                name="minStock"
                value={formData.minStock}
                onValueChange={handleNumberChange}
                mode="decimal"
                min={0}
              />
            </div>

            <div className="p-field">
              <label htmlFor="location">Ubicación</label>
              <InputText
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
};
