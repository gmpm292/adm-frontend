import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { useMutation, useQuery } from "@apollo/client";
import { Toast } from "primereact/toast";
import { useRef } from "react";
import { GET_OFFICE_BY_ID, UPDATE_OFFICE } from "../graphql/queries";

const officeTypes = [
  { label: "Oficina", value: "OFFICE" },
  { label: "Sucursal", value: "BRANCH" },
];

export const OfficeEditForm = ({ officeId, visible, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    officeType: null,
    name: "",
    description: "",
    address: "",
  });
  const toast = useRef(null);
  const [updateOffice] = useMutation(UPDATE_OFFICE);

  const { loading, error } = useQuery(GET_OFFICE_BY_ID, {
    variables: { id: officeId },
    skip: !officeId,
    onCompleted: (data) => {
      if (data?.office) {
        setFormData({
          officeType: data.office.officeType,
          name: data.office.name || "",
          description: data.office.description || "",
          address: data.office.address || "",
        });
      }
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOfficeTypeChange = (e) => {
    setFormData((prev) => ({ ...prev, officeType: e.value }));
  };

  const handleSubmit = async () => {
    try {
      await updateOffice({
        variables: {
          office: {
            id: officeId,
            ...formData,
          },
        },
      });

      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Oficina actualizada correctamente",
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
    <div>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        onClick={onHide}
        className="p-button-text"
      />
      <Button
        label="Guardar"
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
        header="Editar Oficina"
        visible={visible}
        style={{ width: "50vw" }}
        footer={footer}
        onHide={onHide}
      >
        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p>Error al cargar oficina</p>
        ) : (
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
        )}
      </Dialog>
    </>
  );
};
