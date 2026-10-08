import { useRef, useState } from "react";
import { useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { EmptyState } from "../../../../../components/ui";
import { formatDateTime } from "../../../../sales/format";
import { GET_EMAIL_TEMPLATES } from "../graphql/email-templates.queries";
import { EmailTemplateForm } from "./EmailTemplateForm";

/** Plantillas de correo: el backend las usa en sendEmailWithTemplate */
export function EmailTemplatesTab() {
  const toast = useRef(null);
  const { data, loading, refetch } = useQuery(GET_EMAIL_TEMPLATES, {
    fetchPolicy: "network-only",
  });
  // { template } al editar, {} al crear
  const [form, setForm] = useState(null);

  const handleSaved = (saved, { created }) => {
    setForm(null);
    refetch();
    toast.current?.show({
      severity: "success",
      summary: created ? "Plantilla creada" : "Plantilla actualizada",
      life: 6000,
    });
  };

  return (
    <div className="flex flex-column gap-3">
      <Toast ref={toast} />

      <div className="flex justify-content-end">
        <Button
          label="Nueva plantilla"
          icon="pi pi-plus"
          onClick={() => setForm({})}
        />
      </div>

      <DataTable
        value={data?.emailTemplates ?? []}
        loading={loading}
        paginator
        rows={10}
        emptyMessage={
          <EmptyState
            icon="pi pi-file"
            title="Aún no hay plantillas de correo"
          />
        }
        onRowClick={(e) => setForm({ template: e.data })}
        rowHover
        className="cursor-pointer"
      >
        <Column field="name" header="Nombre" sortable />
        <Column field="subject" header="Asunto" sortable />
        <Column
          field="isActive"
          header="Estado"
          sortable
          body={(row) => (
            <Tag
              severity={row.isActive ? "success" : "secondary"}
              value={row.isActive ? "Activa" : "Deshabilitada"}
            />
          )}
        />
        <Column
          field="updatedAt"
          header="Actualizada"
          sortable
          body={(row) => formatDateTime(row.updatedAt)}
        />
        <Column
          body={(row) => (
            <Button
              icon="pi pi-pencil"
              text
              rounded
              tooltip="Editar"
              tooltipOptions={{ position: "top" }}
              aria-label="Editar plantilla"
              onClick={(e) => {
                e.stopPropagation();
                setForm({ template: row });
              }}
            />
          )}
          className="w-4rem"
        />
      </DataTable>

      {form && (
        <EmailTemplateForm
          template={form.template}
          onHide={() => setForm(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
