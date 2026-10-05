import React from "react";
import { InputNumber } from "primereact/inputnumber";
import { FormField } from "../../../../components/ui";

export const FixedAmountCondition = ({ condition, onChange }) => {
  const handleChange = (field, value) => {
    onChange({
      ...condition,
      [field]: value,
    });
  };

  return (
    <div className="formgrid grid">
      <div className="col-12">
        <FormField label="Monto" required>
          <InputNumber
            value={condition.amount}
            onValueChange={(e) => handleChange("amount", e.value)}
            mode="currency"
            currency="USD"
            locale="en-US"
            required
          />
        </FormField>
      </div>
    </div>
  );
};
