import { useCallback, useRef, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import GenericDataTable from "../../../components/BaseTable";
import { ConditionalOperator } from "../../../components/BaseTable/types";
import { getErrorMessage } from "../../../utils/errors";
import { roleLabel } from "../../user/roles";
import { GET_ROLE_GUARDS, UPDATE_ROLE_GUARD } from "../graphql/queries";
import { RoleGuardForm } from "./RoleGuardForm";
import { TYPE_LABELS } from "../labels";
import { RoleTypeTabs } from "./RoleTypeTabs";

const RoleTags = ({ roles }) => (
  <div className="flex flex-wrap gap-1">
    {roles.map((role) => (
      <Tag key={role} value={roleLabel(role)} severity="info" />
    ))}
  </div>
);

/** Quién puede usar la operación y de dónde sale esa regla */
const accessBody = (row) => {
  if (!row.usesRoleGuard) {
    return (
      <span className="text-color-secondary">
        No comprueba roles: basta con la sesión o es pública
      </span>
    );
  }
  if (row.roles) {
    return (
      <span className="flex flex-column gap-1">
        <RoleTags roles={row.roles} />
        <small className="text-orange-600">Personalizado aquí</small>
      </span>
    );
  }
  if (!row.codeRoles?.length) {
    return <span>Cualquier rol</span>;
  }
  return (
    <span className="flex flex-column gap-1">
      <RoleTags roles={row.codeRoles} />
      <small className="text-color-secondary">Según el código</small>
    </span>
  );
};

const columns = [
  {
    field: "queryOrEndPointURL",
    header: "Operación",
    sortable: true,
    filter: true,
    body: (row) => (
      <span className="flex flex-column">
        <span className="font-medium text-900">{row.queryOrEndPointURL}</span>
        {row.description && (
          <small className="text-color-secondary">{row.description}</small>
        )}
      </span>
    ),
  },
  {
    field: "type",
    header: "Tipo",
    sortable: true,
    body: (row) => TYPE_LABELS[row.type] ?? row.type,
  },
  {
    field: "roles",
    header: "Quién puede usarla",
    sortable: false,
    body: accessBody,
  },
];

export function RoleGuardTable() {
  const toast = useRef(null);
  const lastParams = useRef(null);
  const [type, setType] = useState(null);
  const [editing, setEditing] = useState(null);
  const [fetchRoleGuards, { loading, data, error }] = useLazyQuery(
    GET_ROLE_GUARDS,
    { fetchPolicy: "network-only" }
  );
  const [updateRoleGuard] = useMutation(UPDATE_ROLE_GUARD);

  const handleFetchData = useCallback(
    async (params) => {
      lastParams.current = params;
      try {
        const { data: response } = await fetchRoleGuards({
          variables: {
            options: {
              skip: params.skip,
              take: params.take,
              sorts: params.sorts,
              filters: [
                ...(params.filters ?? []),
                ...(type
                  ? [
                      {
                        property: "type",
                        operator: ConditionalOperator.EQUAL,
                        value: type,
                      },
                    ]
                  : []),
              ],
            },
          },
        });
        return {
          data: response?.roleGuards?.data,
          totalCount: response?.roleGuards?.totalCount,
        };
      } catch {
        return { data: [], totalCount: 0 };
      }
    },
    [fetchRoleGuards, type]
  );

  const handleRefresh = useCallback(() => {
    if (lastParams.current) handleFetchData(lastParams.current);
  }, [handleFetchData]);

  const notify = (severity, summary, detail) =>
    toast.current?.show({ severity, summary, detail, life: 6000 });

  const handleSaved = (saved) => {
    setEditing(null);
    handleRefresh();
    notify("success", "Roles guardados", saved?.queryOrEndPointURL);
  };

  const handleReset = (row) =>
    confirmDialog({
      header: "Volver a los roles del código",
      message: `"${row.queryOrEndPointURL}" dejará de usar los roles personalizados y aplicará los del código.`,
      icon: "pi pi-undo",
      acceptLabel: "Volver al código",
      rejectLabel: "Cancelar",
      accept: async () => {
        try {
          await updateRoleGuard({
            variables: { updateRoleGuardInput: { id: row.id, roles: null } },
          });
          notify("success", "Roles del código", row.queryOrEndPointURL);
          handleRefresh();
        } catch (err) {
          notify("error", "No se pudo cambiar", getErrorMessage(err));
        }
      },
    });

  // Sin RoleGuard no hay nada que cambiar (y `false` se pintaría como texto)
  const actionBodyTemplate = (row) =>
    row.usesRoleGuard ? (
      <div className="actions-column">
        <Button
          icon="pi pi-pencil"
          text
          rounded
          tooltip="Cambiar roles"
          tooltipOptions={{ position: "top" }}
          aria-label="Cambiar roles"
          onClick={() => setEditing(row)}
        />
        {row.roles && (
          <Button
            icon="pi pi-undo"
            text
            rounded
            severity="secondary"
            tooltip="Volver a los roles del código"
            tooltipOptions={{ position: "top" }}
            aria-label="Volver a los roles del código"
            onClick={() => handleReset(row)}
          />
        )}
      </div>
    ) : null;

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <GenericDataTable
        // Cambiar de pestaña vuelve a la primera página
        key={type ?? "all"}
        columns={columns}
        data={data?.roleGuards?.data}
        totalRecords={data?.roleGuards?.totalCount}
        loading={loading}
        error={error}
        globalFilterFields={["queryOrEndPointURL", "description"]}
        emptyMessage="No hay operaciones"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} operaciones"
        onRefresh={handleRefresh}
        onFetchData={handleFetchData}
        initialPageSize={25}
        initialSorts={[{ field: "queryOrEndPointURL", order: 1 }]}
        header={<RoleTypeTabs activeTab={type} onTabChange={setType} />}
      >
        <Column body={actionBodyTemplate} header="Acciones" className="w-8rem" />
      </GenericDataTable>

      {editing && (
        <RoleGuardForm
          roleGuard={editing}
          onHide={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}

export default RoleGuardTable;
