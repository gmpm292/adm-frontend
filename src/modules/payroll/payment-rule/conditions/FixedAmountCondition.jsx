import React from 'react';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';

const scopedAccessOptions = [
  { label: 'Business', value: 'BUSINESS' },
  { label: 'Oficina', value: 'OFFICE' },
  { label: 'Departamento', value: 'DEPARTMENT' },
  { label: 'Equipo', value: 'TEAM' },
  { label: 'Personal', value: 'PERSONAL' }
];

export const FixedAmountCondition = ({ condition, onChange }) => {
  const handleChange = (field, value) => {
    onChange({
      ...condition,
      [field]: value
    });
  };

  return (
    <div className="p-fluid p-grid">
      <div className="p-col-12 p-md-6">
        <label>Monto*</label>
        <InputNumber
          value={condition.amount}
          onValueChange={(e) => handleChange('amount', e.value)}
          mode="currency"
          currency="USD"
          locale="en-US"
          required
        />
      </div>
      <div className="p-col-12 p-md-6">
        <label>Ámbito*</label>
        <Dropdown
          value={condition.scope}
          options={scopedAccessOptions}
          onChange={(e) => handleChange('scope', e.value)}
          placeholder="Seleccione"
          required
        />
      </div>
    </div>
  );
};