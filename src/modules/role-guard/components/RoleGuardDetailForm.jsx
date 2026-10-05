import React, { useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { useLazyQuery } from "@apollo/client";

import { ProgressSpinner } from "primereact/progressspinner";
import { Tag } from "primereact/tag";
import { GET_ROLE_GUARD_BY_ID } from "../graphql/queries";
import { formatDate } from "../../../utils/dateUtils";
import { FormField } from "../../../components/ui";

export function RoleGuardDetailForm({ roleGuardId, visible, onHide }) {
  const [getRoleGuard, { data, loading }] = useLazyQuery(GET_ROLE_GUARD_BY_ID, {
    variables: { id: roleGuardId },
    fetchPolicy: "network-only",
    skip: !roleGuardId,
  });

  useEffect(() => {
    if (visible && roleGuardId) {
      getRoleGuard();
    }
  }, [visible, roleGuardId, getRoleGuard]);

  const roleGuard = data?.roleGuard;

  const typeConfig = {
    QUERY: { label: "Consulta", severity: "info" },
    MUTATION: { label: "Mutación", severity: "warning" },
    SUBSCRIPTION: { label: "Suscripción", severity: "success" },
  };

  return (
    <Dialog
      header="Detalles del Role Guard"
      visible={visible}
      className="w-full md:w-30rem"
      onHide={onHide}
      modal
    >
      {loading ? (
        <div className="flex justify-content-center">
          <ProgressSpinner strokeWidth="4" className="w-3rem h-3rem" />
        </div>
      ) : roleGuard ? (
        <div className="grid">
          <div className="col-12">
            <FormField label="Operación">
              <span className="font-medium">
                {roleGuard.queryOrEndPointURL}
              </span>
            </FormField>
          </div>
          <div className="col-12">
            <FormField label="Descripción">
              <span>{roleGuard.description || "N/A"}</span>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Tipo">
              <div>
                <Tag
                  value={typeConfig[roleGuard.type]?.label || roleGuard.type}
                  severity={typeConfig[roleGuard.type]?.severity || "secondary"}
                />
              </div>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Estado">
              <div>
                {roleGuard.roles && roleGuard.roles.length > 0 ? (
                  <Tag value="Activo" severity="success" />
                ) : (
                  <Tag value="Inactivo" severity="danger" />
                )}
              </div>
            </FormField>
          </div>
          <div className="col-12">
            <FormField label="Roles Permitidos">
              <div className="flex flex-wrap gap-1">
                {roleGuard.roles && roleGuard.roles.length > 0 ? (
                  roleGuard.roles.map((role, index) => (
                    <Tag key={index} value={role} severity="success" />
                  ))
                ) : (
                  <Tag value="Sin roles configurados" severity="danger" />
                )}
              </div>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Fecha de creación">
              <span>{formatDate(roleGuard.createdAt)}</span>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Última actualización">
              <span>{formatDate(roleGuard.updatedAt)}</span>
            </FormField>
          </div>
        </div>
      ) : (
        <p>No se encontró información del role guard.</p>
      )}
    </Dialog>
  );
}
