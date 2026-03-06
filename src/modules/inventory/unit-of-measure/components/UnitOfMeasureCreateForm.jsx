import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import { useMutation } from "@apollo/client";
import { CREATE_UNIT_OF_MEASURE } from "../graphql/queries";
import { Toast } from "primereact/toast";
import SecurityEntitySelector from "../../../../components/SecurityEntitySelector/SecurityEntitySelector";

// Opciones de categoría
const categoryOptions = [
  { label: "Peso", value: "peso" },
  { label: "Volumen", value: "volumen" },
  { label: "Longitud", value: "longitud" },
  { label: "Área", value: "área" },
  { label: "Unidades", value: "unidades" },
  { label: "Tiempo", value: "tiempo" },
  { label: "Energía", value: "energía" },
  { label: "Potencia", value: "potencia" },
  { label: "Temperatura", value: "temperatura" },
];

export const UnitOfMeasureCreateForm = ({ visible, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    category: null,
    description: "",
    isActive: true,
    businessId: null,
    officeId: null,
    departmentId: null,
    teamId: null,
  });

  const toast = useRef(null);
  const [createUnit] = useMutation(CREATE_UNIT_OF_MEASURE);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDropdownChange = (e) => {
    setFormData((prev) => ({ ...prev, category: e.value }));
  };

  const handleStatusChange = (e) => {
    setFormData((prev) => ({ ...prev, isActive: e.value }));
  };

  const handleSecurityEntitiesChange = (entities) => {
    setFormData((prev) => ({ ...prev, ...entities }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.symbol) {
        throw new Error("Nombre y símbolo son campos requeridos");
      }

      await createUnit({
        variables: {
          createUnitOfMeasureInput: formData,
        },
      });

      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Unidad de medida creada correctamente",
        life: 3000,
      });

      onSuccess();
      onHide();
      setFormData({
        name: "",
        symbol: "",
        category: null,
        description: "",
        isActive: true,
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
        header="Crear Nueva Unidad de Medida"
        visible={visible}
        style={{ width: "50vw" }}
        footer={footer}
        onHide={onHide}
        modal
      >
        <div className="p-fluid">
          <div className="field">
            <label htmlFor="name">Nombre*</label>
            <InputText
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="field">
            <label htmlFor="symbol">Símbolo*</label>
            <InputText
              id="symbol"
              name="symbol"
              value={formData.symbol}
              onChange={handleChange}
              required
              tooltip="Ej: kg, L, m, unidad"
              tooltipOptions={{ position: "top" }}
            />
          </div>

          <div className="field">
            <label htmlFor="category">Categoría</label>
            <Dropdown
              id="category"
              value={formData.category}
              options={categoryOptions}
              onChange={handleDropdownChange}
              placeholder="Seleccione una categoría"
              showClear
            />
          </div>

          <div className="field">
            <label htmlFor="description">Descripción</label>
            <InputTextarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              autoResize
            />
          </div>

          <div className="field">
            <label htmlFor="isActive">Estado</label>
            <div className="flex align-items-center">
              <InputSwitch
                id="isActive"
                checked={formData.isActive}
                onChange={handleStatusChange}
              />
              <span className="ml-2">
                {formData.isActive ? "Activo" : "Inactivo"}
              </span>
            </div>
          </div>

          <SecurityEntitySelector
            onSelectionChange={handleSecurityEntitiesChange}
          />
        </div>
      </Dialog>
    </>
  );
};
