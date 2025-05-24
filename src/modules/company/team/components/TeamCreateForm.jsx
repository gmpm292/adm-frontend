import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { useMutation } from "@apollo/client";
import { CREATE_TEAM } from "../graphql/queries";
import SecurityEntitySelector from "../../../../components/SecurityEntitySelector/SecurityEntitySelector";
import { EntityTypes } from "../../../../components/SecurityEntitySelector/entityTypes";

const teamTypes = [
  { label: "Trabajo de campo", value: "FIELDWORK" },
  { label: "Operaciones", value: "OPERATIONS" },
  { label: "Entregas", value: "DELIVERIES" },
  { label: "Ventas", value: "SALES" },
  { label: "Publicidad y marketing", value: "ADVERTISING_MARKETING" },
];

export const TeamCreateForm = ({ visible, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    teamType: null,
    name: "",
    description: "",
    businessId: null,
    officeId: null,
    departmentId: null,
  });
  const toast = useRef(null);
  const [createTeam] = useMutation(CREATE_TEAM);

  const handleTeamTypeChange = (e) => {
    setFormData((prev) => ({ ...prev, teamType: e.value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSecurityEntitiesChange = (entities) => {
    setFormData((prev) => ({
      ...prev,
      businessId: entities.businessId,
      officeId: entities.officeId,
      departmentId: entities.departmentId,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.teamType || !formData.name || !formData.departmentId) {
        throw new Error("Tipo, nombre y departamento son campos requeridos");
      }

      await createTeam({
        variables: {
          team: {
            teamType: formData.teamType,
            name: formData.name,
            description: formData.description,
            departmentId: formData.departmentId,
          },
        },
      });

      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Equipo creado correctamente",
        life: 3000,
      });

      onSuccess();
      onHide();
      setFormData({
        teamType: null,
        name: "",
        description: "",
        businessId: null,
        officeId: null,
        departmentId: null,
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
        header="Crear Nuevo Equipo"
        visible={visible}
        style={{ width: "50vw" }}
        footer={footer}
        onHide={onHide}
      >
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="teamType">Tipo*</label>
            <Dropdown
              id="teamType"
              value={formData.teamType}
              options={teamTypes}
              onChange={handleTeamTypeChange}
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
              placeholder="Ingrese nombre del equipo"
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
              placeholder="Ingrese descripción del equipo"
            />
          </div>

          <SecurityEntitySelector
            onSelectionChange={handleSecurityEntitiesChange}
            entitiesToInclude={[
              EntityTypes.BUSINESS,
              EntityTypes.OFFICE,
              EntityTypes.DEPARTMENT,
            ]}
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
