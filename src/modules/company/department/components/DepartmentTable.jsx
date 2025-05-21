import React, { useCallback, useState, useRef } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { Dropdown } from "primereact/dropdown";

import { DepartmentCreateForm } from "./DepartmentCreateForm";
import { DepartmentEditForm } from "./DepartmentEditForm";
import { DELETE_DEPARTMENTS, GET_DEPARTMENTS } from "../graphql/queries";
import GenericDataTable from "../../../../components/BaseTable";

const departmentTypes = [
  { label: "Económico", value: "ECONOMIC" },
  { label: "Ventas", value: "SALES" },
  { label: "Administración", value: "ADMINISTRATION" }
];

export function DepartmentTable() {
  const [getDepartments, { loading, data, error }] = useLazyQuery(GET_DEPARTMENTS, {
    fetchPolicy: "network-only",
  });
  const [deleteDepartments] = useMutation(DELETE_DEPARTMENTS);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
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

        const { data: responseData } = await getDepartments({
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
          data: responseData?.departments?.data,
          totalCount: responseData?.departments?.totalCount,
        };
      } catch (err) {
        console.error("Error fetching departments:", err);
        return {
          data: [],
          totalCount: 0,
        };
      }
    },
    [getDepartments]
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

  const handleEdit = (departmentId) => {
    setSelectedDepartmentId(departmentId);
    setEditDialogVisible(true);
  };

  const handleDelete = (departmentId) => {
    confirmDialog({
      message: "¿Estás seguro de que deseas eliminar este departamento?",
      header: "Confirmación",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          await deleteDepartments({ variables: { ids: [departmentId] } });

          toast.current.show({
            severity: "success",
            summary: "Éxito",
            detail: "Departamento eliminado correctamente",
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

  const departmentTypeBodyTemplate = (rowData) => {
    const type = departmentTypes.find(t => t.value === rowData.departmentType);
    return type ? type.label : rowData.departmentType;
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="actions-column">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text"
          tooltip="Editar departamento"
          tooltipOptions={{ position: "top" }}
          onClick={() => handleEdit(rowData.id)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-text p-button-danger"
          tooltip="Eliminar departamento"
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
      field: "departmentType",
      header: "Tipo",
      body: departmentTypeBodyTemplate,
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
      field: "address",
      header: "Dirección",
      sortable: true,
      filter: true,
    },
  ];

  const addButton = (
    <Button
      icon="pi pi-plus"
      tooltip="Crear nuevo departamento"
      onClick={() => setCreateDialogVisible(true)}
    />
  );

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <GenericDataTable
        columns={columns}
        data={data?.departments?.data}
        totalRecords={data?.departments?.totalCount}
        loading={loading}
        error={error}
        globalFilterFields={["name", "office.name", "address"]}
        emptyMessage="No se encontraron departamentos"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} departamentos"
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

      <DepartmentEditForm
        departmentId={selectedDepartmentId}
        visible={editDialogVisible}
        onHide={() => setEditDialogVisible(false)}
        onSuccess={handleEditSuccess}
      />

      <DepartmentCreateForm
        visible={createDialogVisible}
        onHide={() => setCreateDialogVisible(false)}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
}

export default DepartmentTable;