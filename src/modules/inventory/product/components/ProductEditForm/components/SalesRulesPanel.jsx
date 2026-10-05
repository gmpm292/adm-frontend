import React from "react";
import { Panel } from "primereact/panel";
import { InputNumber } from "primereact/inputnumber";
import { MultiSelect } from "primereact/multiselect";
import { Button } from "primereact/button";
import { Chips } from "primereact/chips";
import { FormField } from "../../../../../../components/ui";

export const SalesRulesPanel = ({
  formData,
  setFormData,
  openPanel,
  handleToggle,
  currencyOptions,
  bulkDiscount,
  setBulkDiscount,
  handleAddBulkDiscount,
  handleRemoveBulkDiscount,
}) => (
  <Panel
    header="Reglas de Venta"
    toggleable
    collapsed={openPanel !== 3}
    onToggle={handleToggle}
  >
    <div className="formgrid grid">
      <div className="col-12 md:col-6">
        <FormField label="Cantidad mínima" htmlFor="minQuantity">
          <InputNumber
            inputId="minQuantity"
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
        </FormField>
      </div>
      <div className="col-12 md:col-6">
        <FormField label="Cantidad máxima" htmlFor="maxQuantity">
          <InputNumber
            inputId="maxQuantity"
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
        </FormField>
      </div>
      <div className="col-12">
        <span className="block font-semibold mb-3">Descuentos por volumen</span>
        <div className="formgrid grid">
          <div className="col-12 md:col-3">
            <FormField label="Cantidad mínima" htmlFor="bulkMinQty">
              <InputNumber
                inputId="bulkMinQty"
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
            </FormField>
          </div>
          <div className="col-12 md:col-3">
            <FormField label="Descuento (%)" htmlFor="bulkDiscount">
              <InputNumber
                inputId="bulkDiscount"
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
            </FormField>
          </div>
          <div className="col-12 md:col-4">
            <FormField label="Monedas aplicables" htmlFor="bulkCurrencies">
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
            </FormField>
          </div>
          <div className="col-12 md:col-2 flex align-items-end">
            <Button
              label="Agregar"
              icon="pi pi-plus"
              severity="secondary"
              className="mb-3"
              onClick={handleAddBulkDiscount}
              disabled={
                !bulkDiscount.minQty ||
                !bulkDiscount.discount ||
                bulkDiscount.applicableCurrencies.length === 0
              }
            />
          </div>
        </div>
        {formData.saleRules.bulkDiscounts.length > 0 && (
          <div className="grid">
            {formData.saleRules.bulkDiscounts.map((discount, index) => (
              <div className="col-12" key={index}>
                <div className="p-inputgroup">
                  <span className="p-inputgroup-addon">
                    Mín: {discount.minQty}
                  </span>
                  <span className="p-inputgroup-addon">
                    Desc: {discount.discount}%
                  </span>
                  <Chips value={discount.applicableCurrencies} disabled />
                  <Button
                    icon="pi pi-trash"
                    severity="danger"
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
