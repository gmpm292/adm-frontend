import React, { useState } from "react";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { MultiSelect } from "primereact/multiselect";
import { FormField } from "../../../../components/ui";

interface AttendanceFiltersProps {
  onFilterChange: (filters: any) => void;
  initialFilters?: any;
}

export const AttendanceFilters: React.FC<AttendanceFiltersProps> = ({
  onFilterChange,
  initialFilters = {},
}) => {
  const [filters, setFilters] = useState({
    dateRange: initialFilters.dateRange || null,
    status: initialFilters.status || null,
    workerName: initialFilters.workerName || "",
    department: initialFilters.department || null,
    isPaid: initialFilters.isPaid || null,
    ...initialFilters,
  });

  const statusOptions = [
    { label: "Presente", value: "present" },
    { label: "Ausente", value: "absent" },
    { label: "Tardío", value: "late" },
    { label: "Salida Temprana", value: "early_departure" },
    { label: "Vacaciones", value: "vacation" },
    { label: "Enfermedad", value: "sick_leave" },
  ];

  const paidOptions = [
    { label: "Pagado", value: true },
    { label: "No Pagado", value: false },
  ];

  const departmentOptions = [
    { label: "Ventas", value: "sales" },
    { label: "Marketing", value: "marketing" },
    { label: "TI", value: "it" },
    { label: "RRHH", value: "hr" },
    { label: "Finanzas", value: "finance" },
  ];

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      dateRange: null,
      status: null,
      workerName: "",
      department: null,
      isPaid: null,
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div className="surface-card border-1 surface-border border-round p-3 mb-4">
      <div className="formgrid grid align-items-end">
        <div className="col-12 md:col-3">
          <FormField label="Rango de Fechas" htmlFor="dateRange">
            <Calendar
              id="dateRange"
              value={filters.dateRange}
              onChange={(e) => handleFilterChange("dateRange", e.value)}
              selectionMode="range"
              readOnlyInput
              dateFormat="dd/mm/yy"
              placeholder="Seleccione rango"
              className="w-full"
              showIcon
            />
          </FormField>
        </div>

        <div className="col-12 md:col-2">
          <FormField label="Estado" htmlFor="status">
            <Dropdown
              id="status"
              value={filters.status}
              options={statusOptions}
              onChange={(e) => handleFilterChange("status", e.value)}
              placeholder="Todos"
              className="w-full"
            />
          </FormField>
        </div>

        <div className="col-12 md:col-2">
          <FormField label="Trabajador" htmlFor="workerName">
            <InputText
              id="workerName"
              value={filters.workerName}
              onChange={(e) => handleFilterChange("workerName", e.target.value)}
              placeholder="Nombre..."
              className="w-full"
            />
          </FormField>
        </div>

        <div className="col-12 md:col-2">
          <FormField label="Departamento" htmlFor="department">
            <MultiSelect
              id="department"
              value={filters.department}
              options={departmentOptions}
              onChange={(e) => handleFilterChange("department", e.value)}
              placeholder="Todos"
              className="w-full"
              maxSelectedLabels={2}
            />
          </FormField>
        </div>

        <div className="col-12 md:col-2">
          <FormField label="Estado de Pago" htmlFor="isPaid">
            <Dropdown
              id="isPaid"
              value={filters.isPaid}
              options={paidOptions}
              onChange={(e) => handleFilterChange("isPaid", e.value)}
              placeholder="Todos"
              className="w-full"
            />
          </FormField>
        </div>

        <div className="col-12 md:col-1 mb-3">
          <Button
            icon="pi pi-filter-slash"
            label="Limpiar"
            onClick={handleClearFilters}
            outlined
            className="w-full"
            severity="secondary"
          />
        </div>
      </div>
    </div>
  );
};

export default AttendanceFilters;
