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

export const PercentageCondition = ({ condition, onChange }) => {
  const handleChange = (field, value) => {
    onChange({
      ...condition,
      [field]: value
    });
  };

  return (
    <div className="p-fluid p-grid">
      <div className="p-col-12 p-md-6">
        <label>Porcentaje*</label>
        <InputNumber
          value={condition.percentage}
          onValueChange={(e) => handleChange('percentage', e.value)}
          suffix="%"
          min={0}
          max={100}
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