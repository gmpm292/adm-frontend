import React from "react";
import { Panel } from "primereact/panel";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { CategorySelector } from "../../../../category/components/CategorySelector";
import MaterialCostDropdown from "../../../../../payroll/material-cost/components/MaterialCostDropdown";
import UnitOfMeasureDropdown from "../../../../unit-of-measure/components/UnitOfMeasureDropdown";

export const BasicInfoPanel = ({
  formData,
  openPanel,
  handleToggle,
  handleChange,
  handleCategorySelect,
  handleUnitOfMeasureChange,
  handleMaterialCostChange,
  handleSecurityEntitiesChange,
}) => {
  const [hasWarranty, setHasWarranty] = React.useState(() => {
    return !!formData.warranty;
  });

  const [warrantyValue, setWarrantyValue] = React.useState(() => {
    const parts = formData.warranty?.split(" ") ?? ["1", "días"];
    return parseInt(parts[0]) || 1;
  });

  const [warrantyUnit, setWarrantyUnit] = React.useState(() => {
    const parts = formData.warranty?.split(" ") ?? ["1", "días"];
    return parts[1] || "días";
  });

  const unidades = [
    { label: "Días", value: "días" },
    { label: "Meses", value: "meses" },
    { label: "Años", value: "años" },
  ];

  // Actualizar el valor de warranty en formData
  React.useEffect(() => {
    const nuevaGarantia = hasWarranty ? `${warrantyValue} ${warrantyUnit}` : "";
    handleChange({ target: { name: "warranty", value: nuevaGarantia } });
  }, [hasWarranty, warrantyValue, warrantyUnit]);

  // Calcular máximo según unidad seleccionada
  const getMaxValue = () => {
    switch (warrantyUnit) {
      case "días":
        return 365;
      case "meses":
        return 24;
      case "años":
        return 5;
      default:
        return 365;
    }
  };

  // Manejar selección de categoría y extraer las entidades de seguridad
  const handleCategorySelection = (category) => {
    const securityEntities = {
      businessId: category?.business?.id || null,
      officeId: category?.office?.id || null,
      departmentId: category?.department?.id || null,
      teamId: category?.team?.id || null,
    };

    handleCategorySelect(category.id);
    handleSecurityEntitiesChange(securityEntities);

    // Auto-completar el campo "Nombre" con el nombre de la categoría seleccionada
    // Solo si el campo "Nombre" está vacío
    if (!formData.name) {
      handleChange({ target: { name: "name", value: category.name } });
    }
  };

  return (
    <Panel
      header="Información Básica"
      toggleable
      collapsed={openPanel !== 0}
      onToggle={handleToggle}
    >
      <div className="p-grid p-fluid">
        <div className="p-col-12 p-md-6">
          <div className="p-field">
            <label htmlFor="categoryId">Categoría*</label>
            <CategorySelector
              onCategorySelect={handleCategorySelection}
              selectedCategoryId={formData.categoryId}
            />
          </div>
        </div>
        <div className="p-col-12 p-md-6">
          <div className="p-field">
            <label htmlFor="name">Nombre*</label>
            <InputText
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="p-col-12 p-md-6">
          <div className="p-field">
            <label htmlFor="unitOfMeasureId">Unidad de Medida*</label>
            <UnitOfMeasureDropdown
              value={formData.unitOfMeasureId}
              onChange={handleUnitOfMeasureChange}
              placeholder="Seleccione unidad de medida"
              required
            />
          </div>
        </div>
        <div className="p-col-12 p-md-6">
          <div className="p-field">
            <label htmlFor="materialCostId">Material (Costo)</label>
            <MaterialCostDropdown
              value={formData.materialCostId}
              onChange={handleMaterialCostChange}
              placeholder="Seleccione material (opcional)"
              showClear
            />
          </div>
        </div>
        <div className="p-col-12 p-md-6">
          <div className="p-field">
            <div className="flex align-items-center mb-2">
              <Checkbox
                inputId="hasWarranty"
                checked={hasWarranty}
                onChange={(e) => setHasWarranty(e.checked)}
              />
              <label htmlFor="hasWarranty" className="ml-2">
                Tiene garantía
              </label>
            </div>

            {hasWarranty && (
              <div className="p-inputgroup">
                <InputNumber
                  inputId="warrantyValue"
                  value={warrantyValue}
                  onValueChange={(e) => setWarrantyValue(e.value || 1)}
                  min={1}
                  max={getMaxValue()}
                  showButtons
                  buttonLayout="horizontal"
                  incrementButtonIcon="pi pi-plus"
                  decrementButtonIcon="pi pi-minus"
                  className="w-2rem"
                />
                <Dropdown
                  inputId="warrantyUnit"
                  value={warrantyUnit}
                  options={unidades}
                  onChange={(e) => {
                    setWarrantyUnit(e.value);
                    if (warrantyValue > getMaxValue()) {
                      setWarrantyValue(1);
                    }
                  }}
                  optionLabel="label"
                  className="w-8rem"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </Panel>
  );
};
