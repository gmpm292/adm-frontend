// src/pages/Admin/Users/UserDetailForm.jsx

import React, { useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { useLazyQuery } from "@apollo/client";
import { GET_USER_BY_ID } from "../graphql/queries";
import { ProgressSpinner } from "primereact/progressspinner";
import { Tag } from "primereact/tag";
import { FormField } from "../../../components/ui";

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
      className="ui-dialog--wide"
      onHide={onHide}
      modal
    >
      {loading ? (
        <div className="flex justify-content-center p-5">
          <ProgressSpinner strokeWidth="4" className="w-3rem h-3rem" />
        </div>
      ) : user ? (
        <div className="formgrid grid">
          <div className="col-12 md:col-6">
            <FormField label="Nombres">
              <span>{user.name}</span>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Apellidos">
              <span>{user.lastName}</span>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Email">
              <span>{user.email}</span>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Móvil">
              <span>{user.mobile}</span>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Estado">
              <div>
                <Tag
                  severity={user.enabled ? "success" : "danger"}
                  value={user.enabled ? "Activo" : "Inactivo"}
                />
              </div>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Rol">
              <span>{user.role?.join(", ")}</span>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Business">
              <span>{user.business?.name || "N/A"}</span>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Oficina">
              <span>{user.office?.name || "N/A"}</span>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Departamento">
              <span>{user.department?.name || "N/A"}</span>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Equipo">
              <span>{user.team?.name || "N/A"}</span>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="2FA Configurado">
              <span>{user.isTwoFactorConfigured ? "Sí" : "No"}</span>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="2FA Activado">
              <span>{user.isTwoFactorEnabled ? "Sí" : "No"}</span>
            </FormField>
          </div>
        </div>
      ) : (
        <p className="m-0 text-color-secondary">
          No se encontró información del usuario.
        </p>
      )}
    </Dialog>
  );
}
