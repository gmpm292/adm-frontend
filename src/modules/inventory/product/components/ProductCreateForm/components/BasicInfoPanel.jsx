import React from "react";
import { Panel } from "primereact/panel";
import { InputText } from "primereact/inputtext";

import { CategorySelector } from "../../../../category/components/CategorySelector";
import SecurityEntitySelector from "../../../../../../components/SecurityEntitySelector/SecurityEntitySelector";

export const BasicInfoPanel = ({
  formData,
  openPanel,
  handleToggle,
  handleChange,
  handleCategorySelect,
  handleSecurityEntitiesChange,
}) => (
  <Panel
    header="Información Básica"
    toggleable
    collapsed={openPanel !== 0}
    onToggle={handleToggle}
  >
    <div className="p-grid p-fluid">
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
          <label htmlFor="unitOfMeasure">Unidad de Medida*</label>
          <InputText
            id="unitOfMeasure"
            name="unitOfMeasure"
            value={formData.unitOfMeasure}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div className="p-col-12 p-md-6">
        <div className="p-field">
          <label htmlFor="categoryId">Categoría*</label>
          <CategorySelector
            onCategorySelect={handleCategorySelect}
            selectedCategoryId={formData.categoryId}
          />
        </div>
      </div>
      <div className="p-col-12 p-md-6">
        <div className="p-field">
          <label htmlFor="warranty">Garantía</label>
          <InputText
            id="warranty"
            name="warranty"
            value={formData.warranty}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="p-col-12">
        <SecurityEntitySelector
          onSelectionChange={handleSecurityEntitiesChange}
        />
      </div>
    </div>
  </Panel>
);
