import React, { useCallback, useState, useRef } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import {
  GET_UNITS_OF_MEASURE,
  TOGGLE_UNIT_ACTIVE,
  REMOVE_UNITS_OF_MEASURE,
  RESTORE_UNITS_OF_MEASURE,
} from "../graphql/queries";
import GenericDataTable from "../../../../components/BaseTable/index";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { UnitOfMeasureEditForm } from "./UnitOfMeasureEditForm";
import { UnitOfMeasureCreateForm } from "./UnitOfMeasureCreateForm";
import { UnitOfMeasureDetailForm } from "./UnitOfMeasureDetailForm";
import { Tag } from "primereact/tag";

// Mapeo de categorías a colores y etiquetas
const categoryMap = {
  peso: { label: "Peso", color: "info" },
  volumen: { label: "Volumen", color: "success" },
  longitud: { label: "Longitud", color: "warning" },
  área: { label: "Área", color: "help" },
  unidades: { label: "Unidades", color: "primary" },
  tiempo: { label: "Tiempo", color: "danger" },
  energía: { label: "Energía", color: "secondary" },
  potencia: { label: "Potencia", color: "contrast" },
  temperatura: { label: "Temperatura", color: "info" },
};

const statusBodyTemplate = (rowData) => {
  return (
    <span
      className={`badge status-${rowData.isActive ? "active" : "inactive"}`}
    >
      {rowData.isActive ? "Activo" : "Inactivo"}
    </span>
  );
};

const categoryBodyTemplate = (rowData) => {
  if (!rowData.category) return null;

  const category = categoryMap[rowData.category] || {
    label: rowData.category,
    color: "info",
  };
  return <Tag value={category.label} severity={category.color} rounded />;
};

export const UnitOfMeasureTable = () => {
  const [getUnits, { loading, data, error }] = useLazyQuery(
    GET_UNITS_OF_MEASURE,
    {
      fetchPolicy: "network-only",
    },
  );
  const [toggleActive] = useMutation(TOGGLE_UNIT_ACTIVE);
  const [removeUnits] = useMutation(REMOVE_UNITS_OF_MEASURE);
  const [restoreUnits] = useMutation(RESTORE_UNITS_OF_MEASURE);

  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [detailDialogVisible, setDetailDialogVisible] = useState(false);
  const [selectedUnits, setSelectedUnits] = useState([]);

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

        const { data: responseData } = await getUnits({
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
          data: responseData?.unitOfMeasures?.data,
          totalCount: responseData?.unitOfMeasures?.totalCount,
        };
      } catch (err) {
        console.error("Error fetching units of measure:", err);
        return {
          data: [],
          totalCount: 0,
        };
      }
    },
    [getUnits],
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

  const handleEdit = (unitId) => {
    setSelectedUnitId(unitId);
    setEditDialogVisible(true);
  };

  const handleViewDetails = (unitId) => {
    setSelectedUnitId(unitId);
    setDetailDialogVisible(true);
  };

  const handleToggleStatus = (unitId, isActive) => {
    confirmDialog({
      message: `¿Estás seguro de que deseas ${isActive ? "desactivar" : "activar"} esta unidad?`,
      header: "Confirmación",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          await toggleActive({ variables: { id: unitId } });

          toast.current.show({
            severity: "success",
            summary: "Éxito",
            detail: `Unidad ${isActive ? "desactivada" : "activada"} correctamente`,
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

  const handleDeleteSelected = () => {
    if (selectedUnits.length === 0) return;

    confirmDialog({
      message: `¿Estás seguro de que deseas eliminar ${selectedUnits.length} unidad(es)?`,
      header: "Confirmación",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          const ids = selectedUnits.map((u) => u.id);
          await removeUnits({ variables: { ids } });

          toast.current.show({
            severity: "success",
            summary: "Éxito",
            detail: `${selectedUnits.length} unidad(es) eliminada(s) correctamente`,
            life: 3000,
          });

          setSelectedUnits([]);
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

  const handleRestoreSelected = () => {
    if (selectedUnits.length === 0) return;

    confirmDialog({
      message: `¿Estás seguro de que deseas restaurar ${selectedUnits.length} unidad(es)?`,
      header: "Confirmación",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          const ids = selectedUnits.map((u) => u.id);
          const result = await restoreUnits({ variables: { ids } });

          toast.current.show({
            severity: "success",
            summary: "Éxito",
            detail: `${result.data?.restoreUnitsOfMeasure || ids.length} unidad(es) restaurada(s) correctamente`,
            life: 3000,
          });

          setSelectedUnits([]);
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
          tooltip="Editar unidad"
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

  // Definir las columnas como un array de objetos
  const columns = [
    {
      field: "name",
      header: "Nombre",
      sortable: true,
      filter: true,
    },
    {
      field: "symbol",
      header: "Símbolo",
      sortable: true,
      filter: true,
    },
    {
      field: "category",
      header: "Categoría",
      body: categoryBodyTemplate,
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

  const renderHeader = () => {
    return (
      <div className="flex justify-content-between align-items-center">
        <div className="flex gap-2">
          <Button
            icon="pi pi-plus"
            label="Nueva Unidad"
            onClick={() => setCreateDialogVisible(true)}
          />
          {selectedUnits.length > 0 && (
            <>
              <Button
                icon="pi pi-trash"
                label="Eliminar seleccionadas"
                className="p-button-danger"
                onClick={handleDeleteSelected}
              />
              <Button
                icon="pi pi-replay"
                label="Restaurar seleccionadas"
                className="p-button-success"
                onClick={handleRestoreSelected}
              />
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <GenericDataTable
        columns={columns} // Pasamos las columnas como prop
        data={data?.unitOfMeasures?.data}
        totalRecords={data?.unitOfMeasures?.totalCount}
        loading={loading}
        error={error}
        globalFilterFields={["name", "symbol", "category"]}
        emptyMessage="No se encontraron unidades de medida"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} unidades"
        onRefresh={handleRefresh}
        onFetchData={handleFetchData}
        initialPageSize={10}
        selection={selectedUnits}
        onSelectionChange={(e) => setSelectedUnits(e.value)}
        header={renderHeader()}
      >
        <Column
          body={actionBodyTemplate}
          header="Acciones"
          headerStyle={{ width: "10rem" }}
          bodyStyle={{ textAlign: "center" }}
        />
      </GenericDataTable>

      <UnitOfMeasureEditForm
        unitId={selectedUnitId}
        visible={editDialogVisible}
        onHide={() => setEditDialogVisible(false)}
        onSuccess={handleEditSuccess}
      />

      <UnitOfMeasureCreateForm
        visible={createDialogVisible}
        onHide={() => setCreateDialogVisible(false)}
        onSuccess={handleCreateSuccess}
      />

      <UnitOfMeasureDetailForm
        unitId={selectedUnitId}
        visible={detailDialogVisible}
        onHide={() => setDetailDialogVisible(false)}
      />
    </>
  );
};

export default UnitOfMeasureTable;
