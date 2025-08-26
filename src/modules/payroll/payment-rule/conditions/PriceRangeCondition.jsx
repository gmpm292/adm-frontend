import React from "react";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";

export const PriceRangeCondition = React.memo(
  ({ condition, onChange, onRemove, currencyOptions, index }) => {
    const handleChange = (field, value) => {
      onChange({ ...condition, [field]: value });
    };

    // Moneda segura con valor por defecto
    const currency = condition.currency || "USD";

    return (
      <div
        className="p-3 border-round surface-border border-1 mb-3 flex flex-wrap align-items-end gap-3"
        style={{ backgroundColor: "#f9f9f9" }}
      >
        {/* Campo mínimo */}
        <div className="flex-1 min-w-12rem">
          <label className="block mb-1 font-medium">Mínimo*</label>
          <InputNumber
            value={condition.min ?? 0}
            onValueChange={(e) => handleChange("min", e.value)}
            mode="currency"
            currency={currency}
            locale="en-US"
            required
            className="w-full"
          />
        </div>

        {/* Campo máximo */}
        <div className="flex-1 min-w-12rem">
          <label className="block mb-1 font-medium">Máximo</label>
          <InputNumber
            value={condition.max ?? null}
            onValueChange={(e) => handleChange("max", e.value)}
            mode="currency"
            currency={currency}
            locale="en-US"
            className="w-full"
          />
        </div>

        {/* Selector de moneda - visible en todos los rangos */}
        <div className="flex-1 min-w-8rem">
          <label className="block mb-1 font-medium">Moneda*</label>
          <Dropdown
            value={currency}
            options={currencyOptions}
            onChange={(e) => handleChange("currency", e.value)}
            placeholder="Seleccione"
            className="w-full"
            disabled={index > 0} // Deshabilitado para rangos que no son el primero
          />
        </div>

        {/* Campo monto */}
        <div className="flex-1 min-w-10rem">
          <label className="block mb-1 font-medium">Monto*</label>
          <InputNumber
            value={condition.amount ?? 0}
            onValueChange={(e) => handleChange("amount", e.value)}
            mode="decimal"
            minFractionDigits={2}
            maxFractionDigits={2}
            required
            className="w-full"
          />
        </div>

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
