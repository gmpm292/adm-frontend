import React, { useState } from "react";
import { Button } from "primereact/button";
import { MakeSaleComponent } from "./MakeSaleComponent";

export const MakeSaleButton = ({
  saleId,
  onSuccess,
  label = "Realizar Venta",
  icon = "pi pi-shopping-cart",
  size = "small",
  variant = "outlined",
  disabled = false,
}) => {
  const [showDialog, setShowDialog] = useState(false);

  const handleSuccess = (sale) => {
    setShowDialog(false);
    if (onSuccess) {
      onSuccess(sale);
    }
  };

  return (
    <>
      <Button
        label={label}
        icon={icon}
        size={variant === "text" ? undefined : size}
        severity="success"
        outlined={variant === "outlined"}
        text={variant === "text"}
        rounded={variant === "text"}
        onClick={() => setShowDialog(true)}
        disabled={disabled}
        tooltip="Procesar y finalizar la venta"
      />

      <MakeSaleComponent
        saleId={saleId}
        visible={showDialog}
        onHide={() => setShowDialog(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
};
