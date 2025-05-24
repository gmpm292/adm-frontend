import React from 'react';
import { InputNumber } from 'primereact/inputnumber';

export const PaymentBreakdownEditor = ({ breakdown, onChange }) => {
  const handleChange = (field, value) => {
    onChange({
      ...breakdown,
      [field]: value
    });
  };

  return (
    <div className="p-fluid p-grid">
      <div className="p-col-12 p-md-3">
        <label>Salario Base</label>
        <InputNumber
          value={breakdown?.baseSalary || 0}
          onValueChange={(e) => handleChange('baseSalary', e.value)}
          mode="currency"
          currency={breakdown?.currency || 'USD'}
          locale="en-US"
        />
      </div>
      <div className="p-col-12 p-md-3">
        <label>Comisiones</label>
        <InputNumber
          value={breakdown?.commissions || 0}
          onValueChange={(e) => handleChange('commissions', e.value)}
          mode="currency"
          currency={breakdown?.currency || 'USD'}
          locale="en-US"
        />
      </div>
      <div className="p-col-12 p-md-3">
        <label>Bonificaciones</label>
        <InputNumber
          value={breakdown?.bonuses || 0}
          onValueChange={(e) => handleChange('bonuses', e.value)}
          mode="currency"
          currency={breakdown?.currency || 'USD'}
          locale="en-US"
        />
      </div>
      <div className="p-col-12 p-md-3">
        <label>Deducciones</label>
        <InputNumber
          value={breakdown?.deductions || 0}
          onValueChange={(e) => handleChange('deductions', e.value)}
          mode="currency"
          currency={breakdown?.currency || 'USD'}
          locale="en-US"
        />
      </div>
    </div>
  );
};