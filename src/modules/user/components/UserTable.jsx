import React, { useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { GET_USERS } from "../graphql/queries";
import GenericDataTable from "../../../components/BaseTable/index";
import { Column } from "primereact/column";
import { Button } from "primereact/button";

const statusBodyTemplate = (rowData) => {
  return (
    <span className={`badge status-${rowData.enabled ? "active" : "inactive"}`}>
      {rowData.enabled ? "Activo" : "Inactivo"}
    </span>
  );
};

const actionBodyTemplate = (rowData) => {
  return (
    <div className="actions">
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-text"
        tooltip="Editar usuario"
        tooltipOptions={{ position: "top" }}
      />
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-text p-button-danger"
        tooltip="Eliminar usuario"
        tooltipOptions={{ position: "top" }}
        disabled={!rowData.enabled}
      />
    </div>
  );
};

export function UserTable() {
  const [getUsers, { loading, data, error }] = useLazyQuery(GET_USERS, {
    fetchPolicy: "network-only",
  });

  // Ejecutar la query cuando el componente se monta
  useEffect(() => {
    getUsers({
      variables: {
        options: {
          skip: 0,
          take: 10,
        }
      }
    });
  }, [getUsers]);

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
      filter: false,
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
    },
  ];

  return (
    <GenericDataTable
      columns={columns}
      data={data?.users?.data}
      totalRecords={data?.users?.totalCount}
      loading={loading}
      error={error}
      // Eliminar headerTooltips de las props
      globalFilterFields={["name", "lastName", "email", "role"]}
      emptyMessage="No se encontraron usuarios"
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios"
      onRefresh={() => getUsers({
        variables: {
          options: {
            skip: 0,
            take: 10,
          }
        }
      })}
    >
      <Column
        body={actionBodyTemplate}
        header="Acciones"
        headerStyle={{ width: "8rem" }}
        bodyStyle={{ textAlign: "center" }}
      />
    </GenericDataTable>
  );
}

export default UserTable;