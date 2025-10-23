import React, { useState } from "react";
import { Button } from "primereact/button";
import { SalePaymentValidation } from "./SalePaymentValidation";

export const ValidatePaymentButton = ({
  saleId,
  onValidationSuccess,
  label = "Validar Pago",
  icon = "pi pi-check-circle",
  size = "small",
  variant = "outlined",
  disabled = false,
  baseCurrency = "USD",
  tooltip = "Validar pagos para esta venta",
}) => {
  const [showDialog, setShowDialog] = useState(false);

  const handleValidationSuccess = (result, payments) => {
    setShowDialog(false);
    if (onValidationSuccess) {
      onValidationSuccess(result, payments);
    }
  };

  const getButtonClass = () => {
    const baseClass = `p-button-${size}`;
    if (variant === "outlined")
      return `p-button-outlined p-button-help ${baseClass}`;
    if (variant === "text") return `p-button-text p-button-help ${baseClass}`;
    return `p-button-help ${baseClass}`;
  };

  return (
    <>
      <Button
        label={label}
        icon={icon}
        className={getButtonClass()}
        onClick={() => setShowDialog(true)}
        disabled={disabled}
        tooltip={tooltip}
      />

      <SalePaymentValidation
        saleId={saleId}
        visible={showDialog}
        onHide={() => setShowDialog(false)}
        onValidationSuccess={handleValidationSuccess}
        baseCurrency={baseCurrency}
      />
    </>
  );
};
