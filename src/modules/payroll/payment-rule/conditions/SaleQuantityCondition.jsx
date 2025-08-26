import React from "react";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";

export const SaleQuantityCondition = React.memo(
  ({ condition, onChange, onRemove }) => {
    const handleChange = (field, value) => {
      onChange({ ...condition, [field]: value });
    };

    return (
      <div
        className="p-3 border-round surface-border border-1 mb-3 flex flex-wrap align-items-end gap-3"
        style={{ backgroundColor: "#f9f9f9" }}
      >
        {/* Campo Mínimo de Productos */}
        <div className="flex-1 min-w-12rem">
          <label className="block mb-1 font-medium">Mín. Productos*</label>
          <InputNumber
            value={condition.minProducts ?? 1}
            onValueChange={(e) => handleChange("minProducts", e.value)}
            min={1}
            required
            className="w-full"
          />
        </div>

        {/* Campo Tasa por Producto */}
        <div className="flex-1 min-w-12rem">
          <label className="block mb-1 font-medium">Tasa por Producto*</label>
          <InputNumber
            value={condition.ratePerProduct ?? 0}
            onValueChange={(e) => handleChange("ratePerProduct", e.value)}
            mode="currency"
            currency="USD"
            locale="en-US"
            required
            className="w-full"
          />
        </div>

        {/* Espaciador para alinear botón */}
        <div className="flex-1 min-w-12rem"></div>

        {/* Botón eliminar */}
        <div className="flex align-items-center justify-content-center">
          <Button
            icon="pi pi-trash"
            className="p-button-rounded p-button-danger p-button-outlined"
            onClick={onRemove}
            tooltip="Eliminar condición"
          />
        </div>
      </div>
    );
  }
);
