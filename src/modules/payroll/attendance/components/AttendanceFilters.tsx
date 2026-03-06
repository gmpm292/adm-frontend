import React, { useState } from "react";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { MultiSelect } from "primereact/multiselect";

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
    <div className="card p-fluid mb-4">
      <div className="grid p-fluid">
        <div className="col-12 md:col-3">
          <label htmlFor="dateRange" className="block text-sm font-medium mb-2">
            Rango de Fechas
          </label>
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
        </div>

        <div className="col-12 md:col-2">
          <label htmlFor="status" className="block text-sm font-medium mb-2">
            Estado
          </label>
          <Dropdown
            id="status"
            value={filters.status}
            options={statusOptions}
            onChange={(e) => handleFilterChange("status", e.value)}
            placeholder="Todos"
            className="w-full"
          />
        </div>

        <div className="col-12 md:col-2">
          <label
            htmlFor="workerName"
            className="block text-sm font-medium mb-2"
          >
            Trabajador
          </label>
          <InputText
            id="workerName"
            value={filters.workerName}
            onChange={(e) => handleFilterChange("workerName", e.target.value)}
            placeholder="Nombre..."
            className="w-full"
          />
        </div>

        <div className="col-12 md:col-2">
          <label
            htmlFor="department"
            className="block text-sm font-medium mb-2"
          >
            Departamento
          </label>
          <MultiSelect
            id="department"
            value={filters.department}
            options={departmentOptions}
            onChange={(e) => handleFilterChange("department", e.value)}
            placeholder="Todos"
            className="w-full"
            maxSelectedLabels={2}
          />
        </div>

        <div className="col-12 md:col-2">
          <label htmlFor="isPaid" className="block text-sm font-medium mb-2">
            Estado de Pago
          </label>
          <Dropdown
            id="isPaid"
            value={filters.isPaid}
            options={paidOptions}
            onChange={(e) => handleFilterChange("isPaid", e.value)}
            placeholder="Todos"
            className="w-full"
          />
        </div>

        <div className="col-12 md:col-1 flex align-items-end">
          <Button
            icon="pi pi-filter-slash"
            label="Limpiar"
            onClick={handleClearFilters}
            className="p-button-outlined w-full"
            severity="secondary"
          />
        </div>
      </div>
    </div>
  );
};

export default AttendanceFilters;
