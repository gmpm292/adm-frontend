import React, { useCallback, useState, useRef } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import {
  GET_MATERIAL_COSTS,
  TOGGLE_MATERIAL_COST_ACTIVE,
  REMOVE_MATERIAL_COSTS,
  RESTORE_MATERIAL_COSTS,
} from "../graphql/queries";
import GenericDataTable from "../../../../components/BaseTable/index";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";

import { Tag } from "primereact/tag";
import { MaterialCostCreateForm } from "./MaterialCostCreateForm";
import { MaterialCostDetailForm } from "./MaterialCostDetailForm";
import { MaterialCostEditForm } from "./MaterialCostEditForm";

const statusBodyTemplate = (rowData) => {
  return (
    <span
      className={`badge status-${rowData.isActive ? "active" : "inactive"}`}
    >
      {rowData.isActive ? "Activo" : "Inactivo"}
    </span>
  );
};

const priceBodyTemplate = (rowData) => {
  return (
    <span className="font-mono">
      {rowData.currency?.symbol || rowData.currency?.code}{" "}
      {rowData.costPrice?.toLocaleString("es-ES", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </span>
  );
};

const unitBodyTemplate = (rowData) => {
  return (
    <span>
      {rowData.unitOfMeasure?.name} ({rowData.unitOfMeasure?.symbol})
    </span>
  );
};

export const MaterialCostTable = () => {
  const [getMaterials, { loading, data, error }] = useLazyQuery(
    GET_MATERIAL_COSTS,
    {
      fetchPolicy: "network-only",
    },
  );
  const [toggleActive] = useMutation(TOGGLE_MATERIAL_COST_ACTIVE);
  const [removeMaterials] = useMutation(REMOVE_MATERIAL_COSTS);
  const [restoreMaterials] = useMutation(RESTORE_MATERIAL_COSTS);

  const [selectedMaterialId, setSelectedMaterialId] = useState(null);
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

        const { data: responseData } = await getMaterials({
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
          data: responseData?.materialCosts?.data,
          totalCount: responseData?.materialCosts?.totalCount,
        };
      } catch (err) {
        console.error("Error fetching material costs:", err);
        return {
          data: [],
          totalCount: 0,
        };
      }
    },
    [getMaterials],
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

  const handleEdit = (materialId) => {
    setSelectedMaterialId(materialId);
    setEditDialogVisible(true);
  };

  const handleViewDetails = (materialId) => {
    setSelectedMaterialId(materialId);
    setDetailDialogVisible(true);
  };

  const handleToggleStatus = (materialId, isActive) => {
    confirmDialog({
      message: `¿Estás seguro de que deseas ${isActive ? "desactivar" : "activar"} este material?`,
      header: "Confirmación",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          await toggleActive({ variables: { id: materialId } });

          toast.current.show({
            severity: "success",
            summary: "Éxito",
            detail: `Material ${isActive ? "desactivado" : "activado"} correctamente`,
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
          tooltip="Editar material"
          tooltipOptions={{ position: "top" }}
          onClick={() => handleEdit(rowData.id)}
        />
        <Button
          icon={rowData.isActive ? "pi pi-ban" : "pi pi-check"}
          className={`p-button-rounded p-button-text ${rowData.isActive ? "p-button-warning" : "p-button-success"}`}
          tooltip={rowData.isActive ? "Desactivar" : "Activar"}
          tooltipOptions={{ position: "top" }}
          onClick={() => handleToggleStatus(rowData.id, rowData.isActive)}
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
      field: "unitOfMeasure",
      header: "Unidad de Medida",
      body: unitBodyTemplate,
      sortable: true,
      filter: true,
      filterField: "unitOfMeasure.name",
    },
    {
      field: "costPrice",
      header: "Precio de Costo",
      body: priceBodyTemplate,
      sortable: true,
      filter: true,
      filterPlaceholder: "Precio",
    },
    {
      field: "isActive",
      header: "Estado",
      body: statusBodyTemplate,
      sortable: true,
      filter: true,
    },
  ];

  const renderHeader = () => {
    return (
      <div className="flex justify-content-between align-items-center">
        <Button
          icon="pi pi-plus"
          label="Nuevo Material"
          onClick={() => setCreateDialogVisible(true)}
        />
      </div>
    );
  };

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <GenericDataTable
        columns={columns}
        data={data?.materialCosts?.data}
        totalRecords={data?.materialCosts?.totalCount}
        loading={loading}
        error={error}
        globalFilterFields={["name", "unitOfMeasure.name", "costPrice"]}
        emptyMessage="No se encontraron materiales"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} materiales"
        onRefresh={handleRefresh}
        onFetchData={handleFetchData}
        initialPageSize={10}
        header={renderHeader()}
      >
        <Column
          body={actionBodyTemplate}
          header="Acciones"
          headerStyle={{ width: "10rem" }}
          bodyStyle={{ textAlign: "center" }}
        />
      </GenericDataTable>

      <MaterialCostEditForm
        materialId={selectedMaterialId}
        visible={editDialogVisible}
        onHide={() => setEditDialogVisible(false)}
        onSuccess={handleEditSuccess}
      />

      <MaterialCostCreateForm
        visible={createDialogVisible}
        onHide={() => setCreateDialogVisible(false)}
        onSuccess={handleCreateSuccess}
      />

      <MaterialCostDetailForm
        materialId={selectedMaterialId}
        visible={detailDialogVisible}
        onHide={() => setDetailDialogVisible(false)}
      />
    </>
  );
};

export default MaterialCostTable;
