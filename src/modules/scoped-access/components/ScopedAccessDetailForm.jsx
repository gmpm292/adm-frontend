import React, { useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { useLazyQuery } from "@apollo/client";
import { GET_SCOPED_ACCESS_BY_ID } from "../graphql/queries";
import { ProgressSpinner } from "primereact/progressspinner";
import { Tag } from "primereact/tag";
import { formatDate } from "../../../utils/dateUtils";
import { FormField } from "../../../components/ui";

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
    DEPARTMENT: { label: "Departamento" },
    TEAM: { label: "Equipo", severity: "success" },
    GENERAL: { label: "General", severity: "secondary" },
    PERSONAL: { label: "Personal", severity: "contrast" },
    RELATED: { label: "Relacionado", severity: "info" },
  };

  return (
    <Dialog
      header="Detalles del Nivel de Acceso"
      visible={visible}
      className="w-full md:w-30rem"
      onHide={onHide}
      modal
    >
      {loading ? (
        <div className="flex justify-content-center">
          <ProgressSpinner strokeWidth="4" className="w-3rem h-3rem" />
        </div>
      ) : scopedAccess ? (
        <div className="grid">
          <div className="col-12 md:col-6">
            <FormField label="Negocio">
              <span className="font-medium">
                {scopedAccess.business?.name || "N/A"}
              </span>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Estado">
              <div>
                <Tag
                  value={
                    scopedAccess.entityStatus == 1
                      ? "Habilitado"
                      : "Deshabilitado"
                  }
                  severity={
                    scopedAccess.entityStatus == 1 ? "success" : "danger"
                  }
                />
              </div>
            </FormField>
          </div>
          <div className="col-12">
            <FormField label="Operación">
              <span>
                {scopedAccess.roleGuard?.description ||
                  scopedAccess.roleGuard?.queryOrEndPointURL ||
                  "N/A"}
              </span>
            </FormField>
          </div>
          <div className="col-12">
            <FormField label="Tipo de Operación">
              <span>{scopedAccess.roleGuard?.type || "N/A"}</span>
            </FormField>
          </div>
          <div className="col-12">
            <FormField label="Niveles de Acceso">
              <div className="flex flex-wrap gap-1">
                {scopedAccess.accessLevels &&
                scopedAccess.accessLevels.length > 0 ? (
                  scopedAccess.accessLevels.map((level, index) => {
                    const config = levelConfig[level] || {
                      label: level,
                      severity: "secondary",
                    };
                    return (
                      <Tag
                        key={index}
                        value={config.label}
                        severity={config.severity}
                      />
                    );
                  })
                ) : (
                  <Tag value="Sin niveles configurados" severity="danger" />
                )}
              </div>
            </FormField>
          </div>
          <div className="col-12">
            <FormField label="Roles Permitidos en la Operación">
              <div className="flex flex-wrap gap-1">
                {scopedAccess.roleGuard?.roles &&
                scopedAccess.roleGuard.roles.length > 0 ? (
                  scopedAccess.roleGuard.roles.map((role, index) => (
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
              <span>{formatDate(scopedAccess.createdAt)}</span>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Última actualización">
              <span>{formatDate(scopedAccess.updatedAt)}</span>
            </FormField>
          </div>
        </div>
      ) : (
        <p>No se encontró información del nivel de acceso.</p>
      )}
    </Dialog>
  );
}
