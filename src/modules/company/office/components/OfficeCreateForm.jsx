import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { useMutation } from "@apollo/client";
import { CREATE_OFFICE } from "../graphql/queries";
import { EntityTypes } from "../../../../components/SecurityEntitySelector/entityTypes";
import SecurityEntitySelector from "../../../../components/SecurityEntitySelector/SecurityEntitySelector";
import { FormField } from "../../../../components/ui";

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
    businessId: null,
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

  const handleSecurityEntitiesChange = (entities) => {
    setFormData((prev) => ({
      ...prev,
      businessId: entities.businessId,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (
        !formData.officeType ||
        !formData.name ||
        !formData.description ||
        !formData.businessId
      ) {
        throw new Error(
          "Tipo, nombre, descripción y empresa son campos requeridos"
        );
      }

      await createOffice({
        variables: {
          office: {
            officeType: formData.officeType,
            name: formData.name,
            description: formData.description,
            address: formData.address,
            businessId: formData.businessId,
          },
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
        businessId: null,
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
        header="Crear Nueva Oficina"
        visible={visible}
        className="w-full md:w-8 lg:w-6"
        footer={footer}
        onHide={onHide}
      >
        <div className="formgrid grid">
          <div className="col-12">
            <SecurityEntitySelector
              onSelectionChange={handleSecurityEntitiesChange}
              entitiesToInclude={[EntityTypes.BUSINESS]}
            />
          </div>

          <div className="col-12 md:col-6">
            <FormField label="Tipo" htmlFor="officeType" required>
              <Dropdown
                id="officeType"
                value={formData.officeType}
                options={officeTypes}
                onChange={handleOfficeTypeChange}
                optionLabel="label"
                placeholder="Seleccione tipo"
                required
              />
            </FormField>
          </div>

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
            <FormField label="Descripción" htmlFor="description" required>
              <InputText
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
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
        </div>
      </Dialog>
    </>
  );
};
