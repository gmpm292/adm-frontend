import { useCallback, useEffect, useRef, useState } from "react";
import { useLazyQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { ConfirmDialog } from "primereact/confirmdialog";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import GenericDataTable from "../../../../components/BaseTable/index";
import {
  SALE_DETAIL_STATUS,
  formatDateTime,
  formatMoney,
  saleLabel,
  workerName,
} from "../../format";
import { SaleDetailForm } from "../../sale/components/SaleDetailForm";
import { GET_SALE_DETAILS } from "../graphql/queries";

const EMPTY = <span className="text-color-secondary">—</span>;

const STATUS_OPTIONS = Object.entries(SALE_DETAIL_STATUS).map(
  ([value, status]) => ({ value, label: status.label }),
);

const money = (field) => (row) =>
  row[field] != null ? formatMoney(row[field], row.currency) : EMPTY;

const COLUMNS = [
  {
    field: "sale.invoiceNumber",
    header: "Venta",
    filter: true,
    body: (row) => (
      <span className="font-medium text-900">{saleLabel(row.sale)}</span>
    ),
  },
  {
    field: "createdAt",
    header: "Fecha",
    sortable: true,
    body: (row) => formatDateTime(row.sale?.effectiveDate ?? row.createdAt),
  },
  {
    field: "product.name",
    header: "Producto",
    filter: true,
    body: (row) => row.product?.name ?? EMPTY,
  },
  {
    field: "quantity",
    header: "Cantidad",
    sortable: true,
    bodyClassName: "text-right",
    headerClassName: "text-right",
  },
  {
    field: "unitPrice",
    header: "Precio",
    bodyClassName: "text-right white-space-nowrap",
    headerClassName: "text-right",
    body: money("unitPrice"),
  },
  {
    field: "subtotal",
    header: "Importe",
    bodyClassName: "text-right font-medium white-space-nowrap",
    headerClassName: "text-right",
    body: money("subtotal"),
  },
  {
    field: "saleDetailStatus",
    header: "Estado",
    sortable: true,
    body: (row) => {
      const status = SALE_DETAIL_STATUS[row.saleDetailStatus];
      return status ? (
        <Tag severity={status.severity} value={status.label} />
      ) : (
        EMPTY
      );
    },
  },
  {
    field: "publicists",
    header: "Publicistas",
    body: (row) =>
      row.publicists?.length
        ? row.publicists.map(workerName).join(", ")
        : EMPTY,
  },
];

/** Todos los productos vendidos, línea a línea, con acceso a su venta */
export function SaleDetailGeneralTable() {
  const [getSaleDetails, { loading, data, error }] = useLazyQuery(
    GET_SALE_DETAILS,
    { fetchPolicy: "network-only" },
  );
  const [saleId, setSaleId] = useState(null);
  const [status, setStatus] = useState(null);
  const lastParams = useRef(null);
  const statusRef = useRef(status);

  const handleFetchData = useCallback(
    async (params) => {
      lastParams.current = params;
      try {
        const { data: response } = await getSaleDetails({
          variables: {
            options: {
              skip: params.skip,
              take: params.take,
              filters: [
                ...(params.filters ?? []),
                ...(statusRef.current
                  ? [
                      {
                        property: "saleDetailStatus",
                        operator: "EQUAL",
                        value: statusRef.current,
                      },
                    ]
                  : []),
              ],
              sorts: params.sorts,
            },
          },
        });
        return {
          data: response?.saleDetails?.data,
          totalCount: response?.saleDetails?.totalCount,
        };
      } catch {
        return { data: [], totalCount: 0 };
      }
    },
    [getSaleDetails],
  );

  const handleRefresh = useCallback(() => {
    if (lastParams.current) handleFetchData(lastParams.current);
  }, [handleFetchData]);

  // Al cambiar el estado se vuelve a la primera página
  useEffect(() => {
    if (statusRef.current === status) return;
    statusRef.current = status;
    if (lastParams.current) {
      handleFetchData({ ...lastParams.current, skip: 0 });
    }
  }, [status, handleFetchData]);

  return (
    <>
      <ConfirmDialog />

      <GenericDataTable
        columns={COLUMNS}
        data={data?.saleDetails?.data}
        totalRecords={data?.saleDetails?.totalCount}
        loading={loading}
        error={error}
        globalFilterFields={["product.name", "sale.invoiceNumber"]}
        emptyMessage="No se encontraron productos vendidos"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} líneas"
        onRefresh={handleRefresh}
        onFetchData={handleFetchData}
        initialPageSize={10}
        header={
          <Dropdown
            value={status}
            options={STATUS_OPTIONS}
            onChange={(e) => setStatus(e.value ?? null)}
            placeholder="Todos los estados"
            showClear
            className="w-14rem"
            aria-label="Filtrar por estado"
          />
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
                tooltip="Ver la venta"
                tooltipOptions={{ position: "top" }}
                aria-label="Ver la venta"
                onClick={() => setSaleId(row.sale.id)}
              />
            </div>
          )}
        />
      </GenericDataTable>

      {saleId && (
        <SaleDetailForm
          saleId={saleId}
          onHide={() => setSaleId(null)}
          onChanged={handleRefresh}
        />
      )}
    </>
  );
}

export default SaleDetailGeneralTable;
