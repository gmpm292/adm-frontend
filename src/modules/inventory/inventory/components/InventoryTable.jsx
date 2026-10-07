import { useCallback, useRef, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import GenericDataTable from "../../../../components/BaseTable";
import { getErrorMessage } from "../../../../utils/errors";
import {
  DELETE_INVENTORIES,
  GET_INVENTORIES,
  RESTORE_INVENTORIES,
} from "../graphql/queries";
import { formatQuantity, stockStatus } from "../../format";
import { useInventoryRoles } from "../../useInventoryRoles";
import { MovementForm } from "../../inventory-movement/components/MovementForm";
import { InventoryForm } from "./InventoryForm";
import { InventoryDetailForm } from "./InventoryDetailForm";

const EMPTY = <span className="text-color-secondary">—</span>;

const columns = [
  {
    field: "product.name",
    header: "Producto",
    sortable: true,
    filter: true,
    body: (row) => (
      <span className="flex flex-column">
        <span className="font-medium text-900">{row.product?.name}</span>
        <small className="text-color-secondary">
          {row.product?.category?.name}
        </small>
      </span>
    ),
  },
  {
    field: "location",
    header: "Ubicación",
    sortable: true,
    filter: true,
    body: (row) => row.location || EMPTY,
  },
  {
    field: "office.name",
    header: "Oficina",
    sortable: true,
    filter: true,
    body: (row) => row.office?.name ?? EMPTY,
  },
  {
    field: "currentStock",
    header: "Existencias",
    sortable: true,
    bodyClassName: "white-space-nowrap",
    body: (row) => {
      const status = stockStatus(row);
      return (
        <span className="flex align-items-center gap-2">
          <span className="font-medium">
            {formatQuantity(row.currentStock, row.product?.unitOfMeasure)}
          </span>
          {status.severity !== "success" && (
            <Tag severity={status.severity} value={status.label} />
          )}
        </span>
      );
    },
  },
  {
    field: "minStock",
    header: "Mínimo",
    sortable: true,
    body: (row) =>
      row.minStock
        ? formatQuantity(row.minStock, row.product?.unitOfMeasure)
        : EMPTY,
  },
  {
    field: "business.name",
    header: "Empresa",
    sortable: true,
    filter: true,
    visible: false,
    body: (row) => row.business?.name ?? EMPTY,
  },
];

export function InventoryTable() {
  const toast = useRef(null);
  const lastParams = useRef(null);
  const { canEdit, canDelete, canRestore } = useInventoryRoles();
  const [fetchInventories, { loading, data, error }] = useLazyQuery(
    GET_INVENTORIES,
    { fetchPolicy: "network-only" },
  );
  const [removeInventories] = useMutation(DELETE_INVENTORIES);
  const [restoreInventories] = useMutation(RESTORE_INVENTORIES);
  // { inventory } al editar, {} al crear
  const [form, setForm] = useState(null);
  // { inventory, type } al registrar una entrada o salida
  const [movement, setMovement] = useState(null);
  const [detailId, setDetailId] = useState(null);

  const handleFetchData = useCallback(
    async (params) => {
      lastParams.current = params;
      try {
        const { data: response } = await fetchInventories({
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
          data: response?.inventories?.data,
          totalCount: response?.inventories?.totalCount,
        };
      } catch {
        return { data: [], totalCount: 0 };
      }
    },
    [fetchInventories],
  );

  const handleRefresh = useCallback(() => {
    if (lastParams.current) handleFetchData(lastParams.current);
  }, [handleFetchData]);

  const notify = (severity, summary, detail) =>
    toast.current?.show({ severity, summary, detail, life: 6000 });

  const handleSaved = (saved, { created }) => {
    const name = form?.inventory?.product?.name ?? saved?.product?.name;
    setForm(null);
    handleRefresh();
    notify(
      "success",
      created ? "Inventario abierto" : "Inventario actualizado",
      name,
    );
  };

  const handleMovementSaved = (_saved, { type, quantity, product, printError }) => {
    setMovement(null);
    handleRefresh();
    notify(
      "success",
      type === "OUT" ? "Salida registrada" : "Entrada registrada",
      `${formatQuantity(quantity, product?.unitOfMeasure)} de ${product?.name}`,
    );
    if (printError) notify("warn", "No se imprimió el comprobante", printError);
  };

  const handleDelete = (row) =>
    confirmDialog({
      header: "Eliminar inventario",
      message: `Se eliminará el inventario de "${row.product?.name}"${row.location ? ` en «${row.location}»` : ""}. Solo es posible si no le quedan existencias; su historial de movimientos se conserva.`,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Eliminar",
      rejectLabel: "Cancelar",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await removeInventories({ variables: { ids: [row.id] } });
          notify("success", "Inventario eliminado", row.product?.name);
          handleRefresh();
        } catch (err) {
          notify("error", "No se pudo eliminar", getErrorMessage(err));
        }
      },
    });

  const handleRestore = async (row) => {
    try {
      await restoreInventories({ variables: { ids: [row.id] } });
      notify("success", "Inventario restaurado", row.product?.name);
      handleRefresh();
    } catch (err) {
      notify("error", "No se pudo restaurar", getErrorMessage(err));
    }
  };

  const actionBodyTemplate = (row) =>
    row.deletedAt ? (
      <div className="actions-column">
        {canRestore && (
          <Button
            icon="pi pi-history"
            text
            rounded
            severity="success"
            tooltip="Restaurar inventario"
            tooltipOptions={{ position: "top" }}
            aria-label="Restaurar inventario"
            onClick={() => handleRestore(row)}
          />
        )}
      </div>
    ) : (
      <div className="actions-column">
        {canEdit && (
          <>
            <Button
              icon="pi pi-plus-circle"
              text
              rounded
              severity="success"
              tooltip="Registrar entrada"
              tooltipOptions={{ position: "top" }}
              aria-label="Registrar entrada"
              onClick={() => setMovement({ inventory: row, type: "IN" })}
            />
            <Button
              icon="pi pi-minus-circle"
              text
              rounded
              severity="danger"
              tooltip="Registrar salida"
              tooltipOptions={{ position: "top" }}
              aria-label="Registrar salida"
              disabled={row.currentStock <= 0}
              onClick={() => setMovement({ inventory: row, type: "OUT" })}
            />
          </>
        )}
        <Button
          icon="pi pi-eye"
          text
          rounded
          severity="secondary"
          tooltip="Ver ficha y movimientos"
          tooltipOptions={{ position: "top" }}
          aria-label="Ver ficha y movimientos"
          onClick={() => setDetailId(row.id)}
        />
        {canEdit && (
          <Button
            icon="pi pi-pencil"
            text
            rounded
            tooltip="Editar ubicación y mínimo"
            tooltipOptions={{ position: "top" }}
            aria-label="Editar inventario"
            onClick={() => setForm({ inventory: row })}
          />
        )}
        {canDelete && (
          <Button
            icon="pi pi-trash"
            text
            rounded
            severity="danger"
            tooltip="Eliminar inventario"
            tooltipOptions={{ position: "top" }}
            aria-label="Eliminar inventario"
            onClick={() => handleDelete(row)}
          />
        )}
      </div>
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
        globalFilterFields={[
          "product.name",
          "category.name",
          "location",
          "office.name",
        ]}
        emptyMessage="No se encontraron inventarios"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} inventarios"
        onRefresh={handleRefresh}
        onFetchData={handleFetchData}
        initialPageSize={10}
        initialSorts={[{ field: "product.name", order: 1 }]}
        header={
          canEdit && (
            <Button
              label="Nuevo inventario"
              icon="pi pi-plus"
              onClick={() => setForm({})}
            />
          )
        }
        showDeleted={canRestore}
      >
        <Column
          body={actionBodyTemplate}
          header="Acciones"
          className="w-14rem"
        />
      </GenericDataTable>

      {form && (
        <InventoryForm
          inventory={form.inventory}
          onHide={() => setForm(null)}
          onSaved={handleSaved}
        />
      )}
      {movement && (
        <MovementForm
          inventory={movement.inventory}
          type={movement.type}
          onHide={() => setMovement(null)}
          onSaved={handleMovementSaved}
        />
      )}
      {detailId && (
        <InventoryDetailForm
          inventoryId={detailId}
          onHide={() => setDetailId(null)}
        />
      )}
    </>
  );
}

export default InventoryTable;
