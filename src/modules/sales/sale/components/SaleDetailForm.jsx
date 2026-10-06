import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { confirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { Message } from "primereact/message";
import { ProgressSpinner } from "primereact/progressspinner";
import { Tag } from "primereact/tag";
import { InfoRow, NoData } from "../../../../components/ui";
import { getErrorMessage } from "../../../../utils/errors";
import {
  PAYMENT_METHOD_LABELS,
  SALE_DETAIL_STATUS,
  SALE_STATUS,
  formatDateTime,
  formatMoney,
  isPaid,
  saleLabel,
  workerName,
} from "../../format";
import { GET_SALE_BY_ID, REFUND_SALE } from "../graphql/queries";

/**
 * Ficha de una venta: quién la hizo, a quién, cómo se cobró y sus productos.
 * Desde aquí se devuelve la venta completa o un producto concreto.
 */
export function SaleDetailForm({ saleId, onHide, onChanged }) {
  const [refundError, setRefundError] = useState(null);
  const { data, loading, error } = useQuery(GET_SALE_BY_ID, {
    variables: { id: saleId },
    fetchPolicy: "network-only",
  });
  const [refundSale, { loading: refunding }] = useMutation(REFUND_SALE, {
    refetchQueries: [{ query: GET_SALE_BY_ID, variables: { id: saleId } }],
    awaitRefetchQueries: true,
  });

  const sale = data?.sale;
  const status = sale && SALE_STATUS[sale.saleStatus];
  const soldLines = (sale?.details ?? []).filter(
    (detail) => detail.saleDetailStatus === "CONFIRMED",
  );

  const refund = (refundInput, message) =>
    confirmDialog({
      header: "Devolver",
      message,
      icon: "pi pi-undo",
      acceptLabel: "Devolver",
      rejectLabel: "Cancelar",
      acceptClassName: "p-button-danger",
      accept: async () => {
        setRefundError(null);
        try {
          await refundSale({ variables: { refund: refundInput } });
          onChanged?.();
        } catch (err) {
          setRefundError(getErrorMessage(err));
        }
      },
    });

  return (
    <Dialog
      header={
        sale ? (
          <span className="flex align-items-center gap-2">
            {saleLabel(sale)}
            {status && <Tag severity={status.severity} value={status.label} />}
          </span>
        ) : (
          "Venta"
        )
      }
      visible
      onHide={onHide}
      className="ui-dialog--wide"
      modal
    >
      {loading && !sale ? (
        <div className="flex justify-content-center p-5">
          <ProgressSpinner strokeWidth="4" />
        </div>
      ) : !sale ? (
        <NoData
          message={error ? getErrorMessage(error) : "No se encontró la venta"}
        />
      ) : (
        <>
          <ul className="ui-info-list">
            <InfoRow
              icon="pi pi-calendar"
              label={sale.effectiveDate ? "Cobrada" : "Creada"}
              detail={[sale.office?.name, sale.business?.name]
                .filter(Boolean)
                .join(" · ")}
            >
              {formatDateTime(sale.effectiveDate ?? sale.createdAt)}
            </InfoRow>
            <InfoRow
              icon="pi pi-user"
              label="Cliente"
              detail={sale.customer?.phone}
            >
              {sale.customer?.fullName ?? "Cliente ocasional"}
            </InfoRow>
            <InfoRow icon="pi pi-id-card" label="Vendedor">
              {workerName(sale.salesWorker) ?? "—"}
            </InfoRow>
            {sale.hasDelivery && (
              <InfoRow
                icon="pi pi-truck"
                label="Mensajería"
                detail={sale.deliveryNotes}
              >
                {workerName(sale.deliveryWorker) ?? "Sin mensajero"}
              </InfoRow>
            )}
            {(sale.payments ?? []).map((payment, index) => (
              <InfoRow
                key={index}
                icon="pi pi-wallet"
                label="Pago recibido"
                detail={PAYMENT_METHOD_LABELS[payment.paymentMethod]}
              >
                {formatMoney(payment.amount, payment.currency)}
              </InfoRow>
            ))}
          </ul>

          <h3 className="text-base font-semibold text-900 mt-4 mb-2">
            Productos
          </h3>
          <ul className="ui-info-list">
            {sale.details.map((detail) => {
              const lineStatus = SALE_DETAIL_STATUS[detail.saleDetailStatus];
              return (
                <InfoRow
                  key={detail.id}
                  label={
                    <span className="flex align-items-center gap-2">
                      {detail.quantity} × {detail.product?.name}
                      {lineStatus && detail.saleDetailStatus !== "CONFIRMED" && (
                        <Tag
                          severity={lineStatus.severity}
                          value={lineStatus.label}
                        />
                      )}
                    </span>
                  }
                  detail={
                    detail.unitPrice != null
                      ? `${formatMoney(detail.unitPrice, detail.currency)} c/u`
                      : undefined
                  }
                >
                  <span className="flex align-items-center gap-2">
                    {detail.subtotal != null
                      ? formatMoney(detail.subtotal, detail.currency)
                      : "—"}
                    {detail.saleDetailStatus === "CONFIRMED" &&
                      soldLines.length > 1 && (
                        <Button
                          icon="pi pi-undo"
                          text
                          rounded
                          severity="danger"
                          tooltip="Devolver este producto"
                          tooltipOptions={{ position: "left" }}
                          aria-label={`Devolver ${detail.product?.name}`}
                          disabled={refunding}
                          onClick={() =>
                            refund(
                              { saleDetailIds: [detail.id] },
                              `Se devolverán ${detail.quantity} × ${detail.product?.name} y volverán al inventario.`,
                            )
                          }
                        />
                      )}
                  </span>
                </InfoRow>
              );
            })}
          </ul>

          <div className="pos-total mt-3">
            <span className="pos-total__label">
              {sale.saleStatus === "DRAFT" ? "Total a cobrar" : "Total"}
            </span>
            <span className="pos-total__amount">
              {sale.totalAmount != null
                ? formatMoney(sale.totalAmount, sale.totalAmountCurrency)
                : "—"}
            </span>
          </div>

          {refundError && (
            <Message
              severity="error"
              text={refundError}
              className="w-full mt-3"
            />
          )}

          <div className="flex justify-content-end gap-2 mt-4">
            {isPaid(sale) && soldLines.length > 0 && (
              <Button
                label={
                  sale.saleStatus === "PARTIALLY_REFUNDED"
                    ? "Devolver el resto"
                    : "Devolver la venta"
                }
                icon="pi pi-undo"
                severity="danger"
                outlined
                loading={refunding}
                onClick={() =>
                  refund(
                    { saleId: sale.id },
                    "Se devolverán todos los productos vendidos y volverán al inventario.",
                  )
                }
              />
            )}
            <Button label="Cerrar" severity="secondary" onClick={onHide} />
          </div>
        </>
      )}
    </Dialog>
  );
}
