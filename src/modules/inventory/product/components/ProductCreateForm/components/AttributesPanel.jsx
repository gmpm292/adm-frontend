import React from "react";
import { Panel } from "primereact/panel";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { FormField } from "../../../../../../components/ui";

export const AttributesPanel = ({
  formData,
  openPanel,
  handleToggle,
  attributeKey,
  setAttributeKey,
  attributeValue,
  setAttributeValue,
  handleAddAttribute,
  handleRemoveAttribute,
}) => (
  <Panel
    header="Atributos"
    toggleable
    collapsed={openPanel !== 1}
    onToggle={handleToggle}
  >
    <div className="formgrid grid">
      <div className="col-12 md:col-4">
        <FormField label="Característica" htmlFor="attributeKey">
          <InputText
            id="attributeKey"
            value={attributeKey}
            onChange={(e) => setAttributeKey(e.target.value)}
          />
        </FormField>
      </div>
      <div className="col-12 md:col-4">
        <FormField label="Descripción" htmlFor="attributeValue">
          <InputText
            id="attributeValue"
            value={attributeValue}
            onChange={(e) => setAttributeValue(e.target.value)}
          />
        </FormField>
      </div>
      <div className="col-12 md:col-4 flex align-items-end">
        <Button
          label="Agregar"
          icon="pi pi-plus"
          severity="secondary"
          className="mb-3"
          onClick={handleAddAttribute}
          disabled={!attributeKey || !attributeValue}
        />
      </div>
      <div className="col-12">
        {Object.keys(formData.attributes).length > 0 ? (
          <div className="grid">
            {Object.entries(formData.attributes).map(([key, value]) => (
              <div className="col-12 md:col-6" key={key}>
                <div className="p-inputgroup">
                  <span className="p-inputgroup-addon">{key}</span>
                  <InputText value={value} disabled />
                  <Button
                    icon="pi pi-trash"
                    severity="danger"
                    onClick={() => handleRemoveAttribute(key)}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-color-secondary">No hay atributos definidos</p>
        )}
      </div>
    </div>
  </Panel>
);
