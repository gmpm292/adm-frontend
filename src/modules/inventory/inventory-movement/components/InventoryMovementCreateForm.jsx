import React, { useState, useRef, useEffect } from "react";
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
  { label: "Salida", value: "OUT" },
];

const movementReasons = [
  { label: "Inventario Inicial", value: "INITIAL_INVENTORY" },
  { label: "Compra", value: "PURCHASE" },
  { label: "Venta", value: "SALE" },
  { label: "Ajuste de inventario", value: "INVENTORY_ADJUSTMENT" },
  { label: "Devolución", value: "RETURN" },
  { label: "Transferencia", value: "TRANSFER" },
  { label: "Pérdida", value: "LOSS" },
  { label: "Otro", value: "OTHER" },
];

export const InventoryMovementCreateForm = ({
  visible,
  onHide,
  onSuccess,
  inventoryId: selectedInventoryId = null,
}) => {
  const [formData, setFormData] = useState({
    inventoryId: null,
    type: null,
    quantity: 0,
    reason: "",
  });

  const toast = useRef(null);
  const [createMovement] = useMutation(CREATE_INVENTORY_MOVEMENT);

  // Actualizar el inventoryId cuando cambia el prop selectedInventoryId
  useEffect(() => {
    if (selectedInventoryId) {
      setFormData((prev) => ({ ...prev, inventoryId: selectedInventoryId }));
    }
  }, [selectedInventoryId]);

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

      await createMovement({
        variables: {
          movement: {
            inventoryId: formData.inventoryId,
            type: formData.type,
            quantity: formData.quantity,
            reason: formData.reason,
          },
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
        inventoryId: selectedInventoryId, // Mantener el inventoryId si hay uno seleccionado
        type: null,
        quantity: 0,
        reason: "",
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
              disabled={!!selectedInventoryId} // Deshabilitar si hay un inventoryId seleccionado
            />
            {selectedInventoryId && (
              <small className="p-d-block p-mt-1">
                El inventario está preseleccionado desde la tabla
              </small>
            )}
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
        </div>
      </Dialog>
    </>
  );
};
