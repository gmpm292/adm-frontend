import React, { useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { useLazyQuery } from "@apollo/client";

import { ProgressSpinner } from "primereact/progressspinner";
import { Badge } from "primereact/badge";
import { GET_ROLE_GUARD_BY_ID } from "../graphql/queries";
import { formatDate } from "../../../utils/dateUtils";

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
      style={{ width: "600px" }}
      onHide={onHide}
      modal
    >
      {loading ? (
        <div className="flex justify-center">
          <ProgressSpinner />
        </div>
      ) : roleGuard ? (
        <div className="p-fluid">
          <div className="field">
            <b>Operación:</b> {roleGuard.queryOrEndPointURL}
          </div>
          <div className="field">
            <b>Descripción:</b> {roleGuard.description || "N/A"}
          </div>
          <div className="field">
            <b>Tipo:</b>{" "}
            <Badge
              value={typeConfig[roleGuard.type]?.label || roleGuard.type}
              severity={typeConfig[roleGuard.type]?.severity || "secondary"}
            />
          </div>
          <div className="field">
            <b>Roles Permitidos:</b>
            <div className="flex flex-wrap gap-1 mt-1">
              {roleGuard.roles && roleGuard.roles.length > 0 ? (
                roleGuard.roles.map((role, index) => (
                  <Badge key={index} value={role} severity="success" />
                ))
              ) : (
                <Badge value="Sin roles configurados" severity="danger" />
              )}
            </div>
          </div>
          <div className="field">
            <b>Estado:</b>{" "}
            {roleGuard.roles && roleGuard.roles.length > 0 ? (
              <Badge value="Activo" severity="success" />
            ) : (
              <Badge value="Inactivo" severity="danger" />
            )}
          </div>
          <div className="field">
            <b>Fecha de creación:</b> {formatDate(roleGuard.createdAt)}
          </div>
          <div className="field">
            <b>Última actualización:</b> {formatDate(roleGuard.updatedAt)}
          </div>
        </div>
      ) : (
        <p>No se encontró información del role guard.</p>
      )}
    </Dialog>
  );
}
