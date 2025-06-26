import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { useMutation } from "@apollo/client";
import { CREATE_CONFIG } from "../graphql/queries";
import { Toast } from "primereact/toast";

const visibilityOptions = [
  { label: "Público", value: "PUBLIC" },
  { label: "Privado", value: "PRIVATE" },
];

const statusOptions = [
  { label: "Habilitado", value: "ENABLED" },
  { label: "Deshabilitado", value: "DISABLED" },
];

const categoryOptions = [
  { label: "General", value: "GENERAL" },
  { label: "Seguridad", value: "SECURITY" },
  { label: "Frontend", value: "FRONTEND" },
  { label: "Sistema", value: "SYSTEM" },
];

export const ConfigCreateForm = ({ visible, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    category: "GENERAL",
    group: "",
    description: "",
    values: "{}",
    configStatus: "ENABLED",
    configVisibility: "PUBLIC",
  });

  const toast = useRef(null);
  const [createConfig] = useMutation(CREATE_CONFIG);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDropdownChange = (e, field) => {
    setFormData((prev) => ({ ...prev, [field]: e.value }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.group || !formData.values) {
        throw new Error("Grupo y valores son campos requeridos");
      }

      await createConfig({
        variables: {
          input: {
            ...formData,
            values: JSON.parse(formData.values),
          },
        },
      });

      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Configuración creada correctamente",
        life: 3000,
      });

      onSuccess();
      onHide();
      setFormData({
        category: "GENERAL",
        group: "",
        description: "",
        values: "{}",
        configStatus: "ENABLED",
        configVisibility: "PUBLIC",
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
        header="Crear Nueva Configuración"
        visible={visible}
        style={{ width: "50vw" }}
        footer={footer}
        onHide={onHide}
      >
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="group">Grupo*</label>
            <InputText
              id="group"
              name="group"
              value={formData.group}
              onChange={handleChange}
              required
            />
          </div>

          <div className="p-field">
            <label htmlFor="description">Descripción</label>
            <InputText
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="p-field">
            <label htmlFor="category">Categoría*</label>
            <Dropdown
              id="category"
              value={formData.category}
              options={categoryOptions}
              onChange={(e) => handleDropdownChange(e, "category")}
              optionLabel="label"
              placeholder="Seleccione categoría"
              required
            />
          </div>

          <div className="p-field">
            <label htmlFor="values">Valores (JSON)*</label>
            <InputText
              id="values"
              name="values"
              value={formData.values}
              onChange={handleChange}
              required
            />
          </div>

          <div className="p-field">
            <label htmlFor="configVisibility">Visibilidad*</label>
            <Dropdown
              id="configVisibility"
              value={formData.configVisibility}
              options={visibilityOptions}
              onChange={(e) => handleDropdownChange(e, "configVisibility")}
              optionLabel="label"
              placeholder="Seleccione visibilidad"
              required
            />
          </div>

          <div className="p-field">
            <label htmlFor="configStatus">Estado*</label>
            <Dropdown
              id="configStatus"
              value={formData.configStatus}
              options={statusOptions}
              onChange={(e) => handleDropdownChange(e, "configStatus")}
              optionLabel="label"
              placeholder="Seleccione estado"
              required
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};
