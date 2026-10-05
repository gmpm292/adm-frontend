import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { useMutation } from "@apollo/client";
import { CREATE_DEPARTMENT } from "../graphql/queries";
import SecurityEntitySelector from "../../../../components/SecurityEntitySelector/SecurityEntitySelector";
import { EntityTypes } from "../../../../components/SecurityEntitySelector/entityTypes";
import { FormField } from "../../../../components/ui";

const departmentTypes = [
  { label: "Económico", value: "ECONOMIC" },
  { label: "Ventas", value: "SALES" },
  { label: "Administración", value: "ADMINISTRATION" },
];

export const DepartmentCreateForm = ({ visible, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    departmentType: null,
    name: "",
    description: "",
    address: "",
    businessId: null,
    officeId: null,
  });
  const toast = useRef(null);
  const [createDepartment] = useMutation(CREATE_DEPARTMENT);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDepartmentTypeChange = (e) => {
    setFormData((prev) => ({ ...prev, departmentType: e.value }));
  };

  const handleSecurityEntitiesChange = (entities) => {
    setFormData((prev) => ({
      ...prev,
      businessId: entities.businessId,
      officeId: entities.officeId,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.departmentType || !formData.name || !formData.officeId) {
        throw new Error("Tipo, nombre y oficina son campos requeridos");
      }

      await createDepartment({
        variables: {
          department: {
            departmentType: formData.departmentType,
            name: formData.name,
            description: formData.description,
            address: formData.address,
            officeId: formData.officeId,
          },
        },
      });

      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Departamento creado correctamente",
        life: 3000,
      });

      onSuccess();
      onHide();
      setFormData({
        departmentType: null,
        name: "",
        description: "",
        address: "",
        businessId: null,
        officeId: null,
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
        header="Crear Nuevo Departamento"
        visible={visible}
        className="w-full md:w-8 lg:w-6"
        footer={footer}
        onHide={onHide}
      >
        <div className="formgrid grid">
          <div className="col-12">
            <SecurityEntitySelector
              onSelectionChange={handleSecurityEntitiesChange}
              entitiesToInclude={[EntityTypes.BUSINESS, EntityTypes.OFFICE]}
              labels={{
                business: "Empresa",
                office: "Oficina",
                department: "Departamento",
                team: "Equipo",
              }}
            />
          </div>

          <div className="col-12 md:col-6">
            <FormField label="Tipo" htmlFor="departmentType" required>
              <Dropdown
                id="departmentType"
                value={formData.departmentType}
                options={departmentTypes}
                onChange={handleDepartmentTypeChange}
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
            <FormField label="Descripción" htmlFor="description">
              <InputText
                id="description"
                name="description"
                value={formData.description}
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
        </div>
      </Dialog>
    </>
  );
};
