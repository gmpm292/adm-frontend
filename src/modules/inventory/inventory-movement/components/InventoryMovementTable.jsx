import React, { useCallback, useState, useRef, useMemo } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import {
  GET_INVENTORY_MOVEMENTS,
  DELETE_INVENTORY_MOVEMENTS,
} from "../graphql/queries";
import GenericDataTable from "../../../../components/BaseTable/index";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { InventoryMovementEditForm } from "./InventoryMovementEditForm";
import { InventoryMovementCreateForm } from "./InventoryMovementCreateForm";
import { InventoryMovementDetailForm } from "./InventoryMovementDetailForm";

import { Tag } from "primereact/tag";
import { Badge } from "primereact/badge";

// ==================== BODY TEMPLATES ====================

/**
 * Template para mostrar el ID
 */
const idBodyTemplate = (rowData) => {
  return <Badge value={`#${rowData.id}`} severity="info" />;
};

/**
 * Template para mostrar la categoría del producto
 */
const categoryBodyTemplate = (rowData) => {
  const category = rowData.inventory?.product?.category;
  if (!category) return <span className="text-secondary">—</span>;

  return (
    <div className="flex flex-column">
      <span>{category.name}</span>
      {category.description && (
        <small className="text-secondary">{category.description}</small>
      )}
    </div>
  );
};

/**
 * Template para mostrar el producto completo
 */
const productBodyTemplate = (rowData) => {
  const product = rowData.inventory?.product;
  if (!product) return <span className="text-secondary">—</span>;

  return (
    <div className="flex flex-column">
      <span className="font-bold">{product.name}</span>
      {product.unitOfMeasure && (
        <small className="text-secondary">U/M: {product.unitOfMeasure}</small>
      )}
    </div>
  );
};

/**
 * Template para mostrar el precio de venta
 */
const salePriceBodyTemplate = (rowData) => {
  const product = rowData.inventory?.product;
  if (!product?.basePrice) return <span className="text-secondary">—</span>;

  return (
    <div className="flex flex-column">
      <span className="font-bold">
        {product.basePrice} {product.baseCurrency || "USD"}
      </span>
      {product.costPrice && (
        <small className="text-secondary">
          Costo: {product.costPrice} {product.costCurrency || "USD"}
        </small>
      )}
    </div>
  );
};

/**
 * Template para mostrar la existencia (stock actual y mínimo)
 */
const stockBodyTemplate = (rowData) => {
  const inventory = rowData.inventory;
  if (!inventory) return <span className="text-secondary">—</span>;

  const stockStatus =
    inventory.currentStock <= (inventory.minStock || 0) ? "danger" : "success";

  return (
    <div className="flex flex-column">
      <Tag
        value={`Stock: ${inventory.currentStock}`}
        severity={stockStatus}
        className="mb-1"
      />
      {inventory.minStock > 0 && (
        <small className="text-secondary">Mínimo: {inventory.minStock}</small>
      )}
    </div>
  );
};

/**
 * Template para mostrar la ubicación del inventario
 */
const locationBodyTemplate = (rowData) => {
  const inventory = rowData.inventory;
  if (!inventory?.location) return <span className="text-secondary">—</span>;

  return (
    <div className="flex flex-column">
      <span>{inventory.location}</span>
      {inventory.office && (
        <small className="text-secondary">
          Oficina: {inventory.office.name}
        </small>
      )}
    </div>
  );
};

/**
 * Template para el tipo de movimiento
 */
const typeBodyTemplate = (rowData) => {
  return (
    <Tag
      value={rowData.type === "IN" ? "ENTRADA" : "SALIDA"}
      severity={rowData.type === "IN" ? "success" : "danger"}
      icon={rowData.type === "IN" ? "pi pi-arrow-down" : "pi pi-arrow-up"}
    />
  );
};

/**
 * Template para la cantidad
 */
const quantityBodyTemplate = (rowData) => {
  return (
    <div className="flex flex-column">
      <span className="font-bold">{rowData.quantity}</span>
      {rowData.inventory?.product?.unitOfMeasure && (
        <small className="text-secondary">
          {rowData.inventory.product.unitOfMeasure}
        </small>
      )}
    </div>
  );
};

/**
 * Template para el motivo
 */
const reasonBodyTemplate = (rowData) => {
  return (
    <div className="flex flex-column">
      <span>{rowData.reason || "—"}</span>
      {rowData.isReservation && (
        <Tag
          value="Reserva"
          severity="info"
          className="mt-1"
          style={{ fontSize: "0.7rem" }}
        />
      )}
    </div>
  );
};

/**
 * Template para formatear fechas
 */
const dateBodyTemplate = (rowData, field) => {
  if (!rowData[field]) return "—";
  const date = new Date(rowData[field]);
  return (
    <div className="flex flex-column">
      <span>{date.toLocaleDateString()}</span>
      <small className="text-secondary">{date.toLocaleTimeString()}</small>
    </div>
  );
};

/**
 * Template para el usuario que realizó el movimiento
 */
const userBodyTemplate = (rowData) => {
  const user = rowData.user;
  if (!user) return <span className="text-secondary">—</span>;

  return (
    <div className="flex flex-column">
      <span>{user.name || user.email || `#${user.id}`}</span>
    </div>
  );
};

/**
 * Template para la estructura organizativa
 */
const securityEntitiesBodyTemplate = (rowData) => {
  const entities = [];

  if (rowData.business) entities.push(`🏢 ${rowData.business.name}`);
  if (rowData.office) entities.push(`🏢 ${rowData.office.name}`);
  if (rowData.department) entities.push(`📊 ${rowData.department.name}`);
  if (rowData.team) entities.push(`👥 ${rowData.team.name}`);

  return (
    <div className="flex flex-column">
      {entities.length > 0 ? (
        entities.map((entity, index) => <small key={index}>{entity}</small>)
      ) : (
        <span className="text-secondary">—</span>
      )}
    </div>
  );
};

/**
 * Template para el creador/actualizador
 */
const auditBodyTemplate = (rowData) => {
  const createdBy = rowData.createdBy;
  const updatedBy = rowData.updatedBy;

  return (
    <div className="flex flex-column">
      {createdBy && (
        <small>
          <strong>Creado:</strong>{" "}
          {createdBy.name || createdBy.email || `#${createdBy.id}`}
          <br />
          <span className="text-secondary">
            {new Date(rowData.createdAt).toLocaleDateString()}
          </span>
        </small>
      )}
      {updatedBy && createdBy?.id !== updatedBy?.id && (
        <small>
          <strong>Actualizado:</strong>{" "}
          {updatedBy.name || updatedBy.email || `#${updatedBy.id}`}
          <br />
          <span className="text-secondary">
            {new Date(rowData.updatedAt).toLocaleDateString()}
          </span>
        </small>
      )}
    </div>
  );
};

// ==================== MAIN COMPONENT ====================

export function InventoryMovementTable() {
  const [getMovements, { loading, data, error }] = useLazyQuery(
    GET_INVENTORY_MOVEMENTS,
    {
      fetchPolicy: "network-only",
    },
  );
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

  // Definir todas las columnas disponibles del backend
  const columns = useMemo(
    () => [
      {
        field: "id",
        header: "ID",
        body: idBodyTemplate,
        sortable: true,
        style: { width: "80px" },
        visible: false, // Oculta por defecto
      },
      {
        field: "category",
        header: "Categoría",
        body: categoryBodyTemplate,
        sortable: true,
        filter: true,
        style: { minWidth: "150px" },
      },
      {
        field: "product",
        header: "Producto",
        body: productBodyTemplate,
        sortable: true,
        filter: true,
        style: { minWidth: "200px" },
      },
      {
        field: "salePrice",
        header: "Precio Venta",
        body: salePriceBodyTemplate,
        sortable: true,
        style: { minWidth: "150px" },
      },
      {
        field: "stock",
        header: "Existencia",
        body: stockBodyTemplate,
        sortable: true,
        style: { minWidth: "150px" },
      },
      {
        field: "location",
        header: "Ubicación",
        body: locationBodyTemplate,
        sortable: true,
        filter: true,
        style: { minWidth: "150px" },
      },
      {
        field: "type",
        header: "Tipo",
        body: typeBodyTemplate,
        sortable: true,
        filter: true,
        style: { width: "120px" },
      },
      {
        field: "quantity",
        header: "Cantidad",
        body: quantityBodyTemplate,
        sortable: true,
        filter: true,
        style: { width: "120px" },
      },
      {
        field: "reason",
        header: "Motivo",
        body: reasonBodyTemplate,
        sortable: true,
        filter: true,
        style: { minWidth: "150px" },
      },
      {
        field: "createdAt",
        header: "Fecha",
        body: (rowData) => dateBodyTemplate(rowData, "createdAt"),
        sortable: true,
        style: { minWidth: "150px" },
      },
      {
        field: "user",
        header: "Usuario",
        body: userBodyTemplate,
        sortable: true,
        filter: true,
        style: { minWidth: "150px" },
      },
      {
        field: "entities",
        header: "Organización",
        body: securityEntitiesBodyTemplate,
        style: { minWidth: "150px" },
        visible: false, // Oculta por defecto
      },
      {
        field: "updatedAt",
        header: "Actualizado",
        body: (rowData) => dateBodyTemplate(rowData, "updatedAt"),
        sortable: true,
        style: { width: "150px" },
        visible: false, // Oculta por defecto
      },
      {
        field: "audit",
        header: "Auditoría",
        body: auditBodyTemplate,
        style: { minWidth: "200px" },
        visible: false, // Oculta por defecto
      },
      {
        field: "reservationId",
        header: "ID Reserva",
        body: (rowData) => rowData.reservationId || "—",
        sortable: true,
        style: { minWidth: "150px" },
        visible: false, // Oculta por defecto
      },
      {
        field: "referenceId",
        header: "Referencia",
        body: (rowData) => rowData.referenceId || "—",
        sortable: true,
        style: { minWidth: "150px" },
        visible: false, // Oculta por defecto
      },
    ],
    [],
  );

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
    [getMovements],
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

  const actionBodyTemplate = (rowData) => {
    return (
      <div
        className="actions-column"
        style={{ display: "flex", gap: "0.25rem", justifyContent: "center" }}
      >
        {/* <Button
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

  const addMovementButton = (
    <Button
      icon="pi pi-plus"
      label="Nuevo Movimiento"
      tooltip="Crear Nuevo Movimiento de Inventario"
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
        globalFilterFields={[
          "inventory.product.name",
          "reason",
          "user.name",
          "inventory.product.category.name",
          "inventory.location",
        ]}
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
          headerStyle={{ width: "8rem" }}
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
