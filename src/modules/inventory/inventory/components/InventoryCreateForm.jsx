import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { useMutation } from "@apollo/client";
import { CREATE_INVENTORY } from "../graphql/queries";
import { Toast } from "primereact/toast";
import { ProductSelector } from "../../product/components/ProductSelector";
import SecurityEntitySelector from "../../../../components/SecurityEntitySelector/SecurityEntitySelector";

export const InventoryCreateForm = ({ visible, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    productId: null,
    currentStock: 0,
    minStock: null,
    location: "",
    businessId: null,
    officeId: null,
    departmentId: null,
    teamId: null,
  });

  const toast = useRef(null);
  const [createInventory] = useMutation(CREATE_INVENTORY);

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

  const handleSecurityEntitiesChange = (entities) => {
    setFormData((prev) => ({ ...prev, ...entities }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.productId) {
        throw new Error("Debe seleccionar un producto");
      }

      const inventoryInput = {
        productId: formData.productId,
        currentStock: formData.currentStock,
        minStock: formData.minStock,
        location: formData.location,
        ...(formData.businessId && { businessId: formData.businessId }),
        ...(formData.officeId && { officeId: formData.officeId }),
        ...(formData.departmentId && { departmentId: formData.departmentId }),
        ...(formData.teamId && { teamId: formData.teamId }),
      };

      await createInventory({
        variables: {
          inventory: inventoryInput,
        },
      });

      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Inventario creado correctamente",
        life: 3000,
      });

      onSuccess();
      onHide();
      setFormData({
        productId: null,
        currentStock: 0,
        minStock: null,
        location: "",
        businessId: null,
        officeId: null,
        departmentId: null,
        teamId: null,
      });
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
        header="Crear Nuevo Inventario"
        visible={visible}
        style={{ width: "50vw" }}
        footer={footer}
        onHide={onHide}
      >
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="productId">Producto*</label>
            <ProductSelector
              onProductSelect={handleProductSelect}
              selectedProductId={formData.productId}
            />
          </div>

          <div className="p-field">
            <label htmlFor="currentStock">Stock Actual*</label>
            <InputNumber
              id="currentStock"
              name="currentStock"
              value={formData.currentStock}
              onValueChange={handleNumberChange}
              mode="decimal"
              min={0}
              required
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

          <hr className="my-4" />

          <div className="p-field">
            <SecurityEntitySelector
              onSelectionChange={handleSecurityEntitiesChange}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};
