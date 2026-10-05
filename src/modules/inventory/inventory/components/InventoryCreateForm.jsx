import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { useMutation } from "@apollo/client";
import { CREATE_INVENTORY } from "../graphql/queries";
import { Toast } from "primereact/toast";
import { Divider } from "primereact/divider";
import { ProductSelector } from "../../product/components/ProductSelector";
import { FormField } from "../../../../components/ui";
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
        header="Crear Nuevo Inventario"
        visible={visible}
        className="w-full md:w-8 lg:w-6"
        footer={footer}
        onHide={onHide}
      >
        <div className="formgrid grid p-fluid">
          <div className="col-12">
            <FormField label="Producto" htmlFor="productId" required>
              <ProductSelector
                onProductSelect={handleProductSelect}
                selectedProductId={formData.productId}
              />
            </FormField>
          </div>

          <div className="col-12 md:col-6">
            <FormField label="Stock Actual" htmlFor="currentStock" required>
              <InputNumber
                inputId="currentStock"
                name="currentStock"
                value={formData.currentStock}
                onValueChange={handleNumberChange}
                mode="decimal"
                min={0}
                required
              />
            </FormField>
          </div>

          <div className="col-12 md:col-6">
            <FormField label="Stock Mínimo" htmlFor="minStock">
              <InputNumber
                inputId="minStock"
                name="minStock"
                value={formData.minStock}
                onValueChange={handleNumberChange}
                mode="decimal"
                min={0}
              />
            </FormField>
          </div>

          <div className="col-12">
            <FormField label="Ubicación" htmlFor="location">
              <InputText
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
            </FormField>
          </div>

          <div className="col-12">
            <Divider />
            <SecurityEntitySelector
              onSelectionChange={handleSecurityEntitiesChange}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};
