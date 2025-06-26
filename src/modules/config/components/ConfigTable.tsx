import React, { useCallback, useState, useRef } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { GET_CONFIGS, REMOVE_CONFIGS } from "../graphql/queries";
import GenericDataTable from "../../../components/BaseTable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { ConfigEditForm } from "./ConfigEditForm";
import { ConfigCreateForm } from "./ConfigCreateForm";
import { ConfigDetailForm } from "./ConfigDetailForm";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import {
  PrimeReactSortMeta,
  PrimeReactFilters,
} from "../../../components/BaseTable/types";
import { Tag } from "primereact/tag";
import { Dropdown } from "primereact/dropdown";

const visibilityOptions = [
  { label: "Público", value: "PUBLIC" },
  { label: "Privado", value: "PRIVATE" },
];

const statusOptions = [
  { label: "Habilitado", value: "ENABLED" },
  { label: "Deshabilitado", value: "DISABLED" },
];

const categoryOptions = [
  { label: "General", value: "GENERAL" },
  { label: "Seguridad", value: "SECURITY" },
  { label: "Frontend", value: "FRONTEND" },
  { label: "Sistema", value: "SYSTEM" },
];

const getVisibilityTag = (visibility: string) => {
  switch (visibility) {
    case "PUBLIC":
      return <Tag severity="success" value="Público" />;
    case "PRIVATE":
      return <Tag severity="info" value="Privado" />;
    default:
      return <Tag severity="warning" value={visibility} />;
  }
};

const getStatusTag = (status: string) => {
  switch (status) {
    case "ENABLED":
      return <Tag severity="success" value="Habilitado" />;
    case "DISABLED":
      return <Tag severity="danger" value="Deshabilitado" />;
    default:
      return <Tag severity="warning" value={status} />;
  }
};

const getCategoryTag = (category: string) => {
  switch (category) {
    case "GENERAL":
      return <Tag severity="info" value="General" />;
    case "SECURITY":
      return <Tag severity="danger" value="Seguridad" />;
    case "FRONTEND":
      return <Tag severity="warning" value="Frontend" />;
    case "SYSTEM":
      return <Tag severity="success" value="Sistema" />;
    default:
      return <Tag severity="warning" value={category} />;
  }
};

export function ConfigTable() {
  const [getConfigs, { loading, data, error }] = useLazyQuery(GET_CONFIGS, {
    fetchPolicy: "network-only",
  });
  const [deleteConfigs] = useMutation(REMOVE_CONFIGS);
  const [selectedConfigId, setSelectedConfigId] = useState(null);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [detailDialogVisible, setDetailDialogVisible] = useState(false);
  const toast = useRef(null);

  // Estado inicial para la tabla
  const defaultFilters: PrimeReactFilters = {};
  const defaultSorts: PrimeReactSortMeta[] = [
    { field: "category", order: 1 },
    { field: "group", order: 1 },
  ];

  // Referencia para mantener el estado de la tabla
  const tableStateRef = useRef({
    filters: { ...defaultFilters },
    sorts: [...defaultSorts],
    pagination: { first: 0, rows: 10 },
    showDeleted: false,
  });

  const handleFetchData = useCallback(
    async (params) => {
      try {
        // Actualizar el estado de la tabla
        tableStateRef.current = {
          filters: params.filters || {},
          sorts: params.sorts || [],
          pagination: {
            first: params.skip,
            rows: params.take,
          },
          showDeleted: params.showDeleted,
        };

        const { data: responseData } = await getConfigs({
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
          data: responseData?.configs?.data,
          totalCount: responseData?.configs?.totalCount,
        };
      } catch (err) {
        console.error("Error fetching configs:", err);
        return {
          data: [],
          totalCount: 0,
        };
      }
    },
    [getConfigs]
  );

  const handleRefresh = useCallback(() => {
    // Usar el estado actual de la tabla al refrescar
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

  const handleEdit = (configId) => {
    setSelectedConfigId(configId);
    setEditDialogVisible(true);
  };

  const handleViewDetails = (configId) => {
    setSelectedConfigId(configId);
    setDetailDialogVisible(true);
  };

  const handleDelete = (configId) => {
    confirmDialog({
      message: "¿Estás seguro de que deseas eliminar esta configuración?",
      header: "Confirmación",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          await deleteConfigs({ variables: { ids: [configId] } });

          toast.current.show({
            severity: "success",
            summary: "Éxito",
            detail: "Configuración eliminada correctamente",
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
          tooltip="Editar configuración"
          tooltipOptions={{ position: "top" }}
          onClick={() => handleEdit(rowData.id)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-text p-button-danger"
          tooltip="Eliminar configuración"
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
      field: "group",
      header: "Grupo",
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
      field: "category",
      header: "Categoría",
      sortable: true,
      filter: true,
      body: (rowData) => getCategoryTag(rowData.category),
      filterElement: (options) => (
        <Dropdown
          value={options.value}
          options={categoryOptions}
          onChange={(e) => options.filterCallback(e.value, options.index)}
          optionLabel="label"
          placeholder="Seleccione categoría"
          className="p-column-filter"
          showClear
        />
      ),
    },
    {
      field: "configVisibility",
      header: "Visibilidad",
      sortable: true,
      filter: true,
      body: (rowData) => getVisibilityTag(rowData.configVisibility),
      filterElement: (options) => (
        <Dropdown
          value={options.value}
          options={visibilityOptions}
          onChange={(e) => options.filterCallback(e.value, options.index)}
          optionLabel="label"
          placeholder="Seleccione visibilidad"
          className="p-column-filter"
          showClear
        />
      ),
    },
    {
      field: "configStatus",
      header: "Estado",
      sortable: true,
      filter: true,
      body: (rowData) => getStatusTag(rowData.configStatus),
      filterElement: (options) => (
        <Dropdown
          value={options.value}
          options={statusOptions}
          onChange={(e) => options.filterCallback(e.value, options.index)}
          optionLabel="label"
          placeholder="Seleccione estado"
          className="p-column-filter"
          showClear
        />
      ),
    },
  ];

  const addConfigButton = (
    <Button
      icon="pi pi-plus"
      tooltip="Crear Nueva Configuración"
      onClick={() => setCreateDialogVisible(true)}
    />
  );

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <GenericDataTable
        columns={columns}
        data={data?.configs?.data}
        totalRecords={data?.configs?.totalCount}
        loading={loading}
        error={error}
        emptyMessage="No se encontraron configuraciones"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} configuraciones"
        onRefresh={handleRefresh}
        onFetchData={handleFetchData}
        initialPageSize={10}
        header={addConfigButton}
        initialSorts={defaultSorts}
        globalFilterFields={["group", "description"]}
      >
        <Column
          body={actionBodyTemplate}
          header="Acciones"
          headerStyle={{ width: "10rem" }}
          bodyStyle={{ textAlign: "center" }}
        />
      </GenericDataTable>

      <ConfigEditForm
        configId={selectedConfigId}
        visible={editDialogVisible}
        onHide={() => setEditDialogVisible(false)}
        onSuccess={handleEditSuccess}
      />

      <ConfigCreateForm
        visible={createDialogVisible}
        onHide={() => setCreateDialogVisible(false)}
        onSuccess={handleCreateSuccess}
      />

      <ConfigDetailForm
        configId={selectedConfigId}
        visible={detailDialogVisible}
        onHide={() => setDetailDialogVisible(false)}
      />
    </>
  );
}
