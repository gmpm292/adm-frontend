import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { useQuery } from "@apollo/client";
import { GET_CONFIG } from "../graphql/queries";
import { Tag } from "primereact/tag";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FormField } from "../../../components/ui";

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
    <Button
      label="Cerrar"
      icon="pi pi-times"
      onClick={onHide}
      severity="secondary"
    />
  );

  return (
    <Dialog
      header={`Detalles de Configuración - ${config.group}`}
      visible={visible}
      className="w-full md:w-8 lg:w-6"
      footer={footer}
      onHide={onHide}
    >
      <div className="grid">
        <div className="col-12 md:col-6">
          <FormField label="ID">
            <div>{config.id}</div>
          </FormField>
        </div>

        <div className="col-12 md:col-6">
          <FormField label="Grupo">
            <div>{config.group}</div>
          </FormField>
        </div>

        <div className="col-12">
          <FormField label="Descripción">
            <div>{config.description || "-"}</div>
          </FormField>
        </div>

        <div className="col-12 md:col-6">
          <FormField label="Categoría">
            <div>{getCategoryTag(config.category)}</div>
          </FormField>
        </div>

        <div className="col-12 md:col-6">
          <FormField label="Visibilidad">
            <div>{getVisibilityTag(config.configVisibility)}</div>
          </FormField>
        </div>

        <div className="col-12 md:col-6">
          <FormField label="Estado">
            <div>{getStatusTag(config.configStatus)}</div>
          </FormField>
        </div>

        <div className="col-12">
          <FormField label="Valores">
            <DataTable value={valuesArray} paginator rows={5}>
              <Column field="key" header="Clave" />
              <Column field="value" header="Valor" />
            </DataTable>
          </FormField>
        </div>

        <div className="col-12 md:col-6">
          <FormField label="Creado en">
            <div>{new Date(config.createdAt).toLocaleString()}</div>
          </FormField>
        </div>

        <div className="col-12 md:col-6">
          <FormField label="Actualizado en">
            <div>{new Date(config.updatedAt).toLocaleString()}</div>
          </FormField>
        </div>
      </div>
    </Dialog>
  );
};
