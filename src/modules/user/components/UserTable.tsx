import React, { useCallback, useState, useRef } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { GET_USERS, DELETE_USERS, RESTORE_USERS } from "../graphql/queries";
import {
  REQUEST_PASSWORD_CHANGE_FOR_ANOTHER_USER,
  ENABLE_2FA,
  DISABLE_2FA,
  RESET_2FA_SETTINGS,
} from "../../auth/graphql/queries";
import { Calendar } from "primereact/calendar";
import { Menu } from "primereact/menu";
import { Tag } from "primereact/tag";

import GenericDataTable from "../../../components/BaseTable/index";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { UserFormDialog } from "./UserForm";
import { useAuthContext } from "../../auth/components/AuthContext";
import { getErrorMessage } from "../../../utils/errors";
import { SYSTEM_USER_EMAIL, roleLabel, userPlace } from "../roles";
import { UserDetailForm } from "./UserDetailForm";
import { UserChangePasswordForm } from "./UserChangePasswordForm";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import {
  PrimeReactSortMeta,
  PrimeReactFilters,
} from "../../../components/BaseTable/types";

const statusBodyTemplate = (rowData) => {
  return (
    <Tag
      severity={rowData.enabled ? "success" : "danger"}
      value={rowData.enabled ? "Activo" : "Inactivo"}
    />
  );
};

const twoFactorBodyTemplate = (rowData) => {
  if (!rowData.isTwoFactorEnabled) {
    return <Tag severity="info" value="No" />;
  }

  return rowData.isTwoFactorConfigured ? (
    <Tag severity="success" value="Activa" />
  ) : (
    <Tag severity="warning" value="Pendiente de configurar" />
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
      value={options.value ? new Date(options.value) : null}
      onChange={(e) => {
        // Si el valor es null (se limpió el filtro), pasamos null
        if (!e.value) {
          options.filterCallback(null, options.index);
          return;
        }

        // Crear una fecha sin hora para comparación consistente
        const date = new Date(e.value);
        date.setHours(0, 0, 0, 0);

        // Pasar la fecha como string ISO o como Date según lo que espere tu backend
        options.filterCallback(date.toISOString(), options.index);
      }}
      dateFormat="dd/mm/yy"
      placeholder="dd/mm/aaaa"
      showIcon
      icon="pi pi-calendar"
      showButtonBar
      showClear
      className="p-column-filter"
    />
  );
};

export function UserTable() {
  const { user: currentUser } = useAuthContext();
  const [getUsers, { loading, data, error }] = useLazyQuery(GET_USERS, {
    fetchPolicy: "network-only",
  });
  const [deleteUsers] = useMutation(DELETE_USERS);
  const [restoreUsers] = useMutation(RESTORE_USERS);
  const [requestPasswordChangeForAnorherUser] = useMutation(
    REQUEST_PASSWORD_CHANGE_FOR_ANOTHER_USER,
  );
  const [enableTwoFactor] = useMutation(ENABLE_2FA);
  const [disableTwoFactor] = useMutation(DISABLE_2FA);
  const [resetTwoFactor] = useMutation(RESET_2FA_SETTINGS);
  const twoFactorMenu = useRef(null);
  const passwordMenu = useRef(null);
  const [passwordUser, setPasswordUser] = useState(null);
  const [twoFactorUser, setTwoFactorUser] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  // null, "create" o "edit"
  const [formMode, setFormMode] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const toast = useRef(null);
  const [detailDialogVisible, setDetailDialogVisible] = useState(false);
  const [changePasswordDialogVisible, setChangePasswordDialogVisible] =
    useState(false);
  const [selectedUserEmail, setSelectedUserEmail] = useState("");

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
    [getUsers],
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

  const handleSaved = (saved) => {
    setFormMode(null);
    handleRefresh();
    toast.current.show({
      severity: "success",
      summary: saved.created ? "Usuario creado" : "Usuario actualizado",
      detail: saved.created
        ? `${saved.email} recibirá un correo para crear su contraseña.`
        : saved.email,
      life: 5000,
    });
  };

  const handleEdit = (userId) => {
    setSelectedUserId(userId);
    setFormMode("edit");
  };

  const handleViewDetails = (userId) => {
    setSelectedUserId(userId);
    setDetailDialogVisible(true);
  };

  const handleDelete = (userId) => {
    confirmDialog({
      message:
        "El usuario dejará de poder entrar y su sesión se cerrará. Puedes restaurarlo después.",
      header: "Eliminar usuario",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Eliminar",
      rejectLabel: "Cancelar",
      acceptClassName: "p-button-danger",
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
            detail: getErrorMessage(err),
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
            detail: getErrorMessage(err),
            life: 3000,
          });
        }
      },
    });
  };

  const handleRequestPasswordChange = (email) => {
    confirmDialog({
      message: `Se enviará a ${email} un enlace para que cree una contraseña nueva.`,
      header: "Enviar enlace de contraseña",
      acceptLabel: "Enviar",
      rejectLabel: "Cancelar",
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
            detail: getErrorMessage(err),
            life: 5000,
          });
        }
      },
    });
  };

  const confirmTwoFactorAction = ({ message, successDetail, mutate, userId }) => {
    confirmDialog({
      message,
      header: "Confirmación",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          await mutate({ variables: { id: userId } });

          toast.current.show({
            severity: "success",
            summary: "Éxito",
            detail: successDetail,
            life: 3000,
          });

          handleRefresh();
        } catch (err) {
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: getErrorMessage(err),
            life: 3000,
          });
        }
      },
    });
  };

  // Las dos formas de darle una contraseña nueva a un usuario
  const passwordMenuItems = passwordUser
    ? [
        {
          label: "Enviar enlace por correo",
          icon: "pi pi-send",
          command: () => handleRequestPasswordChange(passwordUser.email),
        },
        {
          label: "Asignar una contraseña",
          icon: "pi pi-lock",
          command: () => handleDirectPasswordChange(passwordUser.email),
        },
      ]
    : [];

  // Opciones del menú de verificación en dos pasos según el estado del usuario
  const getTwoFactorMenuItems = (user) => {
    if (!user) return [];

    const items = [];

    if (!user.isTwoFactorEnabled) {
      items.push({
        label: "Exigir verificación en dos pasos",
        icon: "pi pi-lock",
        command: () =>
          confirmTwoFactorAction({
            message: `¿Estás seguro de que deseas exigir la verificación en dos pasos a ${user.email}?`,
            successDetail: "Verificación en dos pasos exigida correctamente",
            mutate: enableTwoFactor,
            userId: user.id,
          }),
      });
    } else {
      items.push({
        label: "Dejar de exigirla",
        icon: "pi pi-lock-open",
        command: () =>
          confirmTwoFactorAction({
            message: `¿Estás seguro de que deseas dejar de exigir la verificación en dos pasos a ${user.email}?`,
            successDetail: "La verificación en dos pasos ya no se exige",
            mutate: disableTwoFactor,
            userId: user.id,
          }),
      });

      if (user.isTwoFactorConfigured) {
        items.push({
          label: "Restablecer dispositivo",
          icon: "pi pi-mobile",
          command: () =>
            confirmTwoFactorAction({
              message: `¿Estás seguro de que deseas restablecer el dispositivo de verificación de ${user.email}? Tendrá que configurarlo de nuevo.`,
              successDetail: "Dispositivo de verificación restablecido correctamente",
              mutate: resetTwoFactor,
              userId: user.id,
            }),
        });
      }
    }

    return items;
  };

  const handleTwoFactorMenu = (event, user) => {
    setTwoFactorUser(user);
    twoFactorMenu.current.toggle(event);
  };

  const actionBodyTemplate = (rowData) => {
    if (rowData.deletedAt) {
      return (
        <div className="actions-column">
          <Button
            icon="pi pi-history"
            text
            rounded
            severity="success"
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
          text
          rounded
          severity="secondary"
          tooltip="Editar usuario"
          tooltipOptions={{ position: "top" }}
          onClick={() => handleEdit(rowData.id)}
        />
        {rowData.id !== currentUser?.id && (
          <Button
            icon="pi pi-trash"
            text
            rounded
            severity="danger"
            tooltip="Eliminar usuario"
            tooltipOptions={{ position: "top" }}
            onClick={() => handleDelete(rowData.id)}
          />
        )}
        <Button
          icon="pi pi-eye"
          text
          rounded
          severity="info"
          tooltip="Ver detalles"
          tooltipOptions={{ position: "top" }}
          onClick={() => handleViewDetails(rowData.id)}
        />
        <Button
          icon="pi pi-key"
          text
          rounded
          severity="warning"
          tooltip="Contraseña"
          tooltipOptions={{ position: "top" }}
          aria-haspopup
          onClick={(event) => {
            setPasswordUser(rowData);
            passwordMenu.current.toggle(event);
          }}
        />
        {rowData.email !== SYSTEM_USER_EMAIL && (
          <Button
            icon="pi pi-shield"
            text
            rounded
            severity="secondary"
            tooltip="Verificación en dos pasos"
            tooltipOptions={{ position: "top" }}
            aria-haspopup
            onClick={(event) => handleTwoFactorMenu(event, rowData)}
          />
        )}
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
      header: "Apellidos",
      sortable: true,
      filter: true,
    },
    {
      field: "email",
      header: "Correo",
      sortable: true,
      filter: true,
    },
    {
      field: "role",
      header: "Rol",
      sortable: true,
      filter: true,
      body: (rowData) => roleLabel(rowData.role?.[0]),
    },
    {
      field: "office.id",
      header: "Ubicación",
      body: (rowData) =>
        userPlace(rowData) ?? (
          <span className="text-color-secondary">—</span>
        ),
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
      field: "isTwoFactorEnabled",
      header: "2FA",
      sortable: false,
      visible: false,
      body: twoFactorBodyTemplate,
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
      label="Nuevo usuario"
      icon="pi pi-plus"
      onClick={() => setFormMode("create")}
    />
  );

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />
      <Menu model={passwordMenuItems} popup ref={passwordMenu} />
      <Menu
        model={getTwoFactorMenuItems(twoFactorUser)}
        popup
        ref={twoFactorMenu}
      />

      <GenericDataTable
        columns={columns}
        data={data?.users?.data}
        totalRecords={data?.users?.totalCount}
        loading={loading}
        error={error}
        globalFilter={globalFilter}
        globalFilterFields={["fullName", "email", "mobile"]}
        emptyMessage="No se encontraron usuarios"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios"
        onRefresh={handleRefresh}
        onFetchData={handleFetchData}
        initialPageSize={10}
        initialSorts={defaultSorts}
        header={addUserButton}
        showDeleted={true}
      >
        <Column
          body={actionBodyTemplate}
          header="Acciones"
          headerClassName="w-14rem"
        />
      </GenericDataTable>

      {formMode && (
        <UserFormDialog
          userId={formMode === "edit" ? selectedUserId : null}
          currentUserId={currentUser?.id}
          onHide={() => setFormMode(null)}
          onSaved={handleSaved}
        />
      )}

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
