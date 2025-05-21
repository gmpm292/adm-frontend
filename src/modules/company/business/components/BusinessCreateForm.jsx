import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { useMutation } from "@apollo/client";

import { CREATE_BUSINESS } from "../graphql/queries";

export const BusinessCreateForm = ({ visible, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    taxId: "",
    address: "",
    contactPhone: "",
    contactEmail: "",
  });
  const toast = useRef(null);
  const [createBusiness] = useMutation(CREATE_BUSINESS);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name) {
        throw new Error("El nombre es requerido");
      }

      await createBusiness({
        variables: {
          business: formData,
        },
      });

      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Empresa creada correctamente",
        life: 3000,
      });

      onSuccess();
      onHide();
      setFormData({
        name: "",
        taxId: "",
        address: "",
        contactPhone: "",
        contactEmail: "",
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
        header="Crear Nueva Empresa"
        visible={visible}
        style={{ width: "50vw" }}
        footer={footer}
        onHide={onHide}
      >
        <div className="p-fluid">
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
            <label htmlFor="taxId">RUC/NIT</label>
            <InputText
              id="taxId"
              name="taxId"
              value={formData.taxId}
              onChange={handleChange}
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

          <div className="p-field">
            <label htmlFor="contactPhone">Teléfono</label>
            <InputText
              id="contactPhone"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
            />
          </div>

          <div className="p-field">
            <label htmlFor="contactEmail">Email</label>
            <InputText
              id="contactEmail"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};
