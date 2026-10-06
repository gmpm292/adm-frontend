import { useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { ProgressSpinner } from "primereact/progressspinner";
import { Tag } from "primereact/tag";
import { InfoRow, NoData } from "../../../../components/ui";
import { formatDate } from "../../../../utils/dateUtils";
import { getErrorMessage } from "../../../../utils/errors";
import { SALE_STATUS, formatMoney } from "../../../statistics/format";
import { GET_CUSTOMER_BY_ID, GET_CUSTOMER_SALES } from "../graphql/queries";

// Ventas que cuentan como compra hecha
const PAID_STATUSES = ["CONFIRMED", "PARTIALLY_REFUNDED"];

/** Total comprado, por moneda: nunca se suman monedas distintas */
const spentByCurrency = (sales) => {
  const totals = new Map();
  for (const sale of sales) {
    if (!PAID_STATUSES.includes(sale.saleStatus)) continue;
    totals.set(
      sale.totalAmountCurrency,
      (totals.get(sale.totalAmountCurrency) ?? 0) + (sale.totalAmount ?? 0),
    );
  }
  return [...totals.entries()];
};

/** Ficha del cliente: sus datos de contacto y su historial de compras */
export function CustomerDetailForm({ customerId, onHide, onEdit }) {
  const { data, loading, error } = useQuery(GET_CUSTOMER_BY_ID, {
    variables: { id: customerId },
    fetchPolicy: "network-only",
  });
  const { data: salesData, loading: loadingSales } = useQuery(
    GET_CUSTOMER_SALES,
    { variables: { customerId }, fetchPolicy: "network-only" },
  );

  const customer = data?.customer;
  const sales = salesData?.salesByCustomer ?? [];
  const spent = spentByCurrency(sales);

  return (
    <Dialog
      header={customer?.fullName ?? "Cliente"}
      visible
      onHide={onHide}
      className="ui-dialog--wide"
      modal
    >
      {loading ? (
        <div className="flex justify-content-center p-5">
          <ProgressSpinner strokeWidth="4" />
        </div>
      ) : !customer ? (
        <NoData
          message={
            error ? getErrorMessage(error) : "No se encontró el cliente"
          }
        />
      ) : (
        <>
          <ul className="ui-info-list">
            <InfoRow icon="pi pi-phone" label="Teléfono">
              {customer.phone || "—"}
            </InfoRow>
            <InfoRow icon="pi pi-id-card" label="Carné de identidad">
              {customer.ci || "—"}
            </InfoRow>
            <InfoRow icon="pi pi-envelope" label="Correo">
              {customer.email || "—"}
            </InfoRow>
            <InfoRow
              icon="pi pi-building"
              label="Tienda"
              detail={customer.business?.name}
            >
              {customer.office?.name || "—"}
            </InfoRow>
            <InfoRow
              icon="pi pi-calendar"
              label="Cliente desde"
              detail={
                customer.createdBy?.name
                  ? `Registrado por ${customer.createdBy.name}`
                  : undefined
              }
            >
              {formatDate(customer.createdAt)}
            </InfoRow>
            <InfoRow
              icon="pi pi-wallet"
              label="Total comprado"
              detail={
                sales.length === 1 ? "1 venta" : `${sales.length} ventas`
              }
            >
              {spent.length === 0
                ? "—"
                : spent
                    .map(([currency, total]) => formatMoney(total, currency))
                    .join(" · ")}
            </InfoRow>
          </ul>

          <h3 className="text-base font-semibold text-900 mt-4 mb-2">
            Historial de compras
          </h3>
          {loadingSales ? (
            <div className="flex justify-content-center p-3">
              <ProgressSpinner strokeWidth="4" />
            </div>
          ) : sales.length === 0 ? (
            <NoData message="Este cliente todavía no tiene compras" />
          ) : (
            <ul className="ui-info-list">
              {sales.map((sale) => {
                const status = SALE_STATUS[sale.saleStatus];
                return (
                  <InfoRow
                    key={sale.id}
                    label={
                      <span className="flex align-items-center gap-2">
                        {sale.invoiceNumber || `Venta #${sale.id}`}
                        {status && (
                          <Tag
                            severity={status.severity}
                            value={status.label}
                          />
                        )}
                      </span>
                    }
                    detail={`${formatDate(
                      sale.effectiveDate ?? sale.createdAt,
                    )} · ${(sale.details ?? [])
                      .map((d) => `${d.quantity} × ${d.product?.name}`)
                      .join(", ")}`}
                  >
                    {sale.totalAmount != null
                      ? formatMoney(sale.totalAmount, sale.totalAmountCurrency)
                      : "—"}
                  </InfoRow>
                );
              })}
            </ul>
          )}

          <div className="flex justify-content-end gap-2 mt-4">
            <Button label="Cerrar" severity="secondary" onClick={onHide} />
            <Button label="Editar" icon="pi pi-pencil" onClick={onEdit} />
          </div>
        </>
      )}
    </Dialog>
  );
}
