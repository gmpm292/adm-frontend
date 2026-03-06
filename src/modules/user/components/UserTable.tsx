import React, { useCallback, useState, useRef } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { GET_USERS, DELETE_USERS, RESTORE_USERS } from "../graphql/queries";
import { REQUEST_PASSWORD_CHANGE_FOR_ANOTHER_USER } from "../../auth/graphql/queries";
import { Calendar } from "primereact/calendar";

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
import { UserChangePasswordForm } from "./UserChangePasswordForm";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import {
  PrimeReactSortMeta,
  PrimeReactFilters,
} from "../../../components/BaseTable/types";

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
      onChange={(e) => options.filterCallback(e.value, options.index)}
      optionLabel="label"
      placeholder="Seleccione estado"
      className="p-column-filter"
      showClear
    />
  );
};

const dateBodyTemplate = (rowData, field) => {
  if (!rowData[field]) return "-";

  const date = new Date(rowData[field]);
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const dateFilterTemplate = (options) => {
  return (
    <Calendar
      value={options.value}
      onChange={(e) =>
        options.filterCallback(e.value.toISOString(), options.index)
      }
      dateFormat="dd/mm/yy"
      placeholder="dd/mm/aaaa"
      showIcon
      icon="pi pi-calendar"
      showButtonBar
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
  const [requestPasswordChangeForAnorherUser] = useMutation(
    REQUEST_PASSWORD_CHANGE_FOR_ANOTHER_USER
  );
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const toast = useRef(null);
  const [detailDialogVisible, setDetailDialogVisible] = useState(false);
  const [changePasswordDialogVisible, setChangePasswordDialogVisible] =
    useState(false);
  const [selectedUserEmail, setSelectedUserEmail] = useState("");

  // Ejemplo para pasar filtros iniciales o por defecto.
  // const defaultFilters: PrimeReactFilters = {
  //   name: {
  //     operator: FilterOperator.AND,
  //     constraints: [
  //       {
  //         value: "carlos",
  //         matchMode: FilterMatchMode.CONTAINS,
  //       },
  //     ],
  //   },
  // };
  const defaultFilters: PrimeReactFilters = {
    enabled: {
      operator: FilterOperator.AND,
      constraints: [
        {
          value: "true",
          matchMode: FilterMatchMode.EQUALS,
        },
      ],
    },
  };

  // Ejemplo para pasar ordenamientos iniciales o por defecto. Pasar a la lista base(initialSorts={defaultSorts})
  const defaultSorts: PrimeReactSortMeta[] = [
    { field: "createdAt", order: -1 },
  ];

  const tableStateRef = useRef({
    filters: {
      /*...defaultFilters*/
    },
    sorts: [...defaultSorts],
    pagination: { first: 0, rows: 10 },
    showDeleted: false,
  });

  const handleDirectPasswordChange = (email) => {
    setSelectedUserEmail(email);
    setChangePasswordDialogVisible(true);
  };

  const handleFetchData = useCallback(
    async (params) => {
      try {
        console.log("params", params);
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

  const handleRequestPasswordChange = (email) => {
    confirmDialog({
      message: `¿Estás seguro de que deseas solicitar un cambio de contraseña para ${email}?`,
      header: "Confirmación",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          await requestPasswordChangeForAnorherUser({
            variables: {
              input: {
                email: email,
              },
            },
          });

          toast.current.show({
            severity: "success",
            summary: "Éxito",
            detail:
              "Solicitud de cambio de contraseña enviada correctamente. El usuario recibirá un correo con las instrucciones.",
            life: 5000,
          });
        } catch (err) {
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: `No se pudo enviar la solicitud de cambio de contraseña: ${err.message}`,
            life: 5000,
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
        <Button
          icon="pi pi-envelope"
          className="p-button-rounded p-button-text p-button-help"
          tooltip="Solicitar cambio de contraseña (envía correo)"
          tooltipOptions={{ position: "top" }}
          onClick={() => handleRequestPasswordChange(rowData.email)}
        />
        <Button
          icon="pi pi-key"
          className="p-button-rounded p-button-text p-button-warning"
          tooltip="Cambiar contraseña directamente"
          tooltipOptions={{ position: "top" }}
          onClick={() => handleDirectPasswordChange(rowData.email)}
        />
      </div>
    );
  };

  const columns = [
    {
      field: "id",
      header: "Id",
      sortable: true,
      filter: true,
      visible: false,
      filterMatchModeOptions: [
        { label: "Igual a", value: FilterMatchMode.EQUALS },
        { label: "Diferente a", value: FilterMatchMode.NOT_EQUALS },
      ],
    },
    {
      field: "name",
      header: "Nombres",
      sortable: true,
      filter: true,
    },
    {
      field: "lastName",
      header: "Apellidos",
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
      sortable: true,
      filter: true,
      body: statusBodyTemplate,
      filterElement: statusFilterTemplate,
      filterMatchModeOptions: [FilterMatchMode.EQUALS],
    },
    {
      field: "createdAt",
      header: "Fecha de creación",
      sortable: true,
      filter: true,
      visible: false,
      body: (rowData) => dateBodyTemplate(rowData, "createdAt"),
      filterElement: dateFilterTemplate,
      dataType: "date",
    },
    {
      field: "updatedAt",
      header: "Fecha de actualización",
      sortable: true,
      filter: true,
      visible: false,
      body: (rowData) => dateBodyTemplate(rowData, "updatedAt"),
      filterElement: dateFilterTemplate,
      dataType: "date",
    },
    {
      field: "deletedAt",
      header: "Fecha de eliminación",
      sortable: true,
      filter: true,
      visible: false,
      body: (rowData) => dateBodyTemplate(rowData, "deletedAt"),
      filterElement: dateFilterTemplate,
      dataType: "date",
    },
  ];

  // Botón de nuevo usuario que se pasará al header
  const addUserButton = (
    <Button
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
        globalFilterFields={["name", "lastName", "email", "fullName"]}
        emptyMessage="No se encontraron usuarios"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios"
        onRefresh={handleRefresh}
        onFetchData={handleFetchData}
        initialPageSize={10}
        initialFilters={defaultFilters}
        initialSorts={defaultSorts}
        header={addUserButton}
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

      <UserChangePasswordForm
        userEmail={selectedUserEmail}
        visible={changePasswordDialogVisible}
        onHide={() => setChangePasswordDialogVisible(false)}
        onSuccess={handleRefresh}
      />
    </>
  );
}

export default UserTable;
