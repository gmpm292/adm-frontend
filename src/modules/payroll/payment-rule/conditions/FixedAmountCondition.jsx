import React from "react";
import { InputNumber } from "primereact/inputnumber";

export const FixedAmountCondition = ({ condition, onChange }) => {
  const handleChange = (field, value) => {
    onChange({
      ...condition,
      [field]: value,
    });
  };

  return (
    <div className="p-fluid p-grid">
      <div className="p-col-12">
        <label>Monto*</label>
        <InputNumber
          value={condition.amount}
          onValueChange={(e) => handleChange("amount", e.value)}
          mode="currency"
          currency="USD"
          locale="en-US"
          required
        />
      </div>
    </div>
  );
};
