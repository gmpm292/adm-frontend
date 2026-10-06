import { useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Message } from "primereact/message";
import { ProgressSpinner } from "primereact/progressspinner";
import { getErrorMessage } from "../../../../utils/errors";
import { PaymentDialog } from "../../integrated-sale/components/PaymentDialog";
import { MAKE_SALE, VALIDATE_SALE_PAYMENTS } from "../graphql/queries";

/**
 * Cobro de una venta en borrador. Pide al backend el precio de la venta en
 * cada moneda y abre el mismo diálogo de cobro que la venta integrada.
 */
export function MakeSaleComponent({ sale, onHide, onCharged }) {
  const [quote, setQuote] = useState(null);
  const [quoteError, setQuoteError] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [validatePayments] = useMutation(VALIDATE_SALE_PAYMENTS);
  const [makeSale, { loading }] = useMutation(MAKE_SALE);

  useEffect(() => {
    let active = true;
    validatePayments({
      variables: {
        validateSalePaymentsInput: { saleId: sale.id, payments: [] },
      },
    })
      .then(({ data }) => active && setQuote(data.validateSalePayments))
      .catch((error) => active && setQuoteError(getErrorMessage(error)));
    return () => {
      active = false;
    };
  }, [sale.id, validatePayments]);

  const handleConfirm = async (payments, change) => {
    setPaymentError(null);
    try {
      const { data } = await makeSale({
        variables: {
          makeSaleInput: {
            saleId: sale.id,
            payments,
            baseCurrency: quote.currency,
          },
        },
      });
      onCharged(data.makeSale, change);
    } catch (error) {
      setPaymentError(getErrorMessage(error));
    }
  };

  if (quote?.totals?.length) {
    return (
      <PaymentDialog
        totals={quote.totals}
        currency={quote.currency}
        loading={loading}
        error={paymentError}
        onHide={onHide}
        onConfirm={handleConfirm}
      />
    );
  }

  return (
    <Dialog
      header="Cobrar venta"
      visible
      onHide={onHide}
      className="w-full md:w-30rem"
      modal
    >
      {quoteError || quote ? (
        <>
          <Message
            severity="error"
            text={
              quoteError ?? quote.message ?? "La venta no se puede cobrar"
            }
            className="w-full"
          />
          <div className="flex justify-content-end mt-3">
            <Button label="Cerrar" severity="secondary" onClick={onHide} />
          </div>
        </>
      ) : (
        <div className="flex justify-content-center p-5">
          <ProgressSpinner strokeWidth="4" />
        </div>
      )}
    </Dialog>
  );
}
