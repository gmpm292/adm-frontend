import React from "react";
import { Panel } from "primereact/panel";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

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
    <div className="p-grid p-fluid">
      <div className="p-col-12 p-md-4">
        <div className="p-field">
          <label htmlFor="attributeKey">Característica</label>
          <InputText
            id="attributeKey"
            value={attributeKey}
            onChange={(e) => setAttributeKey(e.target.value)}
          />
        </div>
      </div>
      <div className="p-col-12 p-md-4">
        <div className="p-field">
          <label htmlFor="attributeValue">Descripción</label>
          <InputText
            id="attributeValue"
            value={attributeValue}
            onChange={(e) => setAttributeValue(e.target.value)}
          />
        </div>
      </div>
      <div className="p-col-12 p-md-4">
        <div className="p-field" style={{ paddingTop: "1.5rem" }}>
          <Button
            label="Agregar"
            icon="pi pi-plus"
            onClick={handleAddAttribute}
            disabled={!attributeKey || !attributeValue}
          />
        </div>
      </div>
      <div className="p-col-12">
        {Object.keys(formData.attributes).length > 0 ? (
          <div className="p-grid">
            {Object.entries(formData.attributes).map(([key, value]) => (
              <div className="p-col-12 p-md-6" key={key}>
                <div className="p-inputgroup">
                  <span className="p-inputgroup-addon">{key}</span>
                  <InputText value={value} disabled />
                  <Button
                    icon="pi pi-trash"
                    className="p-button-danger"
                    onClick={() => handleRemoveAttribute(key)}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No hay atributos definidos</p>
        )}
      </div>
    </div>
  </Panel>
);
