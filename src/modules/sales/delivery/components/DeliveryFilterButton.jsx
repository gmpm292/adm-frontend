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
      className={`p-button-sm ${isActive ? 'p-button-warning' : 'p-button-outlined p-button-warning'}`}
      onClick={onToggle}
      tooltip={tooltip}
      tooltipOptions={{ position: "top" }}
    />
  );
};