import React from "react";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { FormField } from "../../../../components/ui";

export const PriceRangeCondition = React.memo(
  ({ condition, onChange, onRemove, currencyOptions, index }) => {
    const handleChange = (field, value) => {
      onChange({ ...condition, [field]: value });
    };

    // Moneda segura con valor por defecto
    const currency = condition.currency || "USD";

    return (
      <div className="formgrid grid align-items-end surface-50 border-1 surface-border border-round p-3 mb-3 mx-0">
        {/* Campo mínimo */}
        <div className="col-12 md:col-6 lg:col">
          <FormField label="Mínimo" required>
            <InputNumber
              value={condition.min ?? 0}
              onValueChange={(e) => handleChange("min", e.value)}
              mode="currency"
              currency={currency}
              locale="en-US"
              required
              className="w-full"
            />
          </FormField>
        </div>

        {/* Campo máximo */}
        <div className="col-12 md:col-6 lg:col">
          <FormField label="Máximo">
            <InputNumber
              value={condition.max ?? null}
              onValueChange={(e) => handleChange("max", e.value)}
              mode="currency"
              currency={currency}
              locale="en-US"
              className="w-full"
            />
          </FormField>
        </div>

        {/* Selector de moneda - visible en todos los rangos */}
        <div className="col-12 md:col-6 lg:col">
          <FormField label="Moneda" required>
            <Dropdown
              value={currency}
              options={currencyOptions}
              onChange={(e) => handleChange("currency", e.value)}
              placeholder="Seleccione"
              className="w-full"
              disabled={index > 0} // Deshabilitado para rangos que no son el primero
            />
          </FormField>
        </div>

        {/* Campo monto */}
        <div className="col-12 md:col-6 lg:col">
          <FormField label="Monto" required>
            <InputNumber
              value={condition.amount ?? 0}
              onValueChange={(e) => handleChange("amount", e.value)}
              mode="decimal"
              minFractionDigits={2}
              maxFractionDigits={2}
              required
              className="w-full"
            />
          </FormField>
        </div>

        {/* Botón eliminar */}
        <div className="col-fixed mb-3">
          <Button
            icon="pi pi-trash"
            rounded
            outlined
            severity="danger"
            onClick={onRemove}
            tooltip="Eliminar condición"
          />
        </div>
      </div>
    );
  }
);
