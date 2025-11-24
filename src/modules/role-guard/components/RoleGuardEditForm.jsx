import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { MultiSelect } from "primereact/multiselect";
import { useMutation, useQuery } from "@apollo/client";

import { Toast } from "primereact/toast";
import { GET_ROLE_GUARD_BY_ID, UPDATE_ROLE_GUARD } from "../graphql/queries";

// Roles disponibles en el sistema
const AVAILABLE_ROLES = [
  { label: "Super Administrador", value: "SUPER" },
  { label: "Principal", value: "PRINCIPAL" },
  { label: "Administrador", value: "ADMIN" },
  { label: "Gerente", value: "MANAGER" },
  { label: "Supervisor", value: "SUPERVISOR" },
  { label: "Agente", value: "AGENT" },
  { label: "Usuario", value: "USER" },
];

export const RoleGuardEditForm = ({
  roleGuardId,
  visible,
  onHide,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    description: "",
    roles: [],
  });
  const toast = useRef(null);
  const [updateRoleGuard] = useMutation(UPDATE_ROLE_GUARD);

  const { loading, error } = useQuery(GET_ROLE_GUARD_BY_ID, {
    variables: { id: roleGuardId },
    skip: !roleGuardId,
    onCompleted: (data) => {
      if (data?.roleGuard) {
        setFormData({
          description: data.roleGuard.description || "",
          roles: data.roleGuard.roles || [],
        });
      }
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRolesChange = (e) => {
    setFormData((prev) => ({ ...prev, roles: e.value }));
  };

  const handleSubmit = async () => {
    try {
      await updateRoleGuard({
        variables: {
          updateRoleGuardInput: {
            id: roleGuardId,
            description: formData.description,
            roles: formData.roles,
          },
        },
      });

      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Role guard actualizado correctamente",
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
        header="Configurar Roles Permitidos"
        visible={visible}
        style={{ width: "50vw" }}
        footer={footer}
        onHide={onHide}
      >
        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p>Error al cargar role guard</p>
        ) : (
          <div className="p-fluid">
            <div className="p-field">
              <label htmlFor="description">Descripción</label>
              <InputText
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled
              />
              <small className="p-text-muted">
                Esta descripción es generada automáticamente por el sistema
              </small>
            </div>

            <div className="p-field">
              <label htmlFor="roles">Roles Permitidos *</label>
              <MultiSelect
                id="roles"
                value={formData.roles}
                options={AVAILABLE_ROLES}
                onChange={handleRolesChange}
                placeholder="Seleccione los roles permitidos"
                display="chip"
                className="w-full"
              />
              <small className="p-text-muted">
                Seleccione los roles que pueden ejecutar esta operación. Deje
                vacío para denegar acceso a todos.
              </small>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
};
