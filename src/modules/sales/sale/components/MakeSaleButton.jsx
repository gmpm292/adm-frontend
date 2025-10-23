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

  const getButtonClass = () => {
    const baseClass = `p-button-${size}`;
    if (variant === "outlined")
      return `p-button-outlined p-button-success ${baseClass}`;
    if (variant === "text")
      return `p-button-text p-button-success ${baseClass}`;
    return `p-button-success ${baseClass}`;
  };

  return (
    <>
      <Button
        label={label}
        icon={icon}
        className={getButtonClass()}
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
