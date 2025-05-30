import React, { useCallback, useState, useRef } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { GET_USERS, DELETE_USERS, RESTORE_USERS } from "../graphql/queries";
import GenericDataTable from "../../../components/BaseTable/index";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { UserEditForm } from "./UserEditForm";
import { UserCreateForm } from "./UserCreateForm";
import { UserDetailForm } from "./UserDetailForm";
import { FilterMatchMode } from "primereact/api";

const statusBodyTemplate = (rowData) => {
  return (
    <span className={`badge status-${rowData.enabled ? "active" : "inactive"}`}>
      {rowData.enabled ? "Activo" : "Inactivo"}
    </span>
  );
};
const statusOptions = [
  { label: "Activo", value: true },
  { label: "Inactivo", value: false },
];
const statusFilterTemplate = (options) => {
  return (
    <Dropdown
      value={options.value}
      options={statusOptions}
      onChange={(e) => options.filterCallback(e.value)}
      optionLabel="label"
      placeholder="Seleccione estado"
      className="p-column-filter"
      showClear
    />
  );
};

export function UserTable() {
  const [getUsers, { loading, data, error }] = useLazyQuery(GET_USERS, {
    fetchPolicy: "network-only",
  });
  const [deleteUsers] = useMutation(DELETE_USERS);
  const [restoreUsers] = useMutation(RESTORE_USERS);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const toast = useRef(null);
  const [detailDialogVisible, setDetailDialogVisible] = useState(false);

  const tableStateRef = useRef({
    filters: {},
    sorts: [],
    pagination: { first: 0, rows: 10 },
    showDeleted: false,
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
          showDeleted: params.showDeleted,
        };

        const { data: responseData } = await getUsers({
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
    handleFetchData({
      skip: tableStateRef.current.pagination.first,
      take: tableStateRef.current.pagination.rows,
      showDeleted: tableStateRef.current.showDeleted,
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

  const handleEdit = (userId) => {
    setSelectedUserId(userId);
    setEditDialogVisible(true);
  };

  const handleViewDetails = (userId) => {
    setSelectedUserId(userId);
    setDetailDialogVisible(true);
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

  const handleRestore = (userId) => {
    confirmDialog({
      message: "¿Estás seguro de que deseas restaurar este usuario?",
      header: "Confirmación",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          await restoreUsers({ variables: { ids: [userId] } });

          toast.current.show({
            severity: "success",
            summary: "Éxito",
            detail: "Usuario restaurado correctamente",
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
    if (rowData.deletedAt) {
      return (
        <div className="actions-column">
          <Button
            icon="pi pi-history"
            className="p-button-rounded p-button-text p-button-success"
            tooltip="Restaurar usuario"
            tooltipOptions={{ position: "top" }}
            onClick={() => handleRestore(rowData.id)}
          />
        </div>
      );
    }

    return (
      <div className="actions-column">
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
      filterElement: statusFilterTemplate,
      filterMatchMode: FilterMatchMode.EQUALS,
    },
  ];

  // Botón de nuevo usuario que se pasará al header
  const addUserButton = (
    <Button
      //label="Nuevo Usuario"
      icon="pi pi-plus"
      tooltip="Crear Usuario Nuevo"
      onClick={() => setCreateDialogVisible(true)}
    />
  );

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
        globalFilter={globalFilter}
        globalFilterFields={["name", "email"]}
        emptyMessage="No se encontraron usuarios"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios"
        onRefresh={handleRefresh}
        onFetchData={handleFetchData}
        initialPageSize={10}
        header={addUserButton} // Pasamos el botón como header personalizado
        showDeleted={true}
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

      <UserCreateForm
        visible={createDialogVisible}
        onHide={() => setCreateDialogVisible(false)}
        onSuccess={handleCreateSuccess}
      />

      <UserDetailForm
        userId={selectedUserId}
        visible={detailDialogVisible}
        onHide={() => setDetailDialogVisible(false)}
      />
    </>
  );
}

export default UserTable;
