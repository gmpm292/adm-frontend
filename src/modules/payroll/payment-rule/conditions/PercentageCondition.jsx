import React from "react";
import { InputNumber } from "primereact/inputnumber";
import { FormField } from "../../../../components/ui";

export const PercentageCondition = ({ condition, onChange }) => {
  const handleChange = (field, value) => {
    onChange({
      ...condition,
      [field]: value,
    });
  };

  return (
    <div className="formgrid grid">
      <div className="col-12">
        <FormField label="Porcentaje" required>
          <InputNumber
            value={condition.percentage}
            onValueChange={(e) => handleChange("percentage", e.value)}
            suffix="%"
            min={0}
            max={100}
            required
          />
        </FormField>
      </div>
    </div>
  );
};
