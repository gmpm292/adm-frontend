import React, { useCallback, useState } from "react";
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
  const [initialLoad, setInitialLoad] = useState(true);

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
    <GenericDataTable
      columns={columns}
      data={data?.users?.data}
      totalRecords={data?.users?.totalCount}
      loading={loading}
      error={error}
      globalFilterFields={["name", "lastName", "email", "role"]}
      emptyMessage="No se encontraron usuarios"
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios"
      onRefresh={() =>
        handleFetchData({ skip: 0, take: 10, filters: [], sorts: [] })
      }
      onFetchData={handleFetchData}
      initialPageSize={10}
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
