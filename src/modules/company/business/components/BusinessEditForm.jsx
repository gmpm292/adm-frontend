import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useMutation, useQuery } from "@apollo/client";
import { Toast } from "primereact/toast";
import { useRef } from "react";

import { GET_BUSINESS_BY_ID, UPDATE_BUSINESS } from "../graphql/queries";
import { FormField } from "../../../../components/ui";

export const BusinessEditForm = ({
  businessId,
  visible,
  onHide,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    taxId: "",
    address: "",
    contactPhone: "",
    contactEmail: "",
  });
  const toast = useRef(null);
  const [updateBusiness] = useMutation(UPDATE_BUSINESS);

  const { loading, error } = useQuery(GET_BUSINESS_BY_ID, {
    variables: { id: businessId },
    skip: !businessId,
    onCompleted: (data) => {
      if (data?.business) {
        setFormData({
          name: data.business.name || "",
          taxId: data.business.taxId || "",
          address: data.business.address || "",
          contactPhone: data.business.contactPhone || "",
          contactEmail: data.business.contactEmail || "",
        });
      }
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      await updateBusiness({
        variables: {
          business: {
            id: businessId,
            ...formData,
          },
        },
      });

      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Empresa actualizada correctamente",
        life: 3000,
      });

      onSuccess();
      onHide();
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
        label="Guardar"
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
        header="Editar Empresa"
        visible={visible}
        className="w-full md:w-8 lg:w-6"
        footer={footer}
        onHide={onHide}
      >
        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p>Error al cargar empresa</p>
        ) : (
          <div className="formgrid grid">
            <div className="col-12 md:col-6">
              <FormField label="Nombre" htmlFor="name">
                <InputText
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
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
        )}
      </Dialog>
    </>
  );
};
