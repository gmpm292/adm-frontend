import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { useQuery } from "@apollo/client";
import { GET_CONFIG } from "../graphql/queries";
import { Tag } from "primereact/tag";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

const getVisibilityTag = (visibility: string) => {
  switch (visibility) {
    case "PUBLIC":
      return <Tag severity="success" value="Público" />;
    case "PRIVATE":
      return <Tag severity="info" value="Privado" />;
    default:
      return <Tag severity="warning" value={visibility} />;
  }
};

const getStatusTag = (status: string) => {
  switch (status) {
    case "ENABLED":
      return <Tag severity="success" value="Habilitado" />;
    case "DISABLED":
      return <Tag severity="danger" value="Deshabilitado" />;
    default:
      return <Tag severity="warning" value={status} />;
  }
};

const getCategoryTag = (category: string) => {
  switch (category) {
    case "GENERAL":
      return <Tag severity="info" value="General" />;
    case "SECURITY":
      return <Tag severity="danger" value="Seguridad" />;
    case "FRONTEND":
      return <Tag severity="warning" value="Frontend" />;
    case "SYSTEM":
      return <Tag severity="success" value="Sistema" />;
    default:
      return <Tag severity="warning" value={category} />;
  }
};

export const ConfigDetailForm = ({ configId, visible, onHide }) => {
  const { loading, error, data } = useQuery(GET_CONFIG, {
    variables: { id: configId },
    skip: !configId,
  });

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error al cargar la configuración</div>;

  const config = data?.config;
  if (!config) return null;

  const valuesArray = Object.entries(config.values || {}).map(
    ([key, value]) => ({
      key,
      value: typeof value === "object" ? JSON.stringify(value) : value,
    })
  );

  const footer = (
    <div>
      <Button
        label="Cerrar"
        icon="pi pi-times"
        onClick={onHide}
        className="p-button-text"
      />
    </div>
  );

  return (
    <Dialog
      header={`Detalles de Configuración - ${config.group}`}
      visible={visible}
      style={{ width: "50vw" }}
      footer={footer}
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="p-field">
          <label>ID</label>
          <div>{config.id}</div>
        </div>

        <div className="p-field">
          <label>Grupo</label>
          <div>{config.group}</div>
        </div>

        <div className="p-field">
          <label>Descripción</label>
          <div>{config.description || "-"}</div>
        </div>

        <div className="p-field">
          <label>Categoría</label>
          <div>{getCategoryTag(config.category)}</div>
        </div>

        <div className="p-field">
          <label>Visibilidad</label>
          <div>{getVisibilityTag(config.configVisibility)}</div>
        </div>

        <div className="p-field">
          <label>Estado</label>
          <div>{getStatusTag(config.configStatus)}</div>
        </div>

        <div className="p-field">
          <label>Valores</label>
          <DataTable value={valuesArray} paginator rows={5}>
            <Column field="key" header="Clave" />
            <Column field="value" header="Valor" />
          </DataTable>
        </div>

        <div className="p-field">
          <label>Creado en</label>
          <div>{new Date(config.createdAt).toLocaleString()}</div>
        </div>

        <div className="p-field">
          <label>Actualizado en</label>
          <div>{new Date(config.updatedAt).toLocaleString()}</div>
        </div>
      </div>
    </Dialog>
  );
};
