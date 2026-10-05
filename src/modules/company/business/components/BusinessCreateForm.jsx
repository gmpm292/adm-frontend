import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { useMutation } from "@apollo/client";

import { CREATE_BUSINESS } from "../graphql/queries";
import { FormField } from "../../../../components/ui";

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
        header="Crear Nueva Empresa"
        visible={visible}
        className="w-full md:w-8 lg:w-6"
        footer={footer}
        onHide={onHide}
      >
        <div className="formgrid grid">
          <div className="col-12 md:col-6">
            <FormField label="Nombre" htmlFor="name" required>
              <InputText
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </FormField>
          </div>

          <div className="col-12 md:col-6">
            <FormField label="RUC/NIT" htmlFor="taxId">
              <InputText
                id="taxId"
                name="taxId"
                value={formData.taxId}
                onChange={handleChange}
              />
            </FormField>
          </div>

          <div className="col-12 md:col-6">
            <FormField label="Dirección" htmlFor="address">
              <InputText
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </FormField>
          </div>

          <div className="col-12 md:col-6">
            <FormField label="Teléfono" htmlFor="contactPhone">
              <InputText
                id="contactPhone"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
              />
            </FormField>
          </div>

          <div className="col-12 md:col-6">
            <FormField label="Email" htmlFor="contactEmail">
              <InputText
                id="contactEmail"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
              />
            </FormField>
          </div>
        </div>
      </Dialog>
    </>
  );
};
