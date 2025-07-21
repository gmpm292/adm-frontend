import React, { useCallback, useState, useRef } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { GET_INVENTORIES, DELETE_INVENTORIES } from "../graphql/queries";
import GenericDataTable from "../../../../components/BaseTable/index";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { InventoryEditForm } from "./InventoryEditForm";
import { InventoryCreateForm } from "./InventoryCreateForm";
import { InventoryDetailForm } from "./InventoryDetailForm";
import { formatDate } from "../../../../utils/dateUtils";
import { InventoryMovementCreateForm } from "../../inventory-movement/components/InventoryMovementCreateForm";

export function InventoryTable() {
  const [getInventories, { loading, data, error }] = useLazyQuery(
    GET_INVENTORIES,
    {
      fetchPolicy: "network-only",
    }
  );
  const [deleteInventories] = useMutation(DELETE_INVENTORIES);
  const [selectedInventoryId, setSelectedInventoryId] = useState(null);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [detailDialogVisible, setDetailDialogVisible] = useState(false);
  const [movementDialogVisible, setMovementDialogVisible] = useState(false);
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

        const { data: responseData } = await getInventories({
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
          data: responseData?.inventories?.data,
          totalCount: responseData?.inventories?.totalCount,
        };
      } catch (err) {
        console.error("Error fetching inventories:", err);
        return {
          data: [],
          totalCount: 0,
        };
      }
    },
    [getInventories]
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

  const handleMovementSuccess = useCallback(() => {
    handleRefresh();
  }, [handleRefresh]);

  const handleEdit = (inventoryId) => {
    setSelectedInventoryId(inventoryId);
    setEditDialogVisible(true);
  };

  const handleViewDetails = (inventoryId) => {
    setSelectedInventoryId(inventoryId);
    setDetailDialogVisible(true);
  };

  const handleCreateMovement = (inventoryId) => {
    setSelectedInventoryId(inventoryId);
    setMovementDialogVisible(true);
  };

  const handleDelete = (inventoryId) => {
    confirmDialog({
      message: "¿Estás seguro de que deseas eliminar este inventario?",
      header: "Confirmación",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          await deleteInventories({ variables: { ids: [inventoryId] } });

          toast.current.show({
            severity: "success",
            summary: "Éxito",
            detail: "Inventario eliminado correctamente",
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

  const productBodyTemplate = (rowData) => {
    return rowData.product?.name || "N/A";
  };

  const entityBodyTemplate = (rowData, field) => {
    return rowData[field]?.name || "N/A";
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="actions-column">
        <Button
          icon="pi pi-truck"
          className="p-button-rounded p-button-text p-button-help"
          tooltip="Registrar movimiento"
          tooltipOptions={{ position: "top" }}
          onClick={() => handleCreateMovement(rowData.id)}
        />
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text"
          tooltip="Editar inventario"
          tooltipOptions={{ position: "top" }}
          onClick={() => handleEdit(rowData.id)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-text p-button-danger"
          tooltip="Eliminar inventario"
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
      field: "id",
      header: "ID",
      sortable: true,
      filter: true,
      visible: false,
    },
    {
      field: "product.name",
      header: "Producto",
      body: productBodyTemplate,
      sortable: true,
      filter: true,
    },
    {
      field: "currentStock",
      header: "Stock Actual",
      sortable: true,
      filter: true,
    },
    {
      visible: false,
      field: "minStock",
      header: "Stock Mínimo",
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
      field: "location",
      header: "Ubicación",
      sortable: true,
      filter: true,
    },
    {
      field: "createdAt",
      header: "Fecha de Creación",
      body: (rowData) => dateBodyTemplate(rowData, "createdAt"),
      sortable: true,
      visible: false,
    },
  ];

  const addInventoryButton = (
    <Button
      icon="pi pi-plus"
      tooltip="Crear Nuevo Inventario"
      onClick={() => setCreateDialogVisible(true)}
    />
  );

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <GenericDataTable
        columns={columns}
        data={data?.inventories?.data}
        totalRecords={data?.inventories?.totalCount}
        loading={loading}
        error={error}
        globalFilterFields={["product.name", "location"]}
        emptyMessage="No se encontraron inventarios"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} inventarios"
        onRefresh={handleRefresh}
        onFetchData={handleFetchData}
        initialPageSize={10}
        header={addInventoryButton}
      >
        <Column
          body={actionBodyTemplate}
          header="Acciones"
          headerStyle={{ width: "12rem" }}
          bodyStyle={{ textAlign: "center" }}
        />
      </GenericDataTable>

      <InventoryEditForm
        inventoryId={selectedInventoryId}
        visible={editDialogVisible}
        onHide={() => setEditDialogVisible(false)}
        onSuccess={handleEditSuccess}
      />

      <InventoryCreateForm
        visible={createDialogVisible}
        onHide={() => setCreateDialogVisible(false)}
        onSuccess={handleCreateSuccess}
      />

      <InventoryDetailForm
        inventoryId={selectedInventoryId}
        visible={detailDialogVisible}
        onHide={() => setDetailDialogVisible(false)}
      />

      <InventoryMovementCreateForm
        visible={movementDialogVisible}
        onHide={() => setMovementDialogVisible(false)}
        onSuccess={handleMovementSuccess}
        inventoryId={selectedInventoryId}
      />
    </>
  );
}

export default InventoryTable;
