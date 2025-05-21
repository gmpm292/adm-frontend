import React, { useCallback, useState, useRef } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { Dropdown } from "primereact/dropdown";

import { OfficeCreateForm } from "./OfficeCreateForm";
import { OfficeEditForm } from "./OfficeEditForm";

import GenericDataTable from "../../../../components/BaseTable";
import { DELETE_OFFICES, GET_OFFICES } from "../graphql/queries";

const officeTypes = [
  { label: "Oficina", value: "OFFICE" },
  { label: "Sucursal", value: "BRANCH" },
];

export function OfficeTable() {
  const [getOffices, { loading, data, error }] = useLazyQuery(GET_OFFICES, {
    fetchPolicy: "network-only",
  });
  const [deleteOffices] = useMutation(DELETE_OFFICES);
  const [selectedOfficeId, setSelectedOfficeId] = useState(null);
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

        const { data: responseData } = await getOffices({
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
          data: responseData?.offices?.data,
          totalCount: responseData?.offices?.totalCount,
        };
      } catch (err) {
        console.error("Error fetching offices:", err);
        return {
          data: [],
          totalCount: 0,
        };
      }
    },
    [getOffices]
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

  const handleEdit = (officeId) => {
    setSelectedOfficeId(officeId);
    setEditDialogVisible(true);
  };

  const handleDelete = (officeId) => {
    confirmDialog({
      message: "¿Estás seguro de que deseas eliminar esta oficina?",
      header: "Confirmación",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          await deleteOffices({ variables: { ids: [officeId] } });

          toast.current.show({
            severity: "success",
            summary: "Éxito",
            detail: "Oficina eliminada correctamente",
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

  const officeTypeBodyTemplate = (rowData) => {
    const type = officeTypes.find((t) => t.value === rowData.officeType);
    return type ? type.label : rowData.officeType;
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="actions-column">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text"
          tooltip="Editar oficina"
          tooltipOptions={{ position: "top" }}
          onClick={() => handleEdit(rowData.id)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-text p-button-danger"
          tooltip="Eliminar oficina"
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
      field: "officeType",
      header: "Tipo",
      body: officeTypeBodyTemplate,
      sortable: true,
      filter: true,
    },
    {
      field: "business.name",
      header: "Empresa",
      sortable: true,
      filter: true,
    },
    {
      field: "address",
      header: "Dirección",
      sortable: true,
      filter: true,
    },
  ];

  const addButton = (
    <Button
      icon="pi pi-plus"
      tooltip="Crear nueva oficina"
      onClick={() => setCreateDialogVisible(true)}
    />
  );

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <GenericDataTable
        columns={columns}
        data={data?.offices?.data}
        totalRecords={data?.offices?.totalCount}
        loading={loading}
        error={error}
        globalFilterFields={["name", "business.name", "address"]}
        emptyMessage="No se encontraron oficinas"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} oficinas"
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

      <OfficeEditForm
        officeId={selectedOfficeId}
        visible={editDialogVisible}
        onHide={() => setEditDialogVisible(false)}
        onSuccess={handleEditSuccess}
      />

      <OfficeCreateForm
        visible={createDialogVisible}
        onHide={() => setCreateDialogVisible(false)}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
}

export default OfficeTable;
