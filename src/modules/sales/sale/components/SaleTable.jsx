import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLazyQuery, useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import GenericDataTable from "../../../../components/BaseTable/index";
import { getErrorMessage } from "../../../../utils/errors";
import {
  SALE_STATUS,
  formatDateTime,
  formatMoney,
  isPaid,
  saleLabel,
  workerName,
} from "../../format";
import {
  CANCEL_SALE,
  DELETE_SALES,
  GET_SALES,
  RESTORE_SALES,
} from "../graphql/queries";
import { MakeSaleComponent } from "./MakeSaleComponent";
import { SaleDetailForm } from "./SaleDetailForm";
import { SaleEditForm } from "./SaleEditForm";

const EMPTY = <span className="text-color-secondary">—</span>;

const STATUS_OPTIONS = Object.entries(SALE_STATUS).map(([value, status]) => ({
  value,
  label: status.label,
}));

// En mensajería lo que importa es lo que falta por entregar o por cobrar
const DELIVERY_OPTIONS = [
  { value: "DRAFT", label: "Por cobrar" },
  { value: "CONFIRMED", label: "Cobradas" },
  { value: "UNASSIGNED", label: "Sin mensajero" },
];

const equal = (property, value) => ({
  property,
  operator: "EQUAL",
  value: String(value),
});

/** Filtros que la vista añade a los de la tabla */
const viewFilters = (deliveryOnly, view) => {
  const filters = [];
  if (deliveryOnly) filters.push(equal("hasDelivery", true));
  if (view === "UNASSIGNED") {
    filters.push({ property: "deliveryWorker.id", operator: "IS_NULL" });
  } else if (view) {
    filters.push(equal("saleStatus", view));
  }
  return filters;
};

const saleColumn = {
  field: "invoiceNumber",
  header: "Venta",
  sortable: true,
  filter: true,
  body: (row) => (
    <span className="flex align-items-center gap-2 font-medium text-900">
      {saleLabel(row)}
      {row.hasDelivery && (
        <i
          className="pi pi-truck text-color-secondary"
          title="Lleva mensajería"
        />
      )}
    </span>
  ),
};

const statusColumn = {
  field: "saleStatus",
  header: "Estado",
  sortable: true,
  body: (row) => {
    const status = SALE_STATUS[row.saleStatus];
    return status ? (
      <Tag severity={status.severity} value={status.label} />
    ) : (
      EMPTY
    );
  },
};

const dateColumn = {
  field: "createdAt",
  header: "Fecha",
  sortable: true,
  body: (row) => formatDateTime(row.effectiveDate ?? row.createdAt),
};

const customerColumn = {
  field: "customer.fullName",
  header: "Cliente",
  filter: true,
  body: (row) =>
    row.customer?.fullName ?? (
      <span className="text-color-secondary">Cliente ocasional</span>
    ),
};

const totalColumn = {
  field: "totalAmount",
  header: "Total",
  sortable: true,
  bodyClassName: "text-right font-medium white-space-nowrap",
  headerClassName: "text-right",
  body: (row) =>
    row.totalAmount != null
      ? formatMoney(row.totalAmount, row.totalAmountCurrency)
      : EMPTY,
};

const SALE_COLUMNS = [
  saleColumn,
  dateColumn,
  customerColumn,
  {
    field: "salesWorker.id",
    header: "Vendedor",
    body: (row) => workerName(row.salesWorker) ?? EMPTY,
  },
  totalColumn,
  statusColumn,
];

const DELIVERY_COLUMNS = [
  saleColumn,
  dateColumn,
  customerColumn,
  {
    field: "deliveryWorker.id",
    header: "Mensajero",
    body: (row) =>
      workerName(row.deliveryWorker) ?? (
        <Tag severity="warning" value="Sin asignar" />
      ),
  },
  {
    field: "deliveryNotes",
    header: "Indicaciones",
    bodyClassName: "max-w-20rem white-space-nowrap overflow-hidden text-overflow-ellipsis",
    body: (row) => row.deliveryNotes || EMPTY,
  },
  totalColumn,
  statusColumn,
];

/**
 * Listado de ventas. Con `deliveryOnly` muestra solo las que llevan
 * mensajería, con su mensajero e indicaciones: es la pantalla de Mensajerías.
 */
export function SaleTable({ deliveryOnly = false }) {
  const toast = useRef(null);
  const navigate = useNavigate();
  const [getSales, { loading, data, error }] = useLazyQuery(GET_SALES, {
    fetchPolicy: "network-only",
  });
  const [deleteSales] = useMutation(DELETE_SALES);
  const [restoreSales] = useMutation(RESTORE_SALES);
  const [cancelSale] = useMutation(CANCEL_SALE);
  // { mode: "view" | "edit" | "charge", sale }
  const [dialog, setDialog] = useState(null);
  const [view, setView] = useState(null);
  const lastParams = useRef(null);
  const viewRef = useRef(view);

  const handleFetchData = useCallback(
    async (params) => {
      lastParams.current = params;
      try {
        const { data: response } = await getSales({
          variables: {
            options: {
              skip: params.skip,
              take: params.take,
              withDeleted: params.showDeleted,
              filters: [
                ...(params.filters ?? []),
                ...viewFilters(deliveryOnly, viewRef.current),
              ],
              sorts: params.sorts,
            },
          },
        });
        return {
          data: response?.sales?.data,
          totalCount: response?.sales?.totalCount,
        };
      } catch {
        return { data: [], totalCount: 0 };
      }
    },
    [getSales, deliveryOnly],
  );

  const handleRefresh = useCallback(() => {
    if (lastParams.current) handleFetchData(lastParams.current);
  }, [handleFetchData]);

  // Al cambiar de vista se vuelve a la primera página
  useEffect(() => {
    if (viewRef.current === view) return;
    viewRef.current = view;
    if (lastParams.current) {
      handleFetchData({ ...lastParams.current, skip: 0 });
    }
  }, [view, handleFetchData]);

  const notify = (severity, summary, detail) =>
    toast.current?.show({ severity, summary, detail, life: 5000 });

  const run = async (action, success, failure) => {
    try {
      await action();
      notify("success", success);
      handleRefresh();
    } catch (err) {
      notify("error", failure, getErrorMessage(err));
    }
  };

  const handleCancel = (sale) =>
    confirmDialog({
      header: "Cancelar la venta",
      message: `${saleLabel(sale)} quedará cancelada y sus productos volverán a estar disponibles.`,
      icon: "pi pi-ban",
      acceptLabel: "Cancelar la venta",
      rejectLabel: "Volver",
      acceptClassName: "p-button-danger",
      accept: () =>
        run(
          () => cancelSale({ variables: { id: sale.id } }),
          "Venta cancelada",
          "No se pudo cancelar",
        ),
    });

  const handleDelete = (sale) =>
    confirmDialog({
      header: "Eliminar la venta",
      message: `${saleLabel(sale)} dejará de aparecer en el listado. Puedes restaurarla después.`,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Eliminar",
      rejectLabel: "Cancelar",
      acceptClassName: "p-button-danger",
      accept: () =>
        run(
          () => deleteSales({ variables: { ids: [sale.id] } }),
          "Venta eliminada",
          "No se pudo eliminar",
        ),
    });

  const handleRestore = (sale) =>
    run(
      () => restoreSales({ variables: { ids: [sale.id] } }),
      "Venta restaurada",
      "No se pudo restaurar",
    );

  const handleCharged = (sale, change) => {
    setDialog(null);
    handleRefresh();
    notify(
      "success",
      `${saleLabel(sale)} cobrada`,
      change > 0
        ? `Cambio a devolver: ${formatMoney(change, sale.totalAmountCurrency)}`
        : formatMoney(sale.totalAmount, sale.totalAmountCurrency),
    );
  };

  const action = (props) => (
    <Button
      text
      rounded
      tooltipOptions={{ position: "top" }}
      aria-label={props.tooltip}
      {...props}
    />
  );

  const actionBodyTemplate = (row) => {
    if (row.deletedAt) {
      return (
        <div className="actions-column">
          {action({
            icon: "pi pi-history",
            severity: "success",
            tooltip: "Restaurar venta",
            onClick: () => handleRestore(row),
          })}
        </div>
      );
    }

    const isDraft = row.saleStatus === "DRAFT";
    const paid = isPaid(row);

    return (
      <div className="actions-column">
        {action({
          icon: "pi pi-eye",
          severity: "secondary",
          tooltip: paid ? "Ver venta y devoluciones" : "Ver venta",
          onClick: () => setDialog({ mode: "view", sale: row }),
        })}
        {isDraft &&
          action({
            icon: "pi pi-wallet",
            severity: "success",
            tooltip: "Cobrar",
            onClick: () => setDialog({ mode: "charge", sale: row }),
          })}
        {(isDraft || paid) &&
          action({
            icon: isDraft ? "pi pi-pencil" : "pi pi-truck",
            tooltip: isDraft ? "Cliente y mensajería" : "Mensajería",
            onClick: () => setDialog({ mode: "edit", sale: row }),
          })}
        {isDraft &&
          action({
            icon: "pi pi-list",
            severity: "secondary",
            tooltip: "Cambiar productos",
            onClick: () => navigate(`/sales/sales/${row.id}/details`),
          })}
        {isDraft &&
          action({
            icon: "pi pi-ban",
            severity: "danger",
            tooltip: "Cancelar venta",
            onClick: () => handleCancel(row),
          })}
        {!isDraft &&
          !paid &&
          action({
            icon: "pi pi-trash",
            severity: "danger",
            tooltip: "Eliminar venta",
            onClick: () => handleDelete(row),
          })}
      </div>
    );
  };

  const header = (
    <>
      <Dropdown
        value={view}
        options={deliveryOnly ? DELIVERY_OPTIONS : STATUS_OPTIONS}
        onChange={(e) => setView(e.value ?? null)}
        placeholder={deliveryOnly ? "Todas las entregas" : "Todos los estados"}
        showClear
        className="w-14rem"
        aria-label="Filtrar por estado"
      />
      <Button
        label="Nueva venta"
        icon="pi pi-plus"
        onClick={() => navigate("/sales/integrated-sale")}
      />
    </>
  );

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <GenericDataTable
        columns={deliveryOnly ? DELIVERY_COLUMNS : SALE_COLUMNS}
        data={data?.sales?.data}
        totalRecords={data?.sales?.totalCount}
        loading={loading}
        error={error}
        globalFilterFields={["invoiceNumber", "customer.fullName"]}
        emptyMessage={
          deliveryOnly
            ? "No hay ventas con mensajería"
            : "No se encontraron ventas"
        }
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} ventas"
        onRefresh={handleRefresh}
        onFetchData={handleFetchData}
        initialPageSize={10}
        header={header}
        showDeleted={true}
      >
        <Column
          body={actionBodyTemplate}
          header="Acciones"
          className="w-14rem"
        />
      </GenericDataTable>

      {dialog?.mode === "view" && (
        <SaleDetailForm
          saleId={dialog.sale.id}
          onHide={() => setDialog(null)}
          onChanged={handleRefresh}
        />
      )}
      {dialog?.mode === "edit" && (
        <SaleEditForm
          saleId={dialog.sale.id}
          onHide={() => setDialog(null)}
          onSaved={(saved) => {
            setDialog(null);
            handleRefresh();
            notify("success", `${saleLabel(saved)} actualizada`);
          }}
        />
      )}
      {dialog?.mode === "charge" && (
        <MakeSaleComponent
          sale={dialog.sale}
          onHide={() => setDialog(null)}
          onCharged={handleCharged}
        />
      )}
    </>
  );
}

export default SaleTable;
