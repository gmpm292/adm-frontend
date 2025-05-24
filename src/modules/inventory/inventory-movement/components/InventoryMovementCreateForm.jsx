import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { useMutation } from "@apollo/client";
import { CREATE_INVENTORY_MOVEMENT } from "../graphql/queries";
import { Toast } from "primereact/toast";
import { InventorySelector } from "../../inventory/components/InventorySelector";

const movementTypes = [
  { label: "Entrada", value: "IN" },
  { label: "Salida", value: "OUT" }
];

export const InventoryMovementCreateForm = ({ visible, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    inventoryId: null,
    type: null,
    quantity: 0,
    reason: ""
  });
  const toast = useRef(null);
  const [createMovement] = useMutation(CREATE_INVENTORY_MOVEMENT);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.value }));
  };

  const handleTypeChange = (e) => {
    setFormData(prev => ({ ...prev, type: e.value }));
  };

  const handleInventorySelect = (inventoryId) => {
    setFormData(prev => ({ ...prev, inventoryId }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.inventoryId || !formData.type || !formData.quantity) {
        throw new Error("Inventario, tipo y cantidad son campos requeridos");
      }

      await createMovement({
        variables: {
          movement: {
            inventoryId: formData.inventoryId,
            type: formData.type,
            quantity: formData.quantity,
            reason: formData.reason
          }
        }
      });

      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Movimiento creado correctamente",
        life: 3000
      });

      onSuccess();
      onHide();
      setFormData({
        inventoryId: null,
        type: null,
        quantity: 0,
        reason: ""
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
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="Crear" icon="pi pi-check" onClick={handleSubmit} autoFocus />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog 
        header="Crear Nuevo Movimiento" 
        visible={visible} 
        style={{ width: '50vw' }} 
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
            <label htmlFor="reason">Motivo</label>
            <InputText
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};