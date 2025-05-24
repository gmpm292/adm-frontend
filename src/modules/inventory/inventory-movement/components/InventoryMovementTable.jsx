import React, { useCallback, useState, useRef } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { GET_INVENTORY_MOVEMENTS, DELETE_INVENTORY_MOVEMENTS } from "../graphql/queries";
import GenericDataTable from "../../../../components/BaseTable/index";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { InventoryMovementEditForm } from "./InventoryMovementEditForm";
import { InventoryMovementCreateForm } from "./InventoryMovementCreateForm";
import { InventoryMovementDetailForm } from "./InventoryMovementDetailForm";
import { formatDate } from "../../../../utils/dateUtils";
import { Tag } from "primereact/tag";

export function InventoryMovementTable() {
  const [getMovements, { loading, data, error }] = useLazyQuery(GET_INVENTORY_MOVEMENTS, {
    fetchPolicy: "network-only",
  });
  const [deleteMovements] = useMutation(DELETE_INVENTORY_MOVEMENTS);
  const [selectedMovementId, setSelectedMovementId] = useState(null);
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

        const { data: responseData } = await getMovements({
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
          data: responseData?.inventoryMovements?.data,
          totalCount: responseData?.inventoryMovements?.totalCount,
        };
      } catch (err) {
        console.error("Error fetching inventory movements:", err);
        return {
          data: [],
          totalCount: 0,
        };
      }
    },
    [getMovements]
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

  const handleEdit = (movementId) => {
    setSelectedMovementId(movementId);
    setEditDialogVisible(true);
  };

  const handleViewDetails = (movementId) => {
    setSelectedMovementId(movementId);
    setDetailDialogVisible(true);
  };

  const handleDelete = (movementId) => {
    confirmDialog({
      message: "¿Estás seguro de que deseas eliminar este movimiento?",
      header: "Confirmación",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          await deleteMovements({ variables: { ids: [movementId] } });

          toast.current.show({
            severity: "success",
            summary: "Éxito",
            detail: "Movimiento eliminado correctamente",
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

  const typeBodyTemplate = (rowData) => {
    return (
      <Tag 
        value={rowData.type === 'IN' ? 'ENTRADA' : 'SALIDA'} 
        severity={rowData.type === 'IN' ? 'success' : 'danger'} 
      />
    );
  };

  const productBodyTemplate = (rowData) => {
    return rowData.inventory?.product?.name || "N/A";
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="actions-column">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-text"
          tooltip="Editar movimiento"
          tooltipOptions={{ position: "top" }}
          onClick={() => handleEdit(rowData.id)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-text p-button-danger"
          tooltip="Eliminar movimiento"
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
      field: "inventory.product.name",
      header: "Producto",
      body: productBodyTemplate,
      sortable: true,
      filter: true,
    },
    {
      field: "type",
      header: "Tipo",
      body: typeBodyTemplate,
      sortable: true,
      filter: true,
    },
    {
      field: "quantity",
      header: "Cantidad",
      sortable: true,
      filter: true,
    },
    {
      field: "reason",
      header: "Motivo",
      sortable: true,
      filter: true,
    },
    {
      field: "timestamp",
      header: "Fecha",
      body: (rowData) => dateBodyTemplate(rowData, "timestamp"),
      sortable: true,
    },
    {
      field: "user.name",
      header: "Usuario",
      sortable: true,
      filter: true,
    },
  ];

  const addMovementButton = (
    <Button
      icon="pi pi-plus"
      tooltip="Crear Nuevo Movimiento"
      onClick={() => setCreateDialogVisible(true)}
    />
  );

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <GenericDataTable
        columns={columns}
        data={data?.inventoryMovements?.data}
        totalRecords={data?.inventoryMovements?.totalCount}
        loading={loading}
        error={error}
        globalFilterFields={["inventory.product.name", "reason", "user.name"]}
        emptyMessage="No se encontraron movimientos"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} movimientos"
        onRefresh={handleRefresh}
        onFetchData={handleFetchData}
        initialPageSize={10}
        header={addMovementButton}
      >
        <Column
          body={actionBodyTemplate}
          header="Acciones"
          headerStyle={{ width: "10rem" }}
          bodyStyle={{ textAlign: "center" }}
        />
      </GenericDataTable>

      <InventoryMovementEditForm
        movementId={selectedMovementId}
        visible={editDialogVisible}
        onHide={() => setEditDialogVisible(false)}
        onSuccess={handleEditSuccess}
      />

      <InventoryMovementCreateForm
        visible={createDialogVisible}
        onHide={() => setCreateDialogVisible(false)}
        onSuccess={handleCreateSuccess}
      />

      <InventoryMovementDetailForm
        movementId={selectedMovementId}
        visible={detailDialogVisible}
        onHide={() => setDetailDialogVisible(false)}
      />
    </>
  );
}

export default InventoryMovementTable;