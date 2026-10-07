import { useCallback, useRef, useState } from "react";
import { useLazyQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import GenericDataTable from "../../../components/BaseTable";
import { GET_CONFIGS } from "../graphql/queries";
import { CATEGORY_LABELS, GROUP_LABELS } from "../labels";
import { ConfigForm } from "./ConfigForm";

const columns = [
  {
    field: "group",
    header: "Grupo",
    sortable: true,
    filter: true,
    body: (row) => (
      <span className="flex flex-column">
        <span className="font-medium text-900">
          {GROUP_LABELS[row.group] ?? row.group}
        </span>
        <small className="text-color-secondary">{row.description}</small>
      </span>
    ),
  },
  {
    field: "category",
    header: "Categoría",
    sortable: true,
    body: (row) => {
      const category = CATEGORY_LABELS[row.category];
      return (
        <Tag
          value={category?.label ?? row.category}
          severity={category?.severity ?? "secondary"}
        />
      );
    },
  },
  {
    field: "configStatus",
    header: "Estado",
    sortable: true,
    body: (row) =>
      row.configStatus === "ENABLED" ? (
        <Tag value="Activo" severity="success" />
      ) : (
        <Tag value="Inactivo" severity="secondary" />
      ),
  },
];

/**
 * Grupos de configuración. Los define el backend: aquí solo se editan sus
 * valores y se activan o desactivan.
 */
export function ConfigTable() {
  const toast = useRef(null);
  const lastParams = useRef(null);
  const [fetchConfigs, { loading, data, error }] = useLazyQuery(GET_CONFIGS, {
    fetchPolicy: "network-only",
  });
  const [editing, setEditing] = useState(null);

  const handleFetchData = useCallback(
    async (params) => {
      lastParams.current = params;
      try {
        const { data: response } = await fetchConfigs({
          variables: {
            options: {
              skip: params.skip,
              take: params.take,
              filters: params.filters,
              sorts: params.sorts,
            },
          },
        });
        return {
          data: response?.configs?.data,
          totalCount: response?.configs?.totalCount,
        };
      } catch {
        return { data: [], totalCount: 0 };
      }
    },
    [fetchConfigs]
  );

  const handleRefresh = useCallback(() => {
    if (lastParams.current) handleFetchData(lastParams.current);
  }, [handleFetchData]);

  const handleSaved = (saved) => {
    setEditing(null);
    handleRefresh();
    toast.current?.show({
      severity: "success",
      summary: "Configuración guardada",
      detail: GROUP_LABELS[saved?.group] ?? saved?.group,
      life: 6000,
    });
  };

  const actionBodyTemplate = (row) => (
    <div className="actions-column">
      <Button
        icon="pi pi-pencil"
        text
        rounded
        tooltip="Editar valores"
        tooltipOptions={{ position: "top" }}
        aria-label="Editar valores"
        onClick={() => setEditing(row)}
      />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />

      <GenericDataTable
        columns={columns}
        data={data?.configs?.data}
        totalRecords={data?.configs?.totalCount}
        loading={loading}
        error={error}
        globalFilterFields={["group", "description"]}
        emptyMessage="No hay configuraciones"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} grupos"
        onRefresh={handleRefresh}
        onFetchData={handleFetchData}
        initialPageSize={25}
        initialSorts={[
          { field: "category", order: 1 },
          { field: "group", order: 1 },
        ]}
      >
        <Column body={actionBodyTemplate} header="Acciones" className="w-6rem" />
      </GenericDataTable>

      {editing && (
        <ConfigForm
          config={editing}
          onHide={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
