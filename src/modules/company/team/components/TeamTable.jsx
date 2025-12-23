import React, { useCallback, useState, useRef } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { Dropdown } from "primereact/dropdown";

import { TeamCreateForm } from "./TeamCreateForm";
import { TeamEditForm } from "./TeamEditForm";
import { DELETE_TEAMS, GET_TEAMS } from "../graphql/queries";
import GenericDataTable from "../../../../components/BaseTable";

const teamTypes = [
  { label: "Operaciones", value: "OPERATIONS" },
  { label: "Nuevos Negocios", value: "NEW_BUSINESS" },
  { label: "Renovaciones", value: "RENOVATIONS" },
];

export function TeamTable() {
  const [getTeams, { loading, data, error }] = useLazyQuery(GET_TEAMS, {
    fetchPolicy: "network-only",
  });
  const [deleteTeams] = useMutation(DELETE_TEAMS);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
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

        const { data: responseData } = await getTeams({
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
          data: responseData?.teams?.data,
          totalCount: responseData?.teams?.totalCount,
        };
      } catch (err) {
        console.error("Error fetching teams:", err);
        return {
          data: [],
          totalCount: 0,
        };
      }
    },
    [getTeams]
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

  const handleEdit = (teamId) => {
    setSelectedTeamId(teamId);
    setEditDialogVisible(true);
  };

  const handleDelete = (teamId) => {
    confirmDialog({
      message: "¿Estás seguro de que deseas eliminar este equipo?",
      header: "Confirmación",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          await deleteTeams({ variables: { ids: [teamId] } });

          toast.current.show({
            severity: "success",
            summary: "Éxito",
            detail: "Equipo eliminado correctamente",
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

  const teamTypeBodyTemplate = (rowData) => {
    const type = teamTypes.find((t) => t.value === rowData.teamType);
    return type ? type.label : rowData.teamType;
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="actions-column">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text"
          tooltip="Editar equipo"
          tooltipOptions={{ position: "top" }}
          onClick={() => handleEdit(rowData.id)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-text p-button-danger"
          tooltip="Eliminar equipo"
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
      field: "description",
      header: "Descripción",
      sortable: true,
      filter: true,
    },
    {
      field: "teamType",
      header: "Tipo",
      body: teamTypeBodyTemplate,
      sortable: true,
      filter: true,
    },
    {
      field: "department.name",
      header: "Departamento",
      sortable: true,
      filter: true,
    },
    {
      field: "office.name",
      header: "Oficina",
      sortable: true,
      filter: true,
    },
    {
      field: "business.name",
      header: "Negocio",
      sortable: true,
      filter: true,
      visible: false,
    },
  ];

  const addButton = (
    <Button
      icon="pi pi-plus"
      tooltip="Crear nuevo equipo"
      onClick={() => setCreateDialogVisible(true)}
    />
  );

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <GenericDataTable
        columns={columns}
        data={data?.teams?.data}
        totalRecords={data?.teams?.totalCount}
        loading={loading}
        error={error}
        globalFilterFields={["name", "department.name"]}
        emptyMessage="No se encontraron equipos"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} equipos"
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

      <TeamEditForm
        teamId={selectedTeamId}
        visible={editDialogVisible}
        onHide={() => setEditDialogVisible(false)}
        onSuccess={handleEditSuccess}
      />

      <TeamCreateForm
        visible={createDialogVisible}
        onHide={() => setCreateDialogVisible(false)}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
}

export default TeamTable;
