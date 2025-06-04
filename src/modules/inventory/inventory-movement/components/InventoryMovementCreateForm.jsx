import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { useMutation } from "@apollo/client";
import { CREATE_INVENTORY_MOVEMENT } from "../graphql/queries";
import { Toast } from "primereact/toast";
import SecurityEntitySelector from "../../../../components/SecurityEntitySelector/SecurityEntitySelector";
import { InventorySelector } from "../../inventory/components/InventorySelector";

const movementTypes = [
  { label: "Entrada", value: "IN" },
  { label: "Salida", value: "OUT" },
];

const movementReasons = [
  { label: "Compra", value: "PURCHASE" },
  { label: "Venta", value: "SALE" },
  { label: "Ajuste de inventario", value: "INVENTORY_ADJUSTMENT" },
  { label: "Devolución", value: "RETURN" },
  { label: "Transferencia", value: "TRANSFER" },
  { label: "Pérdida", value: "LOSS" },
  { label: "Otro", value: "OTHER" },
];

export const InventoryMovementCreateForm = ({ visible, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    inventoryId: null,
    type: null,
    quantity: 0,
    reason: "",
    businessId: null,
    officeId: null,
    departmentId: null,
    teamId: null,
  });

  const toast = useRef(null);
  const [createMovement] = useMutation(CREATE_INVENTORY_MOVEMENT);

  const handleSecurityEntitiesChange = (entities) => {
    setFormData((prev) => ({
      ...prev,
      ...entities,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.value }));
  };

  const handleTypeChange = (e) => {
    setFormData((prev) => ({ ...prev, type: e.value }));
  };

  const handleReasonChange = (e) => {
    setFormData((prev) => ({ ...prev, reason: e.value }));
  };

  const handleInventorySelect = (inventoryId) => {
    setFormData((prev) => ({ ...prev, inventoryId }));
  };

  const handleSubmit = async () => {
    try {
      // Validación de campos requeridos
      if (
        !formData.inventoryId ||
        !formData.type ||
        !formData.quantity ||
        !formData.reason
      ) {
        throw new Error(
          "Inventario, tipo, cantidad y motivo son campos requeridos"
        );
      }

      const movementInput = {
        inventoryId: formData.inventoryId,
        type: formData.type,
        quantity: formData.quantity,
        reason: formData.reason,
        ...(formData.businessId && { businessId: formData.businessId }),
        ...(formData.officeId && { officeId: formData.officeId }),
        ...(formData.departmentId && { departmentId: formData.departmentId }),
        ...(formData.teamId && { teamId: formData.teamId }),
      };

      await createMovement({
        variables: {
          movement: movementInput,
        },
      });

      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Movimiento creado correctamente",
        life: 3000,
      });

      onSuccess();
      onHide();
      setFormData({
        inventoryId: null,
        type: null,
        quantity: 0,
        reason: "",
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
        header="Crear Nuevo Movimiento"
        visible={visible}
        style={{ width: "50vw" }}
        footer={footer}
        onHide={onHide}
      >
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="inventoryId">Inventario*</label>
            <InventorySelector
              onInventorySelect={handleInventorySelect}
              selectedInventoryId={formData.inventoryId}
            />
          </div>

          <div className="p-field">
            <label htmlFor="type">Tipo*</label>
            <Dropdown
              id="type"
              value={formData.type}
              options={movementTypes}
              onChange={handleTypeChange}
              optionLabel="label"
              placeholder="Seleccione un tipo"
              required
            />
          </div>

          <div className="p-field">
            <label htmlFor="quantity">Cantidad*</label>
            <InputNumber
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onValueChange={handleNumberChange}
              mode="decimal"
              min={1}
              required
            />
          </div>

          <div className="p-field">
            <label htmlFor="reason">Motivo*</label>
            <Dropdown
              id="reason"
              value={formData.reason}
              options={movementReasons}
              onChange={handleReasonChange}
              optionLabel="label"
              placeholder="Seleccione un motivo"
              required
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
