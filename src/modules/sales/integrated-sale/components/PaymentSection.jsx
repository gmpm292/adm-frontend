import React, { useState, useRef } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";
import { Dialog } from "primereact/dialog";
import { Calendar } from "primereact/calendar";
import { useMutation } from "@apollo/client";
import { CurrencyAmountInput } from "../../../payroll/currency/components/CurrencyAmountInput";
import { VALIDATE_SALE_PAYMENTS, MAKE_SALE } from "../../sale/graphql/queries";

const paymentMethods = [
  { label: "Efectivo", value: "CASH" },
  { label: "Tarjeta", value: "CARD" },
  { label: "Transferencia", value: "TRANSFER" },
  { label: "Otro", value: "OTHER" },
];

export const PaymentSection = ({
  saleId,
  totalAmount,
  baseCurrency = "USD",
  onPaymentValidated,
  onBack,
  onSaleCompleted,
}) => {
  const [payments, setPayments] = useState([
    { amount: 0, currency: "USD", paymentMethod: "CASH" },
  ]);
  const [selectedCurrencies, setSelectedCurrencies] = useState({});
  const [validationResult, setValidationResult] = useState(null);
  const [validating, setValidating] = useState(false);
  const [saleCompleted, setSaleCompleted] = useState(false);
  const [showMakeSaleDialog, setShowMakeSaleDialog] = useState(false);
  const [customDate, setCustomDate] = useState(null);
  const [processingSale, setProcessingSale] = useState(false);
  const toast = useRef(null);

  const [validatePayments] = useMutation(VALIDATE_SALE_PAYMENTS);
  const [makeSale] = useMutation(MAKE_SALE);

  const handleAddPayment = () => {
    setPayments([
      ...payments,
      { amount: 0, currency: "USD", paymentMethod: "CASH" },
    ]);
  };

  const handleRemovePayment = (index) => {
    if (payments.length > 1) {
      const newPayments = payments.filter((_, i) => i !== index);
      const newSelectedCurrencies = { ...selectedCurrencies };
      delete newSelectedCurrencies[index];
      setPayments(newPayments);
      setSelectedCurrencies(newSelectedCurrencies);
    }
  };

  const handleAmountChange = (index, amount, currencyData) => {
    const newPayments = [...payments];
    newPayments[index] = {
      ...newPayments[index],
      amount: amount || 0,
    };
    setPayments(newPayments);

    if (currencyData) {
      setSelectedCurrencies((prev) => ({
        ...prev,
        [index]: currencyData,
      }));
    }

    setValidationResult(null);
  };

  const handleCurrencyChange = (index, currencyCode, currencyData) => {
    const newPayments = [...payments];
    newPayments[index] = {
      ...newPayments[index],
      currency: currencyCode,
    };
    setPayments(newPayments);

    setSelectedCurrencies((prev) => ({
      ...prev,
      [index]: currencyData,
    }));

    setValidationResult(null);
  };

  const handlePaymentMethodChange = (index, paymentMethod) => {
    const newPayments = [...payments];
    newPayments[index] = {
      ...newPayments[index],
      paymentMethod,
    };
    setPayments(newPayments);
    setValidationResult(null);
  };

  const handleValidatePayments = async () => {
    try {
      setValidating(true);
      setValidationResult(null);

      // Validar que todos los montos sean mayores a 0
      const invalidPayments = payments.filter((p) => p.amount <= 0);
      if (invalidPayments.length > 0) {
        throw new Error("Todos los montos de pago deben ser mayores a 0");
      }

      // Validar que todas las monedas estén seleccionadas
      const paymentsWithoutCurrency = payments.filter((p) => !p.currency);
      if (paymentsWithoutCurrency.length > 0) {
        throw new Error("Todas las monedas deben estar seleccionadas");
      }

      const { data } = await validatePayments({
        variables: {
          validateSalePaymentsInput: {
            saleId: parseInt(saleId),
            payments,
            baseCurrency,
          },
        },
      });

      const result = data.validateSalePayments;
      setValidationResult(result);

      if (result.valid) {
        toast.current.show({
          severity: "success",
          summary: "Validación Exitosa",
          detail: `Pago válido. Total en ${baseCurrency}: ${result.totalInBaseCurrency.toFixed(
            2
          )}`,
          life: 5000,
        });

        if (onPaymentValidated) {
          onPaymentValidated(result, payments);
        }

        // Abrir el diálogo para realizar la venta
        setShowMakeSaleDialog(true);
      } else {
        toast.current.show({
          severity: "warn",
          summary: "Validación Fallida",
          detail: result.message,
          life: 5000,
        });
      }
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: err.message,
        life: 5000,
      });
    } finally {
      setValidating(false);
    }
  };

  const handleProcessSale = async () => {
    if (!validationResult?.valid) {
      toast.current.show({
        severity: "warn",
        summary: "Validación Requerida",
        detail: "Por favor valide los pagos primero",
        life: 3000,
      });
      return;
    }

    try {
      setProcessingSale(true);

      const { data } = await makeSale({
        variables: {
          makeSaleInput: {
            saleId: parseInt(saleId),
            payments: payments,
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
      setValidationResult(null);
      setCustomDate(null);
      setShowMakeSaleDialog(false);
      setSaleCompleted(true);

      if (onSaleCompleted) {
        onSaleCompleted(data.makeSale);
      }
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: err.message,
        life: 3000,
      });
    } finally {
      setProcessingSale(false);
    }
  };

  const handleNewSale = () => {
    setPayments([{ amount: 0, currency: "USD", paymentMethod: "CASH" }]);
    setSelectedCurrencies({});
    setValidationResult(null);
    setSaleCompleted(false);
    setCustomDate(null);
    if (onPaymentValidated) {
      onPaymentValidated(null, null, true);
    }
  };

  const handleCloseMakeSaleDialog = () => {
    setShowMakeSaleDialog(false);
    setCustomDate(null);
  };

  const totalPayments = payments.reduce(
    (sum, payment) => sum + (payment.amount || 0),
    0
  );

  const totalsByCurrency = payments.reduce((acc, payment) => {
    if (payment.currency && payment.amount > 0) {
      acc[payment.currency] = (acc[payment.currency] || 0) + payment.amount;
    }
    return acc;
  }, {});

  // Diálogo para realizar la venta
  const makeSaleDialogFooter = (
    <div className="flex justify-content-between align-items-center">
      <div>
        <Button
          label="Cancelar"
          icon="pi pi-times"
          onClick={handleCloseMakeSaleDialog}
          className="p-button-text"
        />
      </div>
      <div className="flex gap-2">
        <Button
          label="Procesar Venta"
          icon="pi pi-shopping-cart"
          onClick={handleProcessSale}
          disabled={processingSale || !validationResult?.valid}
          loading={processingSale}
        />
      </div>
    </div>
  );

  return (
    <div className="payment-section">
      <Toast ref={toast} />
      <Card title="Paso 4: Procesar Pago">
        <div className="payment-content">
          {!saleCompleted ? (
            <>
              <div className="payment-instructions mb-4">
                <div className="p-message p-message-info">
                  <div className="p-message-wrapper">
                    <span className="p-message-icon pi pi-info-circle"></span>
                    <div className="p-message-content">
                      <p>
                        <strong>Información del pago:</strong>
                        <br />
                        Total de la venta:{" "}
                        <strong>
                          ${totalAmount.toFixed(2)} {baseCurrency}
                        </strong>
                        <br />
                        Ingrese los pagos recibidos del cliente. Puede agregar
                        múltiples pagos en diferentes monedas.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="payments-list">
                <h4>Pagos Recibidos</h4>

                {payments.map((payment, index) => (
                  <div
                    key={index}
                    className="payment-item mb-4 p-3 border-round border-1 surface-border"
                  >
                    <div className="flex justify-content-between align-items-center mb-3">
                      <h5 className="m-0">Pago {index + 1}</h5>
                      {payments.length > 1 && (
                        <Button
                          icon="pi pi-times"
                          className="p-button-danger p-button-text p-button-sm"
                          onClick={() => handleRemovePayment(index)}
                          tooltip="Eliminar pago"
                        />
                      )}
                    </div>

                    <div className="grid">
                      <div className="col-12 md:col-7">
                        <div className="p-field">
                          <label htmlFor={`amount-${index}`}>
                            Monto y Moneda *
                          </label>
                          <CurrencyAmountInput
                            amount={payment.amount}
                            onAmountChange={(amount, currencyData) =>
                              handleAmountChange(index, amount, currencyData)
                            }
                            currencyCode={payment.currency}
                            onCurrencyChange={(currencyCode, currencyData) =>
                              handleCurrencyChange(
                                index,
                                currencyCode,
                                currencyData
                              )
                            }
                            placeholder="Ingrese el monto"
                            showCurrencyDetails={false}
                            required
                          />
                        </div>
                      </div>

                      <div className="col-12 md:col-5">
                        <div className="p-field">
                          <label htmlFor={`method-${index}`}>
                            Método de Pago *
                          </label>
                          <Dropdown
                            id={`method-${index}`}
                            value={payment.paymentMethod}
                            options={paymentMethods}
                            onChange={(e) =>
                              handlePaymentMethodChange(index, e.value)
                            }
                            optionLabel="label"
                            placeholder="Seleccione método"
                            className="w-full"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="mb-4">
                  <Button
                    icon="pi pi-plus"
                    label="Agregar Otro Pago"
                    onClick={handleAddPayment}
                    className="p-button-outlined"
                  />
                </div>

                {/* Resumen de pagos */}
                <div className="payment-summary p-3 border-round border-1 surface-border bg-gray-50">
                  <h5 className="mt-0 mb-3">Resumen de Pagos Ingresados</h5>

                  {Object.keys(totalsByCurrency).length > 0 && (
                    <div className="mb-3">
                      {Object.entries(totalsByCurrency).map(
                        ([currency, total]) => (
                          <div
                            key={currency}
                            className="flex justify-content-between mb-1"
                          >
                            <span>Total en {currency}:</span>
                            <span className="font-medium">
                              {total.toLocaleString("en-US", {
                                style: "currency",
                                currency: currency,
                              })}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  <div className="flex justify-content-between align-items-center border-top-1 pt-2">
                    <span className="font-bold">Total General:</span>
                    <span className="font-bold text-xl">
                      {totalPayments.toLocaleString("en-US", {
                        style: "currency",
                        currency: payments[0]?.currency || "USD",
                      })}
                    </span>
                  </div>
                </div>

                {validationResult && (
                  <div className="mt-4">
                    <Message
                      severity={validationResult.valid ? "success" : "error"}
                      text={
                        validationResult.valid
                          ? `✅ Pago válido. Total en ${baseCurrency}: ${validationResult.totalInBaseCurrency.toFixed(
                              2
                            )}`
                          : `❌ ${validationResult.message}`
                      }
                    />
                  </div>
                )}

                {validating && (
                  <div className="flex justify-content-center align-items-center mt-3">
                    <ProgressSpinner
                      style={{ width: "30px", height: "30px" }}
                    />
                    <span className="ml-2">Validando pagos...</span>
                  </div>
                )}

                <div className="payment-actions mt-4">
                  <div className="flex justify-content-between align-items-center">
                    <Button
                      label="Volver"
                      icon="pi pi-arrow-left"
                      className="p-button-text"
                      onClick={onBack}
                    />

                    <div className="flex gap-2">
                      <Button
                        label="Validar Pago"
                        icon="pi pi-check-circle"
                        className="p-button-success"
                        onClick={handleValidatePayments}
                        disabled={validating || totalPayments === 0}
                        loading={validating}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="sale-completed">
              <div className="success-message text-center">
                <i className="pi pi-check-circle text-green-500 text-6xl mb-3"></i>
                <h3 className="text-green-600 mb-2">¡Venta Completada!</h3>
                <p className="text-gray-600 mb-4">
                  El pago ha sido validado exitosamente y la venta ha sido
                  procesada.
                </p>

                {validationResult && (
                  <div className="completion-details p-4 border-round bg-green-50 border-1 border-green-200 mb-4">
                    <h4 className="mt-0 mb-3">Resumen Final</h4>
                    <div className="grid">
                      <div className="col-6">
                        <strong>Total Venta:</strong>
                      </div>
                      <div className="col-6 text-right">
                        ${totalAmount.toFixed(2)} {baseCurrency}
                      </div>

                      <div className="col-6">
                        <strong>Total Pagado:</strong>
                      </div>
                      <div className="col-6 text-right">
                        ${validationResult.totalInBaseCurrency.toFixed(2)}{" "}
                        {baseCurrency}
                      </div>

                      {validationResult.totalInBaseCurrency > totalAmount && (
                        <>
                          <div className="col-6">
                            <strong>Cambio:</strong>
                          </div>
                          <div className="col-6 text-right text-green-600">
                            $
                            {(
                              validationResult.totalInBaseCurrency - totalAmount
                            ).toFixed(2)}{" "}
                            {baseCurrency}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  label="Nueva Venta"
                  icon="pi pi-plus"
                  className="p-button-primary"
                  onClick={handleNewSale}
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Diálogo para realizar la venta */}
      <Dialog
        header="Realizar Venta"
        visible={showMakeSaleDialog}
        style={{ width: "600px" }}
        footer={makeSaleDialogFooter}
        onHide={handleCloseMakeSaleDialog}
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

              {validationResult.valid && (
                <div className="mt-3 p-3 border-round border-1 surface-border">
                  <h5>Resumen de Pagos Validados:</h5>
                  {payments.map((payment, index) => (
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
                    <span className="font-bold">Total en {baseCurrency}:</span>
                    <span className="font-bold text-lg">
                      ${validationResult.totalInBaseCurrency.toFixed(2)}{" "}
                      {baseCurrency}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {processingSale && (
            <div className="flex justify-content-center align-items-center mt-3">
              <ProgressSpinner style={{ width: "30px", height: "30px" }} />
              <span className="ml-2">Procesando venta...</span>
            </div>
          )}

          {!validationResult?.valid && (
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
    </div>
  );
};
