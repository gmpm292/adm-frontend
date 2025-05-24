import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { useMutation, useQuery } from "@apollo/client";
import { GET_TEAM_BY_ID, UPDATE_TEAM } from "../graphql/queries";
import { Toast } from "primereact/toast";

const teamTypes = [
  { label: "Trabajo de campo", value: "FIELDWORK" },
  { label: "Operaciones", value: "OPERATIONS" },
  { label: "Entregas", value: "DELIVERIES" },
  { label: "Ventas", value: "SALES" },
  { label: "Publicidad y marketing", value: "ADVERTISING_MARKETING" },
];

export const TeamEditForm = ({ teamId, visible, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    teamType: null,
    name: "",
    description: "",
    business: null,
    office: null,
    department: null,
  });
  const toast = useRef(null);
  const [updateTeam] = useMutation(UPDATE_TEAM);

  const { loading, error } = useQuery(GET_TEAM_BY_ID, {
    variables: { id: teamId },
    skip: !teamId,
    onCompleted: (data) => {
      if (data?.team) {
        setFormData({
          teamType: data.team.teamType,
          name: data.team.name || "",
          description: data.team.description || "",
          business: data.team.department?.office?.business || null,
          office: data.team.department?.office || null,
          department: data.team.department || null,
        });
      }
    },
  });

  const handleTeamTypeChange = (e) => {
    setFormData((prev) => ({ ...prev, teamType: e.value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.teamType || !formData.name) {
        throw new Error("Tipo y nombre son campos requeridos");
      }

      await updateTeam({
        variables: {
          team: {
            id: teamId,
            teamType: formData.teamType,
            name: formData.name,
            description: formData.description,
          },
        },
      });

      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Equipo actualizado correctamente",
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
        header="Editar Equipo"
        visible={visible}
        style={{ width: "50vw" }}
        footer={footer}
        onHide={onHide}
      >
        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p>Error al cargar equipo</p>
        ) : (
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
                placeholder="Nombre del equipo"
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
                placeholder="Descripción del equipo"
              />
            </div>

            {/* <div className="p-field">
              <label>Empresa</label>
              <InputText
                value={formData.business?.name || "No asignada"}
                readOnly
                className="readonly-input"
              />
            </div>

            <div className="p-field">
              <label>Oficina</label>
              <InputText
                value={formData.office?.name || "No asignada"}
                readOnly
                className="readonly-input"
              />
            </div> */}

            <div className="p-field">
              <label>Departamento</label>
              <InputText
                value={formData.department?.name || "No asignado"}
                readOnly
                className="readonly-input"
              />
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
};
