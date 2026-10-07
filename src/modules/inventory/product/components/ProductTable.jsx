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
  DELETE_PRODUCTS,
  GET_PRODUCTS,
  RESTORE_PRODUCTS,
} from "../graphql/queries";
import { formatMoney, formatQuantity, stockStatus } from "../../format";
import { useInventoryRoles } from "../../useInventoryRoles";
import { ProductForm } from "./ProductForm";
import { ProductDetailForm } from "./ProductDetailForm";

const EMPTY = <span className="text-color-secondary">—</span>;

/** Existencias del producto sumando todos sus inventarios */
const totalStock = (product) =>
  (product.inventories ?? []).reduce((sum, i) => sum + i.currentStock, 0);

const columns = [
  {
    field: "name",
    header: "Producto",
    sortable: true,
    filter: true,
    body: (row) => <span className="font-medium text-900">{row.name}</span>,
  },
  {
    field: "category.name",
    header: "Categoría",
    sortable: true,
    filter: true,
    body: (row) => row.category?.name ?? EMPTY,
  },
  {
    field: "stock",
    header: "Existencias",
    sortable: false,
    body: (row) => {
      if (!row.inventories?.length) {
        return <span className="text-color-secondary">Sin inventario</span>;
      }
      const stock = totalStock(row);
      const status = stockStatus({
        currentStock: stock,
        minStock: row.inventories.reduce((sum, i) => sum + (i.minStock ?? 0), 0),
      });
      return (
        <span className="flex align-items-center gap-2">
          {formatQuantity(stock, row.unitOfMeasure)}
          {status.severity !== "success" && (
            <Tag severity={status.severity} value={status.label} />
          )}
        </span>
      );
    },
  },
  {
    field: "costPrice",
    header: "Costo",
    sortable: true,
    bodyClassName: "white-space-nowrap",
    body: (row) => formatMoney(row.costPrice, row.costCurrency),
  },
  {
    field: "basePrice",
    header: "Precio de venta",
    sortable: true,
    bodyClassName: "white-space-nowrap",
    body: (row) => formatMoney(row.basePrice, row.baseCurrency),
  },
  {
    field: "unitOfMeasure.name",
    header: "Unidad",
    sortable: true,
    filter: true,
    visible: false,
    body: (row) =>
      row.unitOfMeasure
        ? `${row.unitOfMeasure.name} (${row.unitOfMeasure.symbol})`
        : EMPTY,
  },
];

export function ProductTable() {
  const toast = useRef(null);
  const lastParams = useRef(null);
  const { canEdit, canDelete, canRestore } = useInventoryRoles();
  const [fetchProducts, { loading, data, error }] = useLazyQuery(
    GET_PRODUCTS,
    { fetchPolicy: "network-only" },
  );
  const [removeProducts] = useMutation(DELETE_PRODUCTS);
  const [restoreProducts] = useMutation(RESTORE_PRODUCTS);
  // { productId } al editar, {} al crear
  const [form, setForm] = useState(null);
  const [detailId, setDetailId] = useState(null);

  const handleFetchData = useCallback(
    async (params) => {
      lastParams.current = params;
      try {
        const { data: response } = await fetchProducts({
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
          data: response?.products?.data,
          totalCount: response?.products?.totalCount,
        };
      } catch {
        return { data: [], totalCount: 0 };
      }
    },
    [fetchProducts],
  );

  const handleRefresh = useCallback(() => {
    if (lastParams.current) handleFetchData(lastParams.current);
  }, [handleFetchData]);

  const notify = (severity, summary, detail) =>
    toast.current?.show({ severity, summary, detail, life: 6000 });

  const handleSaved = (product, { created, inventoryError }) => {
    setForm(null);
    handleRefresh();
    notify(
      "success",
      created ? "Producto creado" : "Producto actualizado",
      product?.name,
    );
    if (inventoryError) {
      notify("warn", "No se pudo abrir algún inventario", inventoryError);
    }
  };

  const handleDelete = (row) =>
    confirmDialog({
      header: "Eliminar producto",
      message: `Se eliminará "${row.name}" junto con sus inventarios vacíos. Solo es posible si no le quedan existencias; sus ventas y movimientos se conservan.`,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Eliminar",
      rejectLabel: "Cancelar",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await removeProducts({ variables: { ids: [row.id] } });
          notify("success", "Producto eliminado", row.name);
          handleRefresh();
        } catch (err) {
          notify("error", "No se pudo eliminar", getErrorMessage(err));
        }
      },
    });

  const handleRestore = async (row) => {
    try {
      await restoreProducts({ variables: { ids: [row.id] } });
      notify("success", "Producto restaurado", row.name);
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
            tooltip="Restaurar producto"
            tooltipOptions={{ position: "top" }}
            aria-label="Restaurar producto"
            onClick={() => handleRestore(row)}
          />
        )}
      </div>
    ) : (
      <div className="actions-column">
        <Button
          icon="pi pi-eye"
          text
          rounded
          severity="secondary"
          tooltip="Ver ficha"
          tooltipOptions={{ position: "top" }}
          aria-label="Ver ficha"
          onClick={() => setDetailId(row.id)}
        />
        {canEdit && (
          <Button
            icon="pi pi-pencil"
            text
            rounded
            tooltip="Editar producto"
            tooltipOptions={{ position: "top" }}
            aria-label="Editar producto"
            onClick={() => setForm({ productId: row.id })}
          />
        )}
        {canDelete && (
          <Button
            icon="pi pi-trash"
            text
            rounded
            severity="danger"
            tooltip="Eliminar producto"
            tooltipOptions={{ position: "top" }}
            aria-label="Eliminar producto"
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
        data={data?.products?.data}
        totalRecords={data?.products?.totalCount}
        loading={loading}
        error={error}
        globalFilterFields={["name", "category.name", "unitOfMeasure.name"]}
        emptyMessage="No se encontraron productos"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} productos"
        onRefresh={handleRefresh}
        onFetchData={handleFetchData}
        initialPageSize={10}
        initialSorts={[{ field: "name", order: 1 }]}
        header={
          canEdit && (
            <Button
              label="Nuevo producto"
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
          className="w-10rem"
        />
      </GenericDataTable>

      {form && (
        <ProductForm
          productId={form.productId}
          onHide={() => setForm(null)}
          onSaved={handleSaved}
        />
      )}

      {detailId && (
        <ProductDetailForm
          productId={detailId}
          onHide={() => setDetailId(null)}
          onEdit={
            canEdit
              ? () => {
                  setForm({ productId: detailId });
                  setDetailId(null);
                }
              : undefined
          }
        />
      )}
    </>
  );
}

export default ProductTable;
