import React from 'react';
import { InputNumber } from 'primereact/inputnumber';
import { FormField } from '../../../../components/ui';

export const PaymentBreakdownEditor = ({ breakdown, onChange }) => {
  const handleChange = (field, value) => {
    onChange({
      ...breakdown,
      [field]: value
    });
  };

  return (
    <div className="formgrid grid">
      <div className="col-12 md:col-6 lg:col-3">
        <FormField label="Salario Base">
          <InputNumber
            value={breakdown?.baseSalary || 0}
            onValueChange={(e) => handleChange('baseSalary', e.value)}
            mode="currency"
            currency={breakdown?.currency || 'USD'}
            locale="en-US"
          />
        </FormField>
      </div>
      <div className="col-12 md:col-6 lg:col-3">
        <FormField label="Comisiones">
          <InputNumber
            value={breakdown?.commissions || 0}
            onValueChange={(e) => handleChange('commissions', e.value)}
            mode="currency"
            currency={breakdown?.currency || 'USD'}
            locale="en-US"
          />
        </FormField>
      </div>
      <div className="col-12 md:col-6 lg:col-3">
        <FormField label="Bonificaciones">
          <InputNumber
            value={breakdown?.bonuses || 0}
            onValueChange={(e) => handleChange('bonuses', e.value)}
            mode="currency"
            currency={breakdown?.currency || 'USD'}
            locale="en-US"
          />
        </FormField>
      </div>
      <div className="col-12 md:col-6 lg:col-3">
        <FormField label="Deducciones">
          <InputNumber
            value={breakdown?.deductions || 0}
            onValueChange={(e) => handleChange('deductions', e.value)}
            mode="currency"
            currency={breakdown?.currency || 'USD'}
            locale="en-US"
          />
        </FormField>
      </div>
    </div>
  );
};