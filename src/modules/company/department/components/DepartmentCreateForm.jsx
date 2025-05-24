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
        header="Crear Nuevo Departamento"
        visible={visible}
        style={{ width: "50vw" }}
        footer={footer}
        onHide={onHide}
      >
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="departmentType">Tipo*</label>
            <Dropdown
              id="departmentType"
              value={formData.departmentType}
              options={departmentTypes}
              onChange={handleDepartmentTypeChange}
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
            <label htmlFor="description">Descripción</label>
            <InputText
              id="description"
              name="description"
              value={formData.description}
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
      </Dialog>
    </>
  );
};
