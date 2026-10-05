import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Toast } from "primereact/toast";
import { useMutation } from "@apollo/client";
import { MAKE_SALE } from "../graphql/queries";
import { SalePaymentValidation } from "./SalePaymentValidation";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";
import { FormField } from "../../../../components/ui";

export const MakeSaleComponent = ({
  saleId,
  visible,
  onHide,
  onSuccess,
}) => {
  const [customDate, setCustomDate] = useState(null);
  const [showValidation, setShowValidation] = useState(false);
  const [validatedPayments, setValidatedPayments] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const toast = useRef(null);

  const [makeSale] = useMutation(MAKE_SALE);

  const handleValidationSuccess = (result, payments) => {
    setValidationResult(result);
    setValidatedPayments(payments);
    setShowValidation(false);
  };

  const handleProcessSale = async () => {
    if (!validatedPayments || !validationResult?.valid) {
      toast.current.show({
        severity: "warn",
        summary: "Validación Requerida",
        detail: "Por favor valide los pagos primero",
        life: 3000,
      });
      return;
    }

    try {
      setProcessing(true);

      const { data } = await makeSale({
        variables: {
          makeSaleInput: {
            saleId,
            payments: validatedPayments,
            customDate: customDate ? customDate.toISOString() : undefined,
          },
        },
      });

      toast.current.show({
        severity: "success",
        summary: "Venta Realizada",
        detail: "La venta ha sido procesada exitosamente",
        life: 3000,
      });

      // Resetear estado
      setValidatedPayments(null);
      setValidationResult(null);
      setCustomDate(null);

      if (onSuccess) {
        onSuccess(data.makeSale);
      }

      onHide();
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: err.message,
        life: 3000,
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    setValidatedPayments(null);
    setValidationResult(null);
    setCustomDate(null);
    onHide();
  };

  const footer = (
    <>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        onClick={handleClose}
        severity="secondary"
      />
      <Button
        label="Validar Pagos"
        icon="pi pi-check-circle"
        onClick={() => setShowValidation(true)}
        severity="secondary"
      />
      <Button
        label="Procesar Venta"
        icon="pi pi-shopping-cart"
        onClick={handleProcessSale}
        disabled={!validationResult?.valid || processing}
      />
    </>
  );

  const totalValidated =
    validatedPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;

  return (
    <>
      <Toast ref={toast} />

      <Dialog
        header="Realizar Venta"
        visible={visible}
        className="w-full md:w-8 xl:w-6"
        footer={footer}
        onHide={handleClose}
        modal
      >
        <div>
          <div className="mb-4">
            <h4 className="mt-0 mb-1">Procesar Venta #{saleId}</h4>
            <p className="m-0 text-sm text-color-secondary">
              Complete la información para finalizar la venta
            </p>
          </div>

          <FormField label="Fecha Personalizada (Opcional)" htmlFor="customDate">
            <Calendar
              id="customDate"
              value={customDate}
              onChange={(e) => setCustomDate(e.value)}
              dateFormat="dd/mm/yy"
              showIcon
              showButtonBar
            />
          </FormField>

          {validationResult && (
            <div className="mt-4">
              <Message
                className="w-full"
                severity={validationResult.valid ? "success" : "warn"}
                text={
                  validationResult.valid
                    ? `✅ Pagos validados correctamente`
                    : `❌ ${validationResult.message}`
                }
              />

              {validationResult.valid && validatedPayments && (
                <div className="mt-3 p-3 border-round border-1 surface-border">
                  <h5 className="mt-0 mb-3">Resumen de Pagos Validados:</h5>
                  {validatedPayments.map((payment, index) => (
                    <div
                      key={index}
                      className="flex justify-content-between mb-1"
                    >
                      <span>Pago {index + 1}:</span>
                      <span className="font-bold">
                        {payment.amount.toLocaleString("en-US", {
                          style: "currency",
                          currency: payment.currency,
                        })}{" "}
                        ({payment.currency}) - {payment.paymentMethod}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-content-between mt-2 pt-2 border-top-1 surface-border">
                    <span className="font-bold">Total:</span>
                    <span className="font-bold text-lg">
                      {totalValidated.toLocaleString("en-US", {
                        style: "currency",
                        currency: validatedPayments[0]?.currency || "USD",
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {processing && (
            <div className="flex justify-content-center align-items-center gap-2 mt-3 text-color-secondary">
              <ProgressSpinner className="w-2rem h-2rem m-0" />
              <span>Procesando venta...</span>
            </div>
          )}

          {!validationResult && (
            <Message
              severity="info"
              className="w-full mt-4"
              text="Por favor valide los pagos antes de procesar la venta"
            />
          )}
        </div>
      </Dialog>

      <SalePaymentValidation
        saleId={saleId}
        visible={showValidation}
        onHide={() => setShowValidation(false)}
        onValidationSuccess={handleValidationSuccess}
      />
    </>
  );
};
