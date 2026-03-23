import React, { useState, useRef, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { useMutation } from "@apollo/client";
import { CREATE_INVENTORY_MOVEMENT } from "../graphql/queries";
import { Toast } from "primereact/toast";
import { InventorySelectorWithFilters } from "./InventorySelectorWithFilters";
import { usePrinting } from "../../../printing/printing.module";
import { Message } from "primereact/message";

const movementTypes = [
  { label: "Entrada", value: "IN" },
  { label: "Salida", value: "OUT" },
];

const movementReasons = {
  IN: [
    { label: "Inventario Inicial", value: "INITIAL_INVENTORY" },
    { label: "Compra", value: "PURCHASE" },
    { label: "Devolución", value: "RETURN" },
    { label: "Transferencia", value: "TRANSFER" },
    { label: "Ajuste de inventario", value: "INVENTORY_ADJUSTMENT" },
    { label: "Otro", value: "OTHER" },
  ],
  OUT: [
    { label: "Venta", value: "SALE" },
    { label: "Transferencia", value: "TRANSFER" },
    { label: "Pérdida", value: "LOSS" },
    { label: "Ajuste de inventario", value: "INVENTORY_ADJUSTMENT" },
    { label: "Otro", value: "OTHER" },
  ],
};

export const InventoryMovementCreateForm = ({
  visible,
  onHide,
  onSuccess,
  inventoryId: selectedInventoryId = null,
  officeId: initialOfficeId = null,
  categoryId: initialCategoryId = null,
}) => {
  const [formData, setFormData] = useState({
    inventoryId: null,
    type: null,
    quantity: 0,
    reason: "",
    shouldPrint: true,
  });

  const [availableReasons, setAvailableReasons] = useState([]);
  const [inventoryOptions, setInventoryOptions] = useState([]); // 👈 Estado para opciones de inventario
  const toast = useRef(null);
  const [createMovement] = useMutation(CREATE_INVENTORY_MOVEMENT);
  const { printMovement } = usePrinting(); // 👈 Cambiar printTicket por printMovement

  // Actualizar razones disponibles cuando cambia el tipo
  useEffect(() => {
    if (formData.type) {
      setAvailableReasons(movementReasons[formData.type] || []);
      // Limpiar la razón si no es válida para el nuevo tipo
      if (
        formData.reason &&
        !movementReasons[formData.type]?.some(
          (r) => r.value === formData.reason,
        )
      ) {
        setFormData((prev) => ({ ...prev, reason: "" }));
      }
    } else {
      setAvailableReasons([]);
    }
  }, [formData.type]);

  // Actualizar el inventoryId cuando cambia el prop selectedInventoryId
  useEffect(() => {
    if (selectedInventoryId) {
      setFormData((prev) => ({ ...prev, inventoryId: selectedInventoryId }));
    }
  }, [selectedInventoryId]);

  // Función para recibir las opciones de inventario desde el selector
  const handleInventoryOptionsChange = (options) => {
    setInventoryOptions(options);
  };

  const handleNumberChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.value }));
  };

  const handleTypeChange = (e) => {
    const newType = e.value;
    setFormData((prev) => ({
      ...prev,
      type: newType,
      reason: "", // Limpiar razón al cambiar tipo
    }));
  };

  const handleReasonChange = (e) => {
    setFormData((prev) => ({ ...prev, reason: e.value }));
  };

  const handleInventorySelect = (inventoryId) => {
    setFormData((prev) => ({ ...prev, inventoryId }));
  };

  const handlePrintChange = (e) => {
    setFormData((prev) => ({ ...prev, shouldPrint: e.checked }));
  };

  const validateForm = () => {
    if (!formData.type) {
      throw new Error("Debe seleccionar el tipo de movimiento");
    }
    if (!formData.inventoryId) {
      throw new Error("Debe seleccionar un inventario");
    }
    if (!formData.quantity || formData.quantity <= 0) {
      throw new Error("La cantidad debe ser mayor a 0");
    }
    if (!formData.reason) {
      throw new Error("Debe seleccionar un motivo");
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      validateForm();

      // Crear el movimiento
      const { data } = await createMovement({
        variables: {
          movement: {
            inventoryId: formData.inventoryId,
            type: formData.type,
            quantity: formData.quantity,
            reason: formData.reason,
          },
        },
      });

      // Si está marcada la opción de imprimir, generar el ticket
      if (formData.shouldPrint && data?.createInventoryMovement?.id) {
        // Obtener el inventario seleccionado para más detalles
        const selectedInventory = inventoryOptions.find(
          (opt) => opt.value === formData.inventoryId,
        )?.data;

        // Preparar datos para el servicio de impresión
        const printData = {
          numeroMovimiento: data.createInventoryMovement.id,
          fecha: new Date().toLocaleString(),
          tipo: formData.type === "IN" ? "ENTRADA" : "SALIDA",
          cantidad: formData.quantity,
          motivo:
            availableReasons.find((r) => r.value === formData.reason)?.label ||
            formData.reason,
          producto: selectedInventory?.product?.name,
          ubicacion: selectedInventory?.location,
          usuario: "Usuario Actual", // Idealmente esto vendría del contexto
        };

        // ✅ Usar printMovement directamente (ya tiene su propio formateo interno)
        await printMovement(printData);
      }

      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: formData.shouldPrint
          ? "Movimiento creado y ticket impreso correctamente"
          : "Movimiento creado correctamente",
        life: 3000,
      });

      onSuccess();
      onHide();
      resetForm();
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: err.message,
        life: 3000,
      });
    }
  };

  const resetForm = () => {
    setFormData({
      inventoryId: selectedInventoryId,
      type: null,
      quantity: 0,
      reason: "",
      shouldPrint: true,
    });
  };

  const footer = (
    <div className="flex justify-content-end gap-2">
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
        style={{ width: "60vw" }}
        footer={footer}
        onHide={onHide}
        resizable
        draggable
      >
        <div className="p-fluid">
          {/* Tipo de Movimiento - SOLO UNA VEZ al inicio */}
          <div className="p-field p-mb-4">
            <label htmlFor="type">Tipo de Movimiento*</label>
            <Dropdown
              id="type"
              value={formData.type}
              options={movementTypes}
              onChange={handleTypeChange}
              optionLabel="label"
              placeholder="Seleccione el tipo de movimiento"
              required
              className="w-full"
            />
          </div>

          {/* Selector de inventario con filtros */}
          <InventorySelectorWithFilters
            selectedInventoryId={formData.inventoryId}
            onInventorySelect={handleInventorySelect}
            onInventoryOptionsChange={handleInventoryOptionsChange} // 👈 Pasar la función para recibir opciones
            movementType={formData.type}
            disabled={!formData.type || !!selectedInventoryId}
            officeId={initialOfficeId}
            categoryId={initialCategoryId}
          />

          {!formData.type && (
            <Message
              severity="info"
              text="Seleccione el tipo de movimiento para habilitar la selección de inventario"
              className="w-full p-mt-2"
            />
          )}

          {selectedInventoryId && (
            <small className="p-d-block p-mt-1 p-mb-3 p-text-secondary">
              El inventario está preseleccionado desde la tabla
            </small>
          )}

          {/* Campos adicionales del movimiento */}
          {formData.type && (
            <div className="p-grid p-fluid p-mt-4">
              <div className="p-col-12 p-md-6">
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
                    className="w-full"
                  />
                </div>
              </div>

              <div className="p-col-12 p-md-6">
                <div className="p-field">
                  <label htmlFor="reason">Motivo*</label>
                  <Dropdown
                    id="reason"
                    value={formData.reason}
                    options={availableReasons}
                    onChange={handleReasonChange}
                    optionLabel="label"
                    placeholder="Seleccione un motivo"
                    required
                    filter
                    className="w-full"
                    disabled={!formData.type}
                  />
                </div>
              </div>

              <div className="p-col-12">
                <div className="p-field-checkbox flex align-items-center">
                  <Checkbox
                    inputId="shouldPrint"
                    checked={formData.shouldPrint}
                    onChange={handlePrintChange}
                  />
                  <label htmlFor="shouldPrint" className="ml-2">
                    Imprimir ticket al crear
                  </label>
                </div>
                <small className="text-color-secondary">
                  Se generará un ticket con los detalles del movimiento
                </small>
              </div>
            </div>
          )}

          {/* Vista previa del ticket */}
          {formData.shouldPrint &&
            formData.type &&
            formData.quantity > 0 &&
            formData.reason && (
              <div className="p-mt-4 p-p-3 surface-ground border-round">
                <h5 className="p-mt-0 p-mb-2">Vista previa del ticket</h5>
                <div className="p-grid">
                  <div className="p-col-12">
                    <div className="flex align-items-center gap-2">
                      <i className="pi pi-print text-primary"></i>
                      <span>
                        Se imprimirá un ticket con los siguientes datos:
                      </span>
                    </div>
                    <ul className="p-mt-2 p-mb-0">
                      <li>
                        <strong>Tipo:</strong>{" "}
                        {formData.type === "IN" ? "ENTRADA" : "SALIDA"}
                      </li>
                      <li>
                        <strong>Cantidad:</strong> {formData.quantity}
                      </li>
                      <li>
                        <strong>Motivo:</strong>{" "}
                        {availableReasons.find(
                          (r) => r.value === formData.reason,
                        )?.label || formData.reason}
                      </li>
                      <li>
                        <strong>Fecha:</strong> {new Date().toLocaleString()}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
        </div>
      </Dialog>
    </>
  );
};
