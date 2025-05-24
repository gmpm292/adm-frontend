import React, { useCallback, useState, useRef } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { GET_CATEGORIES, DELETE_CATEGORIES } from "../graphql/queries";
import GenericDataTable from "../../../../components/BaseTable/index";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { CategoryEditForm } from "./CategoryEditForm";
import { CategoryCreateForm } from "./CategoryCreateForm";
import { CategoryDetailForm } from "./CategoryDetailForm";
import { formatDate } from "../../../../utils/dateUtils";

export function CategoryTable() {
  const [getCategories, { loading, data, error }] = useLazyQuery(
    GET_CATEGORIES,
    {
      fetchPolicy: "network-only",
    }
  );
  const [deleteCategories] = useMutation(DELETE_CATEGORIES);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
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

        const { data: responseData } = await getCategories({
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
          data: responseData?.categories?.data,
          totalCount: responseData?.categories?.totalCount,
        };
      } catch (err) {
        console.error("Error fetching categories:", err);
        return {
          data: [],
          totalCount: 0,
        };
      }
    },
    [getCategories]
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

  const handleEdit = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setEditDialogVisible(true);
  };

  const handleViewDetails = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setDetailDialogVisible(true);
  };

  const handleDelete = (categoryId) => {
    confirmDialog({
      message: "¿Estás seguro de que deseas eliminar esta categoría?",
      header: "Confirmación",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          await deleteCategories({ variables: { ids: [categoryId] } });

          toast.current.show({
            severity: "success",
            summary: "Éxito",
            detail: "Categoría eliminada correctamente",
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

  const dateBodyTemplate = (rowData, field) => {
    return formatDate(rowData[field]);
  };

  const entityBodyTemplate = (rowData, field) => {
    return rowData[field]?.name || "N/A";
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="actions-column">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text"
          tooltip="Editar categoría"
          tooltipOptions={{ position: "top" }}
          onClick={() => handleEdit(rowData.id)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-text p-button-danger"
          tooltip="Eliminar categoría"
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
      field: "description",
      header: "Descripción",
      sortable: true,
      filter: true,
    },
    {
      field: "business",
      header: "Negocio",
      body: (rowData) => entityBodyTemplate(rowData, "business"),
      sortable: true,
      filter: true,
    },
    {
      field: "office",
      header: "Oficina",
      body: (rowData) => entityBodyTemplate(rowData, "office"),
      sortable: true,
      filter: true,
    },
    {
      field: "department",
      header: "Departamento",
      body: (rowData) => entityBodyTemplate(rowData, "department"),
      sortable: true,
      filter: true,
    },
    {
      field: "team",
      header: "Equipo",
      body: (rowData) => entityBodyTemplate(rowData, "team"),
      sortable: true,
      filter: true,
    },
    {
      field: "createdAt",
      header: "Fecha de Creación",
      body: (rowData) => dateBodyTemplate(rowData, "createdAt"),
      sortable: true,
    },
  ];

  const addCategoryButton = (
    <Button
      icon="pi pi-plus"
      tooltip="Crear Nueva Categoría"
      onClick={() => setCreateDialogVisible(true)}
    />
  );

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <GenericDataTable
        columns={columns}
        data={data?.categories?.data}
        totalRecords={data?.categories?.totalCount}
        loading={loading}
        error={error}
        globalFilterFields={["name", "description"]}
        emptyMessage="No se encontraron categorías"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} categorías"
        onRefresh={handleRefresh}
        onFetchData={handleFetchData}
        initialPageSize={10}
        header={addCategoryButton}
      >
        <Column
          body={actionBodyTemplate}
          header="Acciones"
          headerStyle={{ width: "10rem" }}
          bodyStyle={{ textAlign: "center" }}
        />
      </GenericDataTable>

      <CategoryEditForm
        categoryId={selectedCategoryId}
        visible={editDialogVisible}
        onHide={() => setEditDialogVisible(false)}
        onSuccess={handleEditSuccess}
      />

      <CategoryCreateForm
        visible={createDialogVisible}
        onHide={() => setCreateDialogVisible(false)}
        onSuccess={handleCreateSuccess}
      />

      <CategoryDetailForm
        categoryId={selectedCategoryId}
        visible={detailDialogVisible}
        onHide={() => setDetailDialogVisible(false)}
      />
    </>
  );
}

export default CategoryTable;