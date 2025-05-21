import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { useMutation, useQuery } from "@apollo/client";
import { Toast } from "primereact/toast";
import { useRef } from "react";

import { GET_TEAM_BY_ID, UPDATE_TEAM } from "../graphql/queries";

const teamTypes = [
  { label: "Operaciones", value: "OPERATIONS" },
  { label: "Nuevos Negocios", value: "NEW_BUSINESS" },
  { label: "Renovaciones", value: "RENOVATIONS" }
];

export const TeamEditForm = ({ teamId, visible, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    teamType: null,
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
        });
      }
    },
  });

  const handleTeamTypeChange = (e) => {
    setFormData((prev) => ({ ...prev, teamType: e.value }));
  };

  const handleSubmit = async () => {
    try {
      await updateTeam({
        variables: {
          team: {
            id: teamId,
            ...formData,
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
          </div>
        )}
      </Dialog>
    </>
  );
};