// src/pages/Admin/Users/UserDetailForm.jsx

import React, { useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { useLazyQuery } from "@apollo/client";
import { GET_USER_BY_ID } from "../graphql/queries";
import { ProgressSpinner } from "primereact/progressspinner";

export function UserDetailForm({ userId, visible, onHide }) {
  const [getUser, { data, loading }] = useLazyQuery(GET_USER_BY_ID, {
    variables: { id: userId },
    fetchPolicy: "network-only",
    skip: !userId,
  });

  useEffect(() => {
    if (visible && userId) {
      getUser();
    }
  }, [visible, userId, getUser]);

  const user = data?.user;

  return (
    <Dialog
      header="Detalles del Usuario"
      visible={visible}
      style={{ width: "600px" }}
      onHide={onHide}
      modal
    >
      {loading ? (
        <div className="flex justify-center">
          <ProgressSpinner />
        </div>
      ) : user ? (
        <div className="p-fluid">
          <div className="field"><b>Nombres:</b> {user.name}</div>
          <div className="field"><b>Apellidos:</b> {user.lastName}</div>
          <div className="field"><b>Email:</b> {user.email}</div>
          <div className="field"><b>Móvil:</b> {user.mobile}</div>
          <div className="field"><b>Estado:</b> {user.enabled ? "Activo" : "Inactivo"}</div>
          <div className="field"><b>Rol:</b> {user.role?.join(", ")}</div>
          <div className="field"><b>Business:</b> {user.business?.name || "N/A"}</div>
          <div className="field"><b>Oficina:</b> {user.office?.name || "N/A"}</div>
          <div className="field"><b>Departamento:</b> {user.department?.name || "N/A"}</div>
          <div className="field"><b>Equipo:</b> {user.team?.name || "N/A"}</div>
          <div className="field"><b>2FA Configurado:</b> {user.isTwoFactorConfigured ? "Sí" : "No"}</div>
          <div className="field"><b>2FA Activado:</b> {user.isTwoFactorEnabled ? "Sí" : "No"}</div>
        </div>
      ) : (
        <p>No se encontró información del usuario.</p>
      )}
    </Dialog>
  );
}
