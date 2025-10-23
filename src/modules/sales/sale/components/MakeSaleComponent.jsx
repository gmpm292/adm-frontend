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

export const MakeSaleComponent = ({
  saleId,
  visible,
  onHide,
  onSuccess,
  saleDetails,
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
    <div className="flex justify-content-between align-items-center">
      <div>
        <Button
          label="Cancelar"
          icon="pi pi-times"
          onClick={handleClose}
          className="p-button-text"
        />
      </div>
      <div className="flex gap-2">
        <Button
          label="Validar Pagos"
          icon="pi pi-check-circle"
          onClick={() => setShowValidation(true)}
          className="p-button-outlined p-button-help"
        />
        <Button
          label="Procesar Venta"
          icon="pi pi-shopping-cart"
          onClick={handleProcessSale}
          disabled={!validationResult?.valid || processing}
        />
      </div>
    </div>
  );

  const totalValidated =
    validatedPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;

  return (
    <>
      <Toast ref={toast} />

      <Dialog
        header="Realizar Venta"
        visible={visible}
        style={{ width: "800px" }}
        footer={footer}
        onHide={handleClose}
        modal
      >
        <div className="p-fluid">
          <div className="mb-4">
            <h4>Procesar Venta #{saleId}</h4>
            <p className="text-sm text-color-secondary">
              Complete la información para finalizar la venta
            </p>
          </div>

          <div className="grid">
            <div className="field col-12">
              <label htmlFor="customDate">Fecha Personalizada (Opcional)</label>
              <Calendar
                id="customDate"
                value={customDate}
                onChange={(e) => setCustomDate(e.value)}
                dateFormat="dd/mm/yy"
                showIcon
                showButtonBar
              />
            </div>
          </div>

          {validationResult && (
            <div className="mt-4">
              <Message
                severity={validationResult.valid ? "success" : "warn"}
                text={
                  validationResult.valid
                    ? `✅ Pagos validados correctamente`
                    : `❌ ${validationResult.message}`
                }
              />

              {validationResult.valid && validatedPayments && (
                <div className="mt-3 p-3 border-round border-1 surface-border">
                  <h5>Resumen de Pagos Validados:</h5>
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
                  <div className="flex justify-content-between mt-2 pt-2 border-top-1">
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
            <div className="flex justify-content-center align-items-center mt-3">
              <ProgressSpinner style={{ width: "30px", height: "30px" }} />
              <span className="ml-2">Procesando venta...</span>
            </div>
          )}

          {!validationResult && (
            <div className="mt-4 p-3 border-round border-1 surface-border bg-blue-50">
              <div className="flex align-items-center">
                <i className="pi pi-info-circle text-blue-500 mr-2"></i>
                <span>
                  Por favor valide los pagos antes de procesar la venta
                </span>
              </div>
            </div>
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
