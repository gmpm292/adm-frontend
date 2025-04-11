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
  const [lazyState, setLazyState] = useState({
    first: 0,
    rows: 10,
    page: 0,
  });

  const handleFetchData = useCallback(
    async (params) => {
      try {
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

  const handleEdit = (userId) => {
    setSelectedUserId(userId);
    setEditDialogVisible(true);
  };

  const handleDelete = (userId) => {
    confirmDialog({
      message: '¿Estás seguro de que deseas eliminar este usuario?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await deleteUsers({ variables: { ids: [userId] } });
          
          toast.current.show({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Usuario eliminado correctamente',
            life: 3000
          });

          // Refrescar la tabla
          handleFetchData({ skip: 0, take: 10, filters: [], sorts: [] });
        } catch (err) {
          toast.current.show({
            severity: 'error',
            summary: 'Error',
            detail: err.message,
            life: 3000
          });
        }
      }
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

  const handleEditSuccess = () => {
    // Refrescar la tabla después de editar
    handleFetchData({ 
      skip: lazyState?.first || 0, 
      take: lazyState?.rows || 10, 
      filters: [], 
      sorts: [] 
    });
  };

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
        onRefresh={() => handleFetchData({ skip: 0, take: 10, filters: [], sorts: [] })}
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