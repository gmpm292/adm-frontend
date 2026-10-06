import { useCallback, useRef, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import GenericDataTable from "../../../../components/BaseTable/index";
import { getErrorMessage } from "../../../../utils/errors";
import {
  DELETE_CUSTOMERS,
  GET_CUSTOMERS,
  RESTORE_CUSTOMERS,
} from "../graphql/queries";
import { CustomerDetailForm } from "./CustomerDetailForm";
import { CustomerFormDialog } from "./CustomerForm";

const EMPTY = <span className="text-color-secondary">—</span>;
const textOrEmpty = (field) => (row) => row[field] || EMPTY;

const COLUMNS = [
  {
    field: "fullName",
    header: "Cliente",
    sortable: true,
    filter: true,
    body: (row) => (
      <span className="font-medium text-900">{row.fullName || row.name}</span>
    ),
  },
  {
    field: "phone",
    header: "Teléfono",
    sortable: true,
    filter: true,
    body: textOrEmpty("phone"),
  },
  {
    field: "ci",
    header: "Carné",
    sortable: true,
    filter: true,
    body: textOrEmpty("ci"),
  },
  {
    field: "email",
    header: "Correo",
    sortable: true,
    filter: true,
    body: textOrEmpty("email"),
  },
  {
    field: "office.name",
    header: "Tienda",
    body: (row) => row.office?.name || row.business?.name || EMPTY,
  },
];

export function CustomerTable() {
  const toast = useRef(null);
  const [getCustomers, { loading, data, error }] = useLazyQuery(GET_CUSTOMERS, {
    fetchPolicy: "network-only",
  });
  const [deleteCustomers] = useMutation(DELETE_CUSTOMERS);
  const [restoreCustomers] = useMutation(RESTORE_CUSTOMERS);
  // { mode: "create" | "edit" | "detail", customer }
  const [dialog, setDialog] = useState(null);
  const lastParams = useRef(null);

  const handleFetchData = useCallback(
    async (params) => {
      lastParams.current = params;
      try {
        const { data: response } = await getCustomers({
          variables: {
            options: {
              skip: params.skip,
              take: params.take,
              withDeleted: params.showDeleted,
              filters: params.filters,
              sorts: params.sorts,
            },
          },
        });
        return {
          data: response?.customers?.data,
          totalCount: response?.customers?.totalCount,
        };
      } catch {
        return { data: [], totalCount: 0 };
      }
    },
    [getCustomers],
  );

  const handleRefresh = useCallback(() => {
    if (lastParams.current) handleFetchData(lastParams.current);
  }, [handleFetchData]);

  const notify = (severity, summary, detail) =>
    toast.current?.show({ severity, summary, detail, life: 4000 });

  const handleSaved = (saved) => {
    const created = dialog?.mode === "create";
    setDialog(null);
    handleRefresh();
    notify(
      "success",
      created ? "Cliente creado" : "Cliente actualizado",
      saved.fullName,
    );
  };

  const handleDelete = (customer) =>
    confirmDialog({
      header: "Eliminar cliente",
      message: `Se dará de baja a ${customer.fullName || customer.name}. Sus ventas se conservan y puedes restaurarlo después.`,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Eliminar",
      rejectLabel: "Cancelar",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await deleteCustomers({ variables: { ids: [customer.id] } });
          notify("success", "Cliente eliminado", customer.fullName);
          handleRefresh();
        } catch (err) {
          notify("error", "No se pudo eliminar", getErrorMessage(err));
        }
      },
    });

  const handleRestore = async (customer) => {
    try {
      await restoreCustomers({ variables: { ids: [customer.id] } });
      notify("success", "Cliente restaurado", customer.fullName);
      handleRefresh();
    } catch (err) {
      notify("error", "No se pudo restaurar", getErrorMessage(err));
    }
  };

  const actionBodyTemplate = (row) =>
    row.deletedAt ? (
      <div className="actions-column">
        <Button
          icon="pi pi-history"
          text
          rounded
          severity="success"
          tooltip="Restaurar cliente"
          tooltipOptions={{ position: "top" }}
          aria-label="Restaurar cliente"
          onClick={() => handleRestore(row)}
        />
      </div>
    ) : (
      <div className="actions-column">
        <Button
          icon="pi pi-eye"
          text
          rounded
          severity="secondary"
          tooltip="Ver ficha y compras"
          tooltipOptions={{ position: "top" }}
          aria-label="Ver ficha y compras"
          onClick={() => setDialog({ mode: "detail", customer: row })}
        />
        <Button
          icon="pi pi-pencil"
          text
          rounded
          tooltip="Editar cliente"
          tooltipOptions={{ position: "top" }}
          aria-label="Editar cliente"
          onClick={() => setDialog({ mode: "edit", customer: row })}
        />
        <Button
          icon="pi pi-trash"
          text
          rounded
          severity="danger"
          tooltip="Eliminar cliente"
          tooltipOptions={{ position: "top" }}
          aria-label="Eliminar cliente"
          onClick={() => handleDelete(row)}
        />
      </div>
    );

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <GenericDataTable
        columns={COLUMNS}
        data={data?.customers?.data}
        totalRecords={data?.customers?.totalCount}
        loading={loading}
        error={error}
        globalFilterFields={["fullName", "ci", "phone", "email"]}
        emptyMessage="No se encontraron clientes"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} clientes"
        onRefresh={handleRefresh}
        onFetchData={handleFetchData}
        initialPageSize={10}
        header={
          <Button
            label="Nuevo cliente"
            icon="pi pi-plus"
            onClick={() => setDialog({ mode: "create" })}
          />
        }
        showDeleted={true}
      >
        <Column
          body={actionBodyTemplate}
          header="Acciones"
          className="w-10rem"
        />
      </GenericDataTable>

      {(dialog?.mode === "create" || dialog?.mode === "edit") && (
        <CustomerFormDialog
          customer={dialog.customer}
          onHide={() => setDialog(null)}
          onSaved={handleSaved}
        />
      )}
      {dialog?.mode === "detail" && (
        <CustomerDetailForm
          customerId={dialog.customer.id}
          onHide={() => setDialog(null)}
          onEdit={() => setDialog({ mode: "edit", customer: dialog.customer })}
        />
      )}
    </>
  );
}

export default CustomerTable;
