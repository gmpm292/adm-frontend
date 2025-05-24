import React from 'react';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';

const scopedAccessOptions = [
  { label: 'Business', value: 'BUSINESS' },
  { label: 'Oficina', value: 'OFFICE' },
  { label: 'Departamento', value: 'DEPARTMENT' },
  { label: 'Equipo', value: 'TEAM' },
  { label: 'Personal', value: 'PERSONAL' }
];

export const PriceRangeCondition = ({ condition, onChange, onRemove }) => {
  const handleChange = (field, value) => {
    onChange({
      ...condition,
      [field]: value
    });
  };

  return (
    <div className="p-fluid p-grid p-mt-2">
      <div className="p-col-12 p-md-3">
        <label>Mínimo*</label>
        <InputNumber
          value={condition.min}
          onValueChange={(e) => handleChange('min', e.value)}
          mode="currency"
          currency="USD"
          locale="en-US"
          required
        />
      </div>
      <div className="p-col-12 p-md-3">
        <label>Máximo</label>
        <InputNumber
          value={condition.max}
          onValueChange={(e) => handleChange('max', e.value)}
          mode="currency"
          currency="USD"
          locale="en-US"
        />
      </div>
      <div className="p-col-12 p-md-2">
        <label>Moneda*</label>
        <InputText
          value={condition.currency}
          onChange={(e) => handleChange('currency', e.target.value)}
          required
        />
      </div>
      <div className="p-col-12 p-md-2">
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
      <div className="p-col-12 p-md-2">
        <label>Ámbito*</label>
        <Dropdown
          value={condition.scope}
          options={scopedAccessOptions}
          onChange={(e) => handleChange('scope', e.value)}
          placeholder="Seleccione"
          required
        />
      </div>
      <div className="p-col-12 p-md-2 flex align-items-end">
        <Button
          icon="pi pi-trash"
          className="p-button-danger p-button-text"
          onClick={onRemove}
          tooltip="Eliminar condición"
        />
      </div>
    </div>
  );
};