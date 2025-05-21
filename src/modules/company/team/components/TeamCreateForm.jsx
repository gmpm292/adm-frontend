import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { useMutation } from "@apollo/client";

import { CREATE_TEAM } from "../graphql/queries";

const teamTypes = [
  { label: "Operaciones", value: "OPERATIONS" },
  { label: "Nuevos Negocios", value: "NEW_BUSINESS" },
  { label: "Renovaciones", value: "RENOVATIONS" }
];

export const TeamCreateForm = ({ visible, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    teamType: null,
  });
  const toast = useRef(null);
  const [createTeam] = useMutation(CREATE_TEAM);

  const handleTeamTypeChange = (e) => {
    setFormData((prev) => ({ ...prev, teamType: e.value }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.teamType) {
        throw new Error("El tipo es requerido");
      }

      await createTeam({
        variables: {
          team: formData,
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
        </div>
      </Dialog>
    </>
  );
};