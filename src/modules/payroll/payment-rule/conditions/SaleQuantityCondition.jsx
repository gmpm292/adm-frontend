import React from "react";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { FormField } from "../../../../components/ui";

export const SaleQuantityCondition = React.memo(
  ({ condition, onChange, onRemove }) => {
    const handleChange = (field, value) => {
      onChange({ ...condition, [field]: value });
    };

    return (
      <div className="formgrid grid align-items-end surface-50 border-1 surface-border border-round p-3 mb-3 mx-0">
        {/* Campo Mínimo de Productos */}
        <div className="col-12 md:col">
          <FormField label="Mín. Productos" required>
            <InputNumber
              value={condition.minProducts ?? 1}
              onValueChange={(e) => handleChange("minProducts", e.value)}
              min={1}
              required
              className="w-full"
            />
          </FormField>
        </div>

        {/* Campo Tasa por Producto */}
        <div className="col-12 md:col">
          <FormField label="Tasa por Producto" required>
            <InputNumber
              value={condition.ratePerProduct ?? 0}
              onValueChange={(e) => handleChange("ratePerProduct", e.value)}
              mode="currency"
              currency="USD"
              locale="en-US"
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
