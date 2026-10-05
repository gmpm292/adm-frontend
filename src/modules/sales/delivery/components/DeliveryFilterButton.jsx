import React from "react";
import { Button } from "primereact/button";

export const DeliveryFilterButton = ({ 
  isActive = false, 
  onToggle, 
  label = "Pendientes",
  icon = "pi pi-filter",
  tooltip = "Filtrar mensajerías pendientes"
}) => {
  return (
    <Button
      icon={icon}
      label={label}
      size="small"
      severity="warning"
      outlined={!isActive}
      onClick={onToggle}
      tooltip={tooltip}
      tooltipOptions={{ position: "top" }}
    />
  );
};