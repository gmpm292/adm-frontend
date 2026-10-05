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

  return (
    <>
      <Button
        label={label}
        icon={icon}
        size={variant === "text" ? undefined : size}
        severity="help"
        outlined={variant === "outlined"}
        text={variant === "text"}
        rounded={variant === "text"}
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
