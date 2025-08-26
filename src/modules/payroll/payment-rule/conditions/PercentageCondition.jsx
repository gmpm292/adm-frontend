import React from "react";
import { InputNumber } from "primereact/inputnumber";

export const PercentageCondition = ({ condition, onChange }) => {
  const handleChange = (field, value) => {
    onChange({
      ...condition,
      [field]: value,
    });
  };

  return (
    <div className="p-fluid p-grid">
      <div className="p-col-12">
        <label>Porcentaje*</label>
        <InputNumber
          value={condition.percentage}
          onValueChange={(e) => handleChange("percentage", e.value)}
          suffix="%"
          min={0}
          max={100}
          required
        />
      </div>
    </div>
  );
};
