import React, { useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { useLazyQuery } from "@apollo/client";
import { GET_SCOPED_ACCESS_BY_ID } from "../graphql/queries";
import { ProgressSpinner } from "primereact/progressspinner";
import { Badge } from "primereact/badge";
import { formatDate } from "../../../utils/dateUtils";

export function ScopedAccessDetailForm({ scopedAccessId, visible, onHide }) {
  const [getScopedAccess, { data, loading }] = useLazyQuery(
    GET_SCOPED_ACCESS_BY_ID,
    {
      variables: { id: scopedAccessId },
      fetchPolicy: "network-only",
      skip: !scopedAccessId,
    }
  );

  useEffect(() => {
    if (visible && scopedAccessId) {
      getScopedAccess();
    }
  }, [visible, scopedAccessId, getScopedAccess]);

  const scopedAccess = data?.scopedAccess;

  const levelConfig = {
    BUSINESS: { label: "Negocio", severity: "info" },
    OFFICE: { label: "Oficina", severity: "warning" },
    DEPARTMENT: { label: "Departamento", severity: "help" },
    TEAM: { label: "Equipo", severity: "success" },
    GENERAL: { label: "General", severity: "secondary" },
    PERSONAL: { label: "Personal", severity: "contrast" },
    RELATED: { label: "Relacionado", severity: "info" },
  };

  return (
    <Dialog
      header="Detalles del Nivel de Acceso"
      visible={visible}
      style={{ width: "600px" }}
      onHide={onHide}
      modal
    >
      {loading ? (
        <div className="flex justify-center">
          <ProgressSpinner />
        </div>
      ) : scopedAccess ? (
        <div className="p-fluid">
          <div className="field">
            <b>Negocio:</b> {scopedAccess.business?.name || "N/A"}
          </div>
          <div className="field">
            <b>Operación:</b>{" "}
            {scopedAccess.roleGuard?.description ||
              scopedAccess.roleGuard?.queryOrEndPointURL ||
              "N/A"}
          </div>
          <div className="field">
            <b>Tipo de Operación:</b> {scopedAccess.roleGuard?.type || "N/A"}
          </div>
          <div className="field">
            <b>Niveles de Acceso:</b>
            <div className="flex flex-wrap gap-1 mt-1">
              {scopedAccess.accessLevels &&
              scopedAccess.accessLevels.length > 0 ? (
                scopedAccess.accessLevels.map((level, index) => {
                  const config = levelConfig[level] || {
                    label: level,
                    severity: "secondary",
                  };
                  return (
                    <Badge
                      key={index}
                      value={config.label}
                      severity={config.severity}
                    />
                  );
                })
              ) : (
                <Badge value="Sin niveles configurados" severity="danger" />
              )}
            </div>
          </div>
          <div className="field">
            <b>Estado:</b>{" "}
            <Badge
              value={
                scopedAccess.entityStatus == 1 ? "Habilitado" : "Deshabilitado"
              }
              severity={scopedAccess.entityStatus == 1 ? "success" : "danger"}
            />
          </div>
          <div className="field">
            <b>Roles Permitidos en la Operación:</b>
            <div className="flex flex-wrap gap-1 mt-1">
              {scopedAccess.roleGuard?.roles &&
              scopedAccess.roleGuard.roles.length > 0 ? (
                scopedAccess.roleGuard.roles.map((role, index) => (
                  <Badge key={index} value={role} severity="success" />
                ))
              ) : (
                <Badge value="Sin roles configurados" severity="danger" />
              )}
            </div>
          </div>
          <div className="field">
            <b>Fecha de creación:</b> {formatDate(scopedAccess.createdAt)}
          </div>
          <div className="field">
            <b>Última actualización:</b> {formatDate(scopedAccess.updatedAt)}
          </div>
        </div>
      ) : (
        <p>No se encontró información del nivel de acceso.</p>
      )}
    </Dialog>
  );
}
