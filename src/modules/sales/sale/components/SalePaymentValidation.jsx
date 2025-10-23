import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { useMutation } from "@apollo/client";
import { VALIDATE_SALE_PAYMENTS } from "../graphql/queries";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";
import { CurrencyAmountInput } from "../../../payroll/currency/components/CurrencyAmountInput";
import CurrencyDropdown from "../../../payroll/currency/components/CurrencyDropdown";

const paymentMethods = [
  { label: "Efectivo", value: "CASH" },
  { label: "Tarjeta", value: "CARD" },
  { label: "Transferencia", value: "TRANSFER" },
  { label: "Otro", value: "OTHER" },
];

export const SalePaymentValidation = ({
  saleId,
  visible,
  onHide,
  onValidationSuccess,
  baseCurrency = "USD",
}) => {
  const [payments, setPayments] = useState([
    { amount: 0, currency: "USD", paymentMethod: "CASH" },
  ]);
  const [selectedCurrencies, setSelectedCurrencies] = useState({});
  const [validationResult, setValidationResult] = useState(null);
  const [validating, setValidating] = useState(false);
  const toast = useRef(null);

  const [validatePayments] = useMutation(VALIDATE_SALE_PAYMENTS);

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

    // Actualizar la información de la moneda seleccionada
    if (currencyData) {
      setSelectedCurrencies((prev) => ({
        ...prev,
        [index]: currencyData,
      }));
    }

    // Limpiar resultado anterior cuando se modifiquen los pagos
    setValidationResult(null);
  };

  const handleCurrencyChange = (index, currencyCode, currencyData) => {
    const newPayments = [...payments];
    newPayments[index] = {
      ...newPayments[index],
      currency: currencyCode,
    };
    setPayments(newPayments);

    // Actualizar la información de la moneda seleccionada
    setSelectedCurrencies((prev) => ({
      ...prev,
      [index]: currencyData,
    }));

    // Limpiar resultado anterior cuando se modifiquen los pagos
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

  const handleValidate = async () => {
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
            saleId,
            payments,
            baseCurrency,
          },
        },
      });

      const result = data.validateSalePayments;
      setValidationResult(result);

      if (result.valid && onValidationSuccess) {
        onValidationSuccess(result, payments);
      }

      if (!result.valid) {
        toast.current.show({
          severity: "warn",
          summary: "Validación Fallida",
          detail: result.message,
          life: 5000,
        });
      } else {
        toast.current.show({
          severity: "success",
          summary: "Validación Exitosa",
          detail: `Pago válido. Total en ${baseCurrency}: ${result.totalInBaseCurrency.toFixed(
            2
          )}`,
          life: 3000,
        });
      }
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: err.message,
        life: 3000,
      });
    } finally {
      setValidating(false);
    }
  };

  const handleClose = () => {
    setPayments([{ amount: 0, currency: "USD", paymentMethod: "CASH" }]);
    setSelectedCurrencies({});
    setValidationResult(null);
    onHide();
  };

  const footer = (
    <div>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        onClick={handleClose}
        className="p-button-text"
      />
      <Button
        label="Validar Pago"
        icon="pi pi-check"
        onClick={handleValidate}
        disabled={validating}
      />
    </div>
  );

  const totalAmount = payments.reduce(
    (sum, payment) => sum + (payment.amount || 0),
    0
  );

  // Calcular total por moneda para mostrar en el resumen
  const totalsByCurrency = payments.reduce((acc, payment) => {
    if (payment.currency && payment.amount > 0) {
      acc[payment.currency] = (acc[payment.currency] || 0) + payment.amount;
    }
    return acc;
  }, {});

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header="Validar Pago de Venta"
        visible={visible}
        style={{ width: "750px" }}
        footer={footer}
        onHide={handleClose}
        modal
      >
        <div className="p-fluid">
          <div className="mb-4">
            <h4>Pagos</h4>
            <p className="text-sm text-color-secondary">
              Agregue los diferentes pagos que recibirá para esta venta
            </p>
          </div>

          {payments.map((payment, index) => (
            <div
              key={index}
              className="mb-4 p-3 border-round border-1 surface-border"
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
                  <label htmlFor={`amount-${index}`}>Monto y Moneda*</label>
                  <CurrencyAmountInput
                    amount={payment.amount}
                    onAmountChange={(amount, currencyData) =>
                      handleAmountChange(index, amount, currencyData)
                    }
                    currencyCode={payment.currency}
                    onCurrencyChange={(currencyCode, currencyData) =>
                      handleCurrencyChange(index, currencyCode, currencyData)
                    }
                    placeholder="Ingrese el monto"
                    showCurrencyDetails={true}
                    required
                    className="mb-2"
                  />
                </div>

                <div className="col-12 md:col-5">
                  <label htmlFor={`method-${index}`}>Método de Pago*</label>
                  <Dropdown
                    id={`method-${index}`}
                    value={payment.paymentMethod}
                    options={paymentMethods}
                    onChange={(e) => handlePaymentMethodChange(index, e.value)}
                    optionLabel="label"
                    placeholder="Seleccione método"
                    className="w-full"
                    required
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="mb-3">
            <Button
              icon="pi pi-plus"
              label="Agregar Otro Pago"
              onClick={handleAddPayment}
              className="p-button-outlined"
            />
          </div>

          {/* Resumen de pagos */}
          <div className="p-3 border-round border-1 surface-border bg-gray-50">
            <h5 className="mt-0 mb-3">Resumen de Pagos</h5>

            {/* Totales por moneda */}
            {Object.keys(totalsByCurrency).length > 0 && (
              <div className="mb-3">
                {Object.entries(totalsByCurrency).map(([currency, total]) => (
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
                ))}
              </div>
            )}

            {/* Total general */}
            <div className="flex justify-content-between align-items-center border-top-1 pt-2">
              <span className="font-bold">Total General:</span>
              <span className="font-bold text-xl">
                {totalAmount.toLocaleString("en-US", {
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

              {validationResult.valid && (
                <div className="mt-2 p-2 border-round bg-green-50 border-1 border-green-200">
                  <div className="text-sm text-green-700">
                    <div className="flex justify-content-between">
                      <span>Total validado en {baseCurrency}:</span>
                      <span className="font-bold">
                        {validationResult.totalInBaseCurrency.toLocaleString(
                          "en-US",
                          {
                            style: "currency",
                            currency: baseCurrency,
                          }
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {validating && (
            <div className="flex justify-content-center align-items-center mt-3">
              <ProgressSpinner style={{ width: "30px", height: "30px" }} />
              <span className="ml-2">Validando pagos...</span>
            </div>
          )}

          {/* Información adicional */}
          <div className="mt-3 p-2 border-round border-1 surface-border bg-blue-50">
            <div className="flex align-items-start">
              <i className="pi pi-info-circle text-blue-500 mr-2 mt-1"></i>
              <div className="text-sm text-blue-700">
                <p className="mt-0 mb-1">
                  <strong>Nota:</strong> El sistema validará que los pagos
                  cubran el total de la venta considerando las monedas aceptadas
                  por los productos.
                </p>
                <p className="m-0">
                  <strong>Moneda base:</strong> {baseCurrency}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};
