import React, { useCallback, useState, useRef } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";

import { BusinessCreateForm } from "./BusinessCreateForm";
import { BusinessEditForm } from "./BusinessEditForm";
import { DELETE_BUSINESSES, GET_BUSINESSES } from "../graphql/queries";
import GenericDataTable from "../../../../components/BaseTable";

export function BusinessTable() {
  const [getBusinesses, { loading, data, error }] = useLazyQuery(
    GET_BUSINESSES,
    {
      fetchPolicy: "network-only",
    }
  );
  const [deleteBusinesses] = useMutation(DELETE_BUSINESSES);
  const [selectedBusinessId, setSelectedBusinessId] = useState(null);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [createDialogVisible, setCreateDialogVisible] = useState(false);
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

        const { data: responseData } = await getBusinesses({
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
          data: responseData?.businesses?.data,
          totalCount: responseData?.businesses?.totalCount,
        };
      } catch (err) {
        console.error("Error fetching businesses:", err);
        return {
          data: [],
          totalCount: 0,
        };
      }
    },
    [getBusinesses]
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

  const handleEdit = (businessId) => {
    setSelectedBusinessId(businessId);
    setEditDialogVisible(true);
  };

  const handleDelete = (businessId) => {
    confirmDialog({
      message: "¿Estás seguro de que deseas eliminar esta empresa?",
      header: "Confirmación",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          await deleteBusinesses({ variables: { ids: [businessId] } });

          toast.current.show({
            severity: "success",
            summary: "Éxito",
            detail: "Empresa eliminada correctamente",
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
          tooltip="Editar empresa"
          tooltipOptions={{ position: "top" }}
          onClick={() => handleEdit(rowData.id)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-text p-button-danger"
          tooltip="Eliminar empresa"
          tooltipOptions={{ position: "top" }}
          onClick={() => handleDelete(rowData.id)}
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
      field: "taxId",
      header: "RUC/NIT",
      sortable: true,
      filter: true,
    },
    {
      field: "contactEmail",
      header: "Email",
      sortable: true,
      filter: true,
    },
    {
      field: "contactPhone",
      header: "Teléfono",
      sortable: true,
      filter: true,
    },
  ];

  const addButton = (
    <Button
      icon="pi pi-plus"
      tooltip="Crear nueva empresa"
      onClick={() => setCreateDialogVisible(true)}
    />
  );

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <GenericDataTable
        columns={columns}
        data={data?.businesses?.data}
        totalRecords={data?.businesses?.totalCount}
        loading={loading}
        error={error}
        globalFilterFields={["name", "taxId", "contactEmail"]}
        emptyMessage="No se encontraron empresas"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} empresas"
        onRefresh={handleRefresh}
        onFetchData={handleFetchData}
        initialPageSize={10}
        header={addButton}
      >
        <Column
          body={actionBodyTemplate}
          header="Acciones"
          headerStyle={{ width: "10rem" }}
          bodyStyle={{ textAlign: "center" }}
        />
      </GenericDataTable>

      <BusinessEditForm
        businessId={selectedBusinessId}
        visible={editDialogVisible}
        onHide={() => setEditDialogVisible(false)}
        onSuccess={handleEditSuccess}
      />

      <BusinessCreateForm
        visible={createDialogVisible}
        onHide={() => setCreateDialogVisible(false)}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
}

export default BusinessTable;
