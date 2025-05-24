import React, { useCallback, useState, useRef } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { GET_CUSTOMERS, DELETE_CUSTOMERS } from "../graphql/queries";
import GenericDataTable from "../../../../components/BaseTable/index";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { CustomerEditForm } from "./CustomerEditForm";
import { CustomerCreateForm } from "./CustomerCreateForm";
import { CustomerDetailForm } from "./CustomerDetailForm";

export function CustomerTable() {
  const [getCustomers, { loading, data, error }] = useLazyQuery(GET_CUSTOMERS, {
    fetchPolicy: "network-only",
  });
  const [deleteCustomers] = useMutation(DELETE_CUSTOMERS);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [detailDialogVisible, setDetailDialogVisible] = useState(false);
  const toast = useRef(null);
  const tableStateRef = useRef({
    filters: {},
    sorts: [],
    pagination: { first: 0, rows: 10 },
  });

  const handleFetchData = useCallback(
    async (params) => {
      try {
        tableStateRef.current = {
          filters: params.filters || {},
          sorts: params.sorts || [],
          pagination: {
            first: params.skip,
            rows: params.take,
          },
        };

        const { data: responseData } = await getCustomers({
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
          data: responseData?.customers?.data,
          totalCount: responseData?.customers?.totalCount,
        };
      } catch (err) {
        console.error("Error fetching customers:", err);
        return {
          data: [],
          totalCount: 0,
        };
      }
    },
    [getCustomers]
  );

  const handleRefresh = useCallback(() => {
    handleFetchData({
      skip: tableStateRef.current.pagination.first,
      take: tableStateRef.current.pagination.rows,
      filters: tableStateRef.current.filters,
      sorts: tableStateRef.current.sorts,
    });
  }, [handleFetchData]);

  const handleEditSuccess = useCallback(() => {
    handleRefresh();
  }, [handleRefresh]);

  const handleCreateSuccess = useCallback(() => {
    handleRefresh();
  }, [handleRefresh]);

  const handleEdit = (customerId) => {
    setSelectedCustomerId(customerId);
    setEditDialogVisible(true);
  };

  const handleViewDetails = (customerId) => {
    setSelectedCustomerId(customerId);
    setDetailDialogVisible(true);
  };

  const handleDelete = (customerId) => {
    confirmDialog({
      message: "¿Estás seguro de que deseas eliminar este cliente?",
      header: "Confirmación",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          await deleteCustomers({ variables: { ids: [customerId] } });

          toast.current.show({
            severity: "success",
            summary: "Éxito",
            detail: "Cliente eliminado correctamente",
            life: 3000,
          });

          handleRefresh();
        } catch (err) {
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: err.message,
            life: 3000,
          });
        }
      },
    });
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="actions-column">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text"
          tooltip="Editar cliente"
          tooltipOptions={{ position: "top" }}
          onClick={() => handleEdit(rowData.id)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-text p-button-danger"
          tooltip="Eliminar cliente"
          tooltipOptions={{ position: "top" }}
          onClick={() => handleDelete(rowData.id)}
        />
        <Button
          icon="pi pi-eye"
          className="p-button-rounded p-button-text p-button-info"
          tooltip="Ver detalles"
          tooltipOptions={{ position: "top" }}
          onClick={() => handleViewDetails(rowData.id)}
        />
      </div>
    );
  };

  const columns = [
    {
      field: "name",
      header: "Nombre",
      sortable: true,
      filter: true,
    },
    {
      field: "email",
      header: "Email",
      sortable: true,
      filter: true,
    },
    {
      field: "phone",
      header: "Teléfono",
      sortable: true,
      filter: true,
    },
    {
      field: "business.name",
      header: "Business",
      sortable: true,
      filter: true,
    },
    {
      field: "loyaltyPoints",
      header: "Puntos",
      sortable: true,
      filter: true,
    },
  ];

  const addCustomerButton = (
    <Button
      icon="pi pi-plus"
      tooltip="Crear nuevo cliente"
      onClick={() => setCreateDialogVisible(true)}
    />
  );

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <GenericDataTable
        columns={columns}
        data={data?.customers?.data}
        totalRecords={data?.customers?.totalCount}
        loading={loading}
        error={error}
        globalFilterFields={["name", "email", "phone"]}
        emptyMessage="No se encontraron clientes"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} clientes"
        onRefresh={handleRefresh}
        onFetchData={handleFetchData}
        initialPageSize={10}
        header={addCustomerButton}
      >
        <Column
          body={actionBodyTemplate}
          header="Acciones"
          headerStyle={{ width: "10rem" }}
          bodyStyle={{ textAlign: "center" }}
        />
      </GenericDataTable>

      <CustomerEditForm
        customerId={selectedCustomerId}
        visible={editDialogVisible}
        onHide={() => setEditDialogVisible(false)}
        onSuccess={handleEditSuccess}
      />

      <CustomerCreateForm
        visible={createDialogVisible}
        onHide={() => setCreateDialogVisible(false)}
        onSuccess={handleCreateSuccess}
      />

      <CustomerDetailForm
        customerId={selectedCustomerId}
        visible={detailDialogVisible}
        onHide={() => setDetailDialogVisible(false)}
      />
    </>
  );
}

export default CustomerTable;