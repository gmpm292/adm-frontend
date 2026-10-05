import React, { useState, useEffect } from "react";
import { Panel } from "primereact/panel";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { CategorySelector } from "../../../../category/components/CategorySelector";
import MaterialCostDropdown from "../../../../../payroll/material-cost/components/MaterialCostDropdown";
import UnitOfMeasureDropdown from "../../../../unit-of-measure/components/UnitOfMeasureDropdown";
import { FormField } from "../../../../../../components/ui";

export const BasicInfoPanel = ({
  formData,
  openPanel,
  handleToggle,
  handleChange,
  handleCategorySelect,
  handleUnitOfMeasureChange,
  handleMaterialCostChange,
  handleSecurityEntitiesChange,
  handleMaterialCostSelect,
}) => {
  // Garantía: por defecto true y 30 días
  const [hasWarranty, setHasWarranty] = useState(() => {
    // Si ya hay warranty en formData, lo respetamos
    return formData.warranty ? true : true; // Por defecto true
  });

  const [warrantyValue, setWarrantyValue] = useState(() => {
    const parts = formData.warranty?.split(" ") ?? ["30", "días"];
    return parseInt(parts[0]) || 30;
  });

  const [warrantyUnit, setWarrantyUnit] = useState(() => {
    const parts = formData.warranty?.split(" ") ?? ["30", "días"];
    return parts[1] || "días";
  });

  // Cantidad del producto
  const [quantity, setQuantity] = useState(formData.quantity || 1);

  const unidades = [
    { label: "Días", value: "días" },
    { label: "Meses", value: "meses" },
    { label: "Años", value: "años" },
  ];

  // Actualizar el valor de warranty en formData
  useEffect(() => {
    const nuevaGarantia = hasWarranty ? `${warrantyValue} ${warrantyUnit}` : "";
    handleChange({ target: { name: "warranty", value: nuevaGarantia } });
  }, [hasWarranty, warrantyValue, warrantyUnit]);

  // Actualizar cantidad en formData
  useEffect(() => {
    handleChange({ target: { name: "quantity", value: quantity } });
  }, [quantity]);

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

  // Manejar selección de material cost
  const handleMaterialCostSelection = (e) => {
    handleMaterialCostChange(e);
    if (e.value && handleMaterialCostSelect) {
      handleMaterialCostSelect(e.value);
    }
  };

  return (
    <Panel
      header="Información Básica"
      toggleable
      collapsed={openPanel !== 0}
      onToggle={handleToggle}
    >
      <div className="formgrid grid">
        <div className="col-12 md:col-6">
          <FormField label="Categoría" htmlFor="categoryId" required>
            <CategorySelector
              onCategorySelect={handleCategorySelection}
              selectedCategoryId={formData.categoryId}
            />
          </FormField>
        </div>
        <div className="col-12 md:col-6">
          <FormField label="Nombre" htmlFor="name" required>
            <InputText
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </FormField>
        </div>
        <div className="col-12 md:col-6">
          <FormField label="Material (Costo)" htmlFor="materialCostId">
            <MaterialCostDropdown
              value={formData.materialCostId}
              onChange={handleMaterialCostSelection}
              placeholder="Seleccione material (opcional)"
              showClear
            />
          </FormField>
        </div>
        <div className="col-12 md:col-6">
          <FormField label="Unidad de Medida" htmlFor="unitOfMeasureId" required>
            <UnitOfMeasureDropdown
              value={formData.unitOfMeasureId}
              onChange={handleUnitOfMeasureChange}
              placeholder="Seleccione unidad de medida"
              required
              disabled={!!formData.materialCostId} // Se inhabilita si hay material seleccionado
            />
          </FormField>
        </div>
        <div className="col-12 md:col-6">
          <FormField label="Cantidad" htmlFor="quantity">
            <InputNumber
              inputId="quantity"
              value={quantity}
              onValueChange={(e) => setQuantity(e.value || 1)}
              min={1}
              max={999999}
              showButtons
              buttonLayout="horizontal"
              incrementButtonIcon="pi pi-plus"
              decrementButtonIcon="pi pi-minus"
              mode="decimal"
              className="w-full"
            />
          </FormField>
        </div>
        <div className="col-12 md:col-6">
          <FormField>
            <div className="flex align-items-center">
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
          </FormField>
        </div>
      </div>
    </Panel>
  );
};
