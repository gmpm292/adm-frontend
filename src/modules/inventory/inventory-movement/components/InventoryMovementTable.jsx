import { useCallback, useRef, useState } from "react";
import { useLazyQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import GenericDataTable from "../../../../components/BaseTable";
import { GET_INVENTORY_MOVEMENTS } from "../graphql/queries";
import {
  MOVEMENT_TYPE,
  formatDateTime,
  formatQuantity,
  movementReference,
  personName,
  reasonLabel,
} from "../../format";
import { useInventoryRoles } from "../../useInventoryRoles";
import { MovementForm } from "./MovementForm";
import { MovementDetailForm } from "./MovementDetailForm";

const EMPTY = <span className="text-color-secondary">—</span>;

const columns = [
  {
    field: "createdAt",
    header: "Fecha",
    sortable: true,
    bodyClassName: "white-space-nowrap",
    body: (row) => formatDateTime(row.createdAt),
  },
  {
    field: "product.name",
    header: "Producto",
    sortable: true,
    filter: true,
    body: (row) => (
      <span className="flex flex-column">
        <span className="font-medium text-900">
          {row.inventory?.product?.name}
        </span>
        <small className="text-color-secondary">
          {row.inventory?.product?.category?.name}
        </small>
      </span>
    ),
  },
  {
    field: "inventory.location",
    header: "Ubicación",
    sortable: true,
    filter: true,
    body: (row) => (
      <span className="flex flex-column">
        <span>{row.inventory?.location || "Sin ubicación"}</span>
        <small className="text-color-secondary">{row.office?.name}</small>
      </span>
    ),
  },
  {
    field: "type",
    header: "Tipo",
    sortable: true,
    body: (row) => {
      const type = MOVEMENT_TYPE[row.type];
      return <Tag severity={type.severity} icon={type.icon} value={type.label} />;
    },
  },
  {
    field: "quantity",
    header: "Cantidad",
    sortable: true,
    bodyClassName: "white-space-nowrap font-medium",
    body: (row) =>
      `${row.type === "OUT" ? "−" : "+"}${formatQuantity(
        row.quantity,
        row.inventory?.product?.unitOfMeasure,
      )}`,
  },
  {
    field: "reason",
    header: "Motivo",
    sortable: true,
    body: (row) => {
      const reference = movementReference(row);
      return (
        <span className="flex flex-column">
          <span>{reasonLabel(row.reason)}</span>
          {reference && (
            <small className="text-color-secondary">{reference}</small>
          )}
        </span>
      );
    },
  },
  {
    field: "user.name",
    header: "Registrado por",
    sortable: true,
    filter: true,
    body: (row) => personName(row.user) ?? EMPTY,
  },
];

export function InventoryMovementTable() {
  const toast = useRef(null);
  const lastParams = useRef(null);
  const { canEdit } = useInventoryRoles();
  const [fetchMovements, { loading, data, error }] = useLazyQuery(
    GET_INVENTORY_MOVEMENTS,
    { fetchPolicy: "network-only" },
  );
  const [creating, setCreating] = useState(false);
  const [detailId, setDetailId] = useState(null);

  const handleFetchData = useCallback(
    async (params) => {
      lastParams.current = params;
      try {
        const { data: response } = await fetchMovements({
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
          data: response?.inventoryMovements?.data,
          totalCount: response?.inventoryMovements?.totalCount,
        };
      } catch {
        return { data: [], totalCount: 0 };
      }
    },
    [fetchMovements],
  );

  const handleRefresh = useCallback(() => {
    if (lastParams.current) handleFetchData(lastParams.current);
  }, [handleFetchData]);

  const notify = (severity, summary, detail) =>
    toast.current?.show({ severity, summary, detail, life: 6000 });

  const handleSaved = (_movement, { type, quantity, product, printError }) => {
    setCreating(false);
    handleRefresh();
    notify(
      "success",
      type === "OUT" ? "Salida registrada" : "Entrada registrada",
      `${formatQuantity(quantity, product?.unitOfMeasure)} de ${product?.name}`,
    );
    if (printError) notify("warn", "No se imprimió el comprobante", printError);
  };

  return (
    <>
      <Toast ref={toast} />

      <GenericDataTable
        columns={columns}
        data={data?.inventoryMovements?.data}
        totalRecords={data?.inventoryMovements?.totalCount}
        loading={loading}
        error={error}
        globalFilterFields={[
          "product.name",
          "category.name",
          "inventory.location",
          "user.name",
          "referenceId",
        ]}
        emptyMessage="No se encontraron movimientos"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} movimientos"
        onRefresh={handleRefresh}
        onFetchData={handleFetchData}
        initialPageSize={10}
        initialSorts={[{ field: "createdAt", order: -1 }]}
        header={
          canEdit && (
            <Button
              label="Registrar movimiento"
              icon="pi pi-plus"
              onClick={() => setCreating(true)}
            />
          )
        }
      >
        <Column
          header="Acciones"
          className="w-6rem"
          body={(row) => (
            <div className="actions-column">
              <Button
                icon="pi pi-eye"
                text
                rounded
                severity="secondary"
                tooltip="Ver detalle"
                tooltipOptions={{ position: "top" }}
                aria-label="Ver detalle"
                onClick={() => setDetailId(row.id)}
              />
            </div>
          )}
        />
      </GenericDataTable>

      {creating && (
        <MovementForm onHide={() => setCreating(false)} onSaved={handleSaved} />
      )}
      {detailId && (
        <MovementDetailForm
          movementId={detailId}
          onHide={() => setDetailId(null)}
        />
      )}
    </>
  );
}
