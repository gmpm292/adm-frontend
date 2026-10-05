import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { useMutation, useQuery } from "@apollo/client";
import { GET_INVENTORY_MOVEMENT_BY_ID, UPDATE_INVENTORY_MOVEMENT } from "../graphql/queries";
import { Toast } from "primereact/toast";
import { InventorySelector } from "../../inventory/components/InventorySelector";
//import { InventorySelector } from "../../inventory/components/InventorySelector";
import { FormField } from "../../../../components/ui";

const movementTypes = [
  { label: "Entrada", value: "IN" },
  { label: "Salida", value: "OUT" }
];

export const InventoryMovementEditForm = ({ movementId, visible, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    inventoryId: null,
    type: null,
    quantity: 0,
    reason: ""
  });
  const toast = useRef(null);
  const [updateMovement] = useMutation(UPDATE_INVENTORY_MOVEMENT);

  const { loading, error } = useQuery(GET_INVENTORY_MOVEMENT_BY_ID, {
    variables: { id: movementId },
    skip: !movementId,
    onCompleted: (data) => {
      if (data?.inventoryMovement) {
        setFormData({
          inventoryId: data.inventoryMovement.inventory?.id || null,
          type: data.inventoryMovement.type,
          quantity: data.inventoryMovement.quantity,
          reason: data.inventoryMovement.reason || ""
        });
      }
    }
  });

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
      await updateMovement({
        variables: {
          movement: {
            id: movementId,
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
        detail: "Movimiento actualizado correctamente",
        life: 3000
      });

      onSuccess();
      onHide();
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
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} severity="secondary" />
      <Button label="Guardar" icon="pi pi-check" onClick={handleSubmit} autoFocus />
    </>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header="Editar Movimiento"
        visible={visible}
        className="w-full md:w-8 lg:w-6"
        footer={footer}
        onHide={onHide}
      >
        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p>Error al cargar movimiento</p>
        ) : (
          <div className="formgrid grid p-fluid">
            <div className="col-12">
              <FormField label="Inventario" htmlFor="inventoryId">
                <InventorySelector
                  onInventorySelect={handleInventorySelect}
                  selectedInventoryId={formData.inventoryId}
                />
              </FormField>
            </div>

            <div className="col-12 md:col-6">
              <FormField label="Tipo" htmlFor="type">
                <Dropdown
                  id="type"
                  value={formData.type}
                  options={movementTypes}
                  onChange={handleTypeChange}
                  optionLabel="label"
                  placeholder="Seleccione un tipo"
                />
              </FormField>
            </div>

            <div className="col-12 md:col-6">
              <FormField label="Cantidad" htmlFor="quantity">
                <InputNumber
                  inputId="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onValueChange={handleNumberChange}
                  mode="decimal"
                  min={1}
                />
              </FormField>
            </div>

            <div className="col-12">
              <FormField label="Motivo" htmlFor="reason">
                <InputText
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                />
              </FormField>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
};