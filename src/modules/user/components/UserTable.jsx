import React, { useCallback, useState, useRef } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { GET_USERS, DELETE_USERS } from "../graphql/queries";
import GenericDataTable from "../../../components/BaseTable/index";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { UserEditForm } from "./UserEditForm";

const statusBodyTemplate = (rowData) => {
  return (
    <span className={`badge status-${rowData.enabled ? "active" : "inactive"}`}>
      {rowData.enabled ? "Activo" : "Inactivo"}
    </span>
  );
};

export function UserTable() {
  const [getUsers, { loading, data, error }] = useLazyQuery(GET_USERS, {
    fetchPolicy: "network-only",
  });
  const [deleteUsers] = useMutation(DELETE_USERS);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const toast = useRef(null);
  const tableStateRef = useRef({
    filters: {},
    sorts: [],
    pagination: { first: 0, rows: 10 },
  });

  const handleFetchData = useCallback(
    async (params) => {
      try {
        // Guardar el estado actual
        tableStateRef.current = {
          filters: params.filters || {},
          sorts: params.sorts || [],
          pagination: {
            first: params.skip,
            rows: params.take,
          },
        };

        const { data: responseData } = await getUsers({
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
          data: responseData?.users?.data,
          totalCount: responseData?.users?.totalCount,
        };
      } catch (err) {
        console.error("Error fetching users:", err);
        return {
          data: [],
          totalCount: 0,
        };
      }
    },
    [getUsers]
  );

  const handleRefresh = useCallback(() => {
    // Recargar con el estado actual guardado
    handleFetchData({
      skip: tableStateRef.current.pagination.first,
      take: tableStateRef.current.pagination.rows,
      filters: tableStateRef.current.filters,
      sorts: tableStateRef.current.sorts,
    });
  }, [handleFetchData]);

  const handleEditSuccess = useCallback(() => {
    // Recargar después de editar con el estado actual
    handleRefresh();
  }, [handleRefresh]);

  const handleEdit = (userId) => {
    setSelectedUserId(userId);
    setEditDialogVisible(true);
  };

  const handleDelete = (userId) => {
    confirmDialog({
      message: "¿Estás seguro de que deseas eliminar este usuario?",
      header: "Confirmación",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          await deleteUsers({ variables: { ids: [userId] } });

          toast.current.show({
            severity: "success",
            summary: "Éxito",
            detail: "Usuario eliminado correctamente",
            life: 3000,
          });

          // Recargar manteniendo el estado actual
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
      <div className="actions">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text"
          tooltip="Editar usuario"
          tooltipOptions={{ position: "top" }}
          onClick={() => handleEdit(rowData.id)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-text p-button-danger"
          tooltip="Eliminar usuario"
          tooltipOptions={{ position: "top" }}
          onClick={() => handleDelete(rowData.id)}
          disabled={!rowData.enabled}
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
      field: "lastName",
      header: "Apellido",
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
      field: "role",
      header: "Rol",
      sortable: true,
      filter: true,
    },
    {
      field: "enabled",
      header: "Estado",
      body: statusBodyTemplate,
      sortable: true,
      filter: true,
    },
  ];

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <GenericDataTable
        columns={columns}
        data={data?.users?.data}
        totalRecords={data?.users?.totalCount}
        loading={loading}
        error={error}
        globalFilterFields={["name", "lastName", "email", "role"]}
        emptyMessage="No se encontraron usuarios"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios"
        onRefresh={handleRefresh}
        onFetchData={handleFetchData}
        initialPageSize={10}
      >
        <Column
          body={actionBodyTemplate}
          header="Acciones"
          headerStyle={{ width: "10rem" }}
          bodyStyle={{ textAlign: "center" }}
        />
      </GenericDataTable>

      <UserEditForm
        userId={selectedUserId}
        visible={editDialogVisible}
        onHide={() => setEditDialogVisible(false)}
        onSuccess={handleEditSuccess}
      />
    </>
  );
}

export default UserTable;
