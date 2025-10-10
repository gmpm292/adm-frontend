import React, { useCallback, useState, useRef } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import {
  GET_WORKERS,
  REMOVE_WORKERS,
  RESTORE_WORKERS,
} from "../graphql/queries";
import GenericDataTable from "../../../../components/BaseTable/index";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { WorkerEditForm } from "./WorkerEditForm";
import { WorkerCreateForm } from "./WorkerCreateForm";
import { WorkerDetailForm } from "./WorkerDetailForm";

const statusBodyTemplate = (rowData) => {
  return (
    <span
      className={`badge status-${rowData?.user?.enabled ? "active" : "inactive"}`}
    >
      {rowData.user?.enabled ? "Activo" : "Inactivo"}
    </span>
  );
};

const userBodyTemplate = (rowData) => {
  return `${rowData.user?.name} ${rowData.user?.lastName}`;
};

export function WorkerTable() {
  const [getWorkers, { loading, data, error }] = useLazyQuery(GET_WORKERS, {
    fetchPolicy: "network-only",
  });
  const [removeWorkers] = useMutation(REMOVE_WORKERS);
  const [restoreWorkers] = useMutation(RESTORE_WORKERS);
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
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

        const { data: responseData } = await getWorkers({
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
          data: responseData?.workers?.data,
          totalCount: responseData?.workers?.totalCount,
        };
      } catch (err) {
        console.error("Error fetching workers:", err);
        return {
          data: [],
          totalCount: 0,
        };
      }
    },
    [getWorkers]
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

  const handleEdit = (workerId) => {
    setSelectedWorkerId(workerId);
    setEditDialogVisible(true);
  };

  const handleViewDetails = (workerId) => {
    setSelectedWorkerId(workerId);
    setDetailDialogVisible(true);
  };

  const handleToggleStatus = (workerId, isActive) => {
    confirmDialog({
      message: `¿Estás seguro de que deseas ${
        isActive ? "desactivar" : "activar"
      } este trabajador?`,
      header: "Confirmación",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          const mutation = isActive ? removeWorkers : restoreWorkers;
          await mutation({ variables: { ids: [workerId] } });

          toast.current.show({
            severity: "success",
            summary: "Éxito",
            detail: `Trabajador ${
              isActive ? "desactivado" : "activado"
            } correctamente`,
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
          tooltip="Editar trabajador"
          tooltipOptions={{ position: "top" }}
          onClick={() => handleEdit(rowData.id)}
        />
        {/* <Button
          icon={rowData.isActive ? "pi pi-ban" : "pi pi-check"}
          className={`p-button-rounded p-button-text ${
            rowData.isActive ? "p-button-warning" : "p-button-success"
          }`}
          tooltip={rowData.isActive ? "Desactivar" : "Activar"}
          tooltipOptions={{ position: "top" }}
          onClick={() => handleToggleStatus(rowData.id, rowData.isActive)}
        /> */}
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
      field: "user.name",
      header: "Nombre",
      body: userBodyTemplate,
      sortable: true,
      filter: true,
    },
    {
      field: "workerType",
      header: "Tipo",
      sortable: true,
      filter: true,
    },
    {
      field: "baseSalary",
      header: "Salario Base",
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
      field: "isActive",
      header: "Estado",
      body: statusBodyTemplate,
      sortable: true,
      filter: true,
    },
  ];

  const addButton = (
    <Button
      icon="pi pi-plus"
      tooltip="Crear Nuevo Trabajador"
      onClick={() => setCreateDialogVisible(true)}
    />
  );

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <GenericDataTable
        columns={columns}
        data={data?.workers?.data}
        totalRecords={data?.workers?.totalCount}
        loading={loading}
        error={error}
        globalFilterFields={["user.name", "workerType"]}
        emptyMessage="No se encontraron trabajadores"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} trabajadores"
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

      <WorkerEditForm
        workerId={selectedWorkerId}
        visible={editDialogVisible}
        onHide={() => setEditDialogVisible(false)}
        onSuccess={handleEditSuccess}
      />

      <WorkerCreateForm
        visible={createDialogVisible}
        onHide={() => setCreateDialogVisible(false)}
        onSuccess={handleCreateSuccess}
      />

      <WorkerDetailForm
        workerId={selectedWorkerId}
        visible={detailDialogVisible}
        onHide={() => setDetailDialogVisible(false)}
      />
    </>
  );
}
