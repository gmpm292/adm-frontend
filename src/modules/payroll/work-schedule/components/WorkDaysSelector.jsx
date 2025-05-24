import React from 'react';
import { Checkbox } from 'primereact/checkbox';
import { classNames } from 'primereact/utils';

export const WorkDaysSelector = ({ workingDays, onChange }) => {
  const days = [
    { label: 'Lunes', field: 'monday' },
    { label: 'Martes', field: 'tuesday' },
    { label: 'Miércoles', field: 'wednesday' },
    { label: 'Jueves', field: 'thursday' },
    { label: 'Viernes', field: 'friday' },
    { label: 'Sábado', field: 'saturday' },
    { label: 'Domingo', field: 'sunday' }
  ];

  const handleDayChange = (field, checked) => {
    onChange({
      ...workingDays,
      [field]: checked
    });
  };

  return (
    <div className="p-grid">
      {days.map((day) => (
        <div key={day.field} className="p-col-12 p-md-3">
          <div className="field-checkbox">
            <Checkbox
              inputId={day.field}
              checked={workingDays[day.field]}
              onChange={(e) => handleDayChange(day.field, e.checked)}
            />
            <label htmlFor={day.field}>{day.label}</label>
          </div>
        </div>
      ))}
    </div>
  );
};