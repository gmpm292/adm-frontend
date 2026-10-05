import React from 'react';
import { Checkbox } from 'primereact/checkbox';

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
    <div className="grid">
      {days.map((day) => (
        <div key={day.field} className="col-6 md:col-3">
          <div className="flex align-items-center gap-2">
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