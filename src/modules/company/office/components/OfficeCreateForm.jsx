import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { useMutation } from "@apollo/client";

import { CREATE_OFFICE } from "../graphql/queries";

const officeTypes = [
  { label: "Oficina", value: "OFFICE" },
  { label: "Sucursal", value: "BRANCH" },
];

export const OfficeCreateForm = ({ visible, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    officeType: null,
    name: "",
    description: "",
    address: "",
  });
  const toast = useRef(null);
  const [createOffice] = useMutation(CREATE_OFFICE);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOfficeTypeChange = (e) => {
    setFormData((prev) => ({ ...prev, officeType: e.value }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.officeType || !formData.name || !formData.description) {
        throw new Error("Tipo, nombre y descripción son campos requeridos");
      }

      await createOffice({
        variables: {
          office: formData,
        },
      });

      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Oficina creada correctamente",
        life: 3000,
      });

      onSuccess();
      onHide();
      setFormData({
        officeType: null,
        name: "",
        description: "",
        address: "",
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
        header="Crear Nueva Oficina"
        visible={visible}
        style={{ width: "50vw" }}
        footer={footer}
        onHide={onHide}
      >
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="officeType">Tipo*</label>
            <Dropdown
              id="officeType"
              value={formData.officeType}
              options={officeTypes}
              onChange={handleOfficeTypeChange}
              optionLabel="label"
              placeholder="Seleccione tipo"
              required
            />
          </div>

          <div className="p-field">
            <label htmlFor="name">Nombre*</label>
            <InputText
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="p-field">
            <label htmlFor="description">Descripción*</label>
            <InputText
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="p-field">
            <label htmlFor="address">Dirección</label>
            <InputText
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};
