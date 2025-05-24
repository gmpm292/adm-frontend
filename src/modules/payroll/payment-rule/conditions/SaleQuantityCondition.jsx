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

export const SaleQuantityCondition = ({ condition, onChange, onRemove }) => {
  const handleChange = (field, value) => {
    onChange({
      ...condition,
      [field]: value
    });
  };

  return (
    <div className="p-fluid p-grid p-mt-2">
      <div className="p-col-12 p-md-4">
        <label>Mín. Productos*</label>
        <InputNumber
          value={condition.minProducts}
          onValueChange={(e) => handleChange('minProducts', e.value)}
          min={1}
          required
        />
      </div>
      <div className="p-col-12 p-md-4">
        <label>Tasa por Producto*</label>
        <InputNumber
          value={condition.ratePerProduct}
          onValueChange={(e) => handleChange('ratePerProduct', e.value)}
          mode="currency"
          currency="USD"
          locale="en-US"
          required
        />
      </div>
      <div className="p-col-12 p-md-3">
        <label>Ámbito*</label>
        <Dropdown
          value={condition.scope}
          options={scopedAccessOptions}
          onChange={(e) => handleChange('scope', e.value)}
          placeholder="Seleccione"
          required
        />
      </div>
      <div className="p-col-12 p-md-1 flex align-items-end">
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