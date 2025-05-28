import React from 'react';
import { Panel } from 'primereact/panel';
import { InputNumber } from 'primereact/inputnumber';
import { MultiSelect } from 'primereact/multiselect';
import { Button } from 'primereact/button';
import { Chips } from 'primereact/chips';

export const SalesRulesPanel = ({
  formData,
  openPanel,
  handleToggle,
  currencyOptions,
  bulkDiscount,
  setBulkDiscount,
  handleAddBulkDiscount,
  handleRemoveBulkDiscount
}) => (
  <Panel
    header="Reglas de Venta"
    toggleable
    collapsed={openPanel !== 3}
    onToggle={handleToggle}
  >
    <div className="p-grid p-fluid">
      <div className="p-col-12 p-md-6">
        <div className="p-field">
          <label htmlFor="minQuantity">Cantidad mínima</label>
          <InputNumber
            id="minQuantity"
            value={formData.saleRules.minQuantity}
            onValueChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                saleRules: {
                  ...prev.saleRules,
                  minQuantity: e.value,
                },
              }))
            }
            mode="decimal"
            min={0}
          />
        </div>
      </div>
      <div className="p-col-12 p-md-6">
        <div className="p-field">
          <label htmlFor="maxQuantity">Cantidad máxima</label>
          <InputNumber
            id="maxQuantity"
            value={formData.saleRules.maxQuantity}
            onValueChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                saleRules: {
                  ...prev.saleRules,
                  maxQuantity: e.value,
                },
              }))
            }
            mode="decimal"
            min={0}
          />
        </div>
      </div>
      <div className="p-col-12">
        <div className="p-field">
          <label>Descuentos por volumen</label>
          <div className="p-grid p-fluid">
            <div className="p-col-12 p-md-3">
              <label htmlFor="bulkMinQty">Cantidad mínima</label>
              <InputNumber
                id="bulkMinQty"
                value={bulkDiscount.minQty}
                onValueChange={(e) =>
                  setBulkDiscount((prev) => ({
                    ...prev,
                    minQty: e.value,
                  }))
                }
                mode="decimal"
                min={1}
              />
            </div>
            <div className="p-col-12 p-md-3">
              <label htmlFor="bulkDiscount">Descuento (%)</label>
              <InputNumber
                id="bulkDiscount"
                value={bulkDiscount.discount}
                onValueChange={(e) =>
                  setBulkDiscount((prev) => ({
                    ...prev,
                    discount: e.value,
                  }))
                }
                mode="decimal"
                min={0}
                max={100}
                suffix="%"
              />
            </div>
            <div className="p-col-12 p-md-4">
              <label htmlFor="bulkCurrencies">Monedas aplicables</label>
              <MultiSelect
                id="bulkCurrencies"
                value={bulkDiscount.applicableCurrencies}
                options={currencyOptions}
                onChange={(e) =>
                  setBulkDiscount((prev) => ({
                    ...prev,
                    applicableCurrencies: e.value,
                  }))
                }
                placeholder="Seleccione monedas"
                display="chip"
              />
            </div>
            <div className="p-col-12 p-md-2">
              <div className="p-field" style={{ paddingTop: "1.5rem" }}>
                <Button
                  label="Agregar"
                  icon="pi pi-plus"
                  onClick={handleAddBulkDiscount}
                  disabled={
                    !bulkDiscount.minQty ||
                    !bulkDiscount.discount ||
                    bulkDiscount.applicableCurrencies.length === 0
                  }
                />
              </div>
            </div>
          </div>
        </div>
        {formData.saleRules.bulkDiscounts.length > 0 && (
          <div className="p-grid">
            {formData.saleRules.bulkDiscounts.map((discount, index) => (
              <div className="p-col-12" key={index}>
                <div className="p-inputgroup">
                  <span className="p-inputgroup-addon">
                    Mín: {discount.minQty}
                  </span>
                  <span className="p-inputgroup-addon">
                    Desc: {discount.discount}%
                  </span>
                  <Chips
                    value={discount.applicableCurrencies}
                    disabled
                  />
                  <Button
                    icon="pi pi-trash"
                    className="p-button-danger"
                    onClick={() => handleRemoveBulkDiscount(index)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </Panel>
);