import React from "react";
import { Panel } from "primereact/panel";
import { InputNumber } from "primereact/inputnumber";
import { MultiSelect } from "primereact/multiselect";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { CurrencyInput } from "../../../../../../components/CurrencyInput/CurrencyInput";
import { FormField } from "../../../../../../components/ui";

export const PricingPanel = ({
  formData,
  setFormData,
  openPanel,
  handleToggle,
  currenciesLoading,
  currencyOptions,
  availableFixedPriceCurrencies,
  handleNumberChange,
  fixedPrice,
  setFixedPrice,
  handleAddFixedPrice,
  handleRemoveFixedPrice,
}) => (
  <Panel
    header="Costos y Precios"
    toggleable
    collapsed={openPanel !== 2}
    onToggle={handleToggle}
  >
    <div className="formgrid grid">
      <div className="col-12 md:col-6">
        <CurrencyInput
          id="costPrice"
          name="costPrice"
          label="Precio Costo*"
          value={formData.costPrice}
          currency={formData.costCurrency}
          onValueChange={(e) => handleNumberChange(e, "costPrice")}
          onCurrencyChange={(e) =>
            setFormData((prev) => ({ ...prev, costCurrency: e.value }))
          }
          currencyOptions={currencyOptions}
          disabled={currenciesLoading}
          placeholder={currenciesLoading ? "Cargando..." : "Ingrese precio"}
          currencyPlaceholder={currenciesLoading ? "Cargando..." : "Moneda"}
          required
        />
      </div>
      <div className="col-12 md:col-6">
        <CurrencyInput
          id="basePrice"
          name="basePrice"
          label="Precio Venta*"
          value={formData.basePrice}
          currency={formData.baseCurrency}
          onValueChange={(e) => handleNumberChange(e, "basePrice")}
          onCurrencyChange={(e) =>
            setFormData((prev) => ({ ...prev, baseCurrency: e.value }))
          }
          currencyOptions={currencyOptions}
          disabled={currenciesLoading}
          placeholder={currenciesLoading ? "Cargando..." : "Ingrese precio"}
          currencyPlaceholder={currenciesLoading ? "Cargando..." : "Moneda"}
          required
        />
      </div>
      <div className="col-12">
        <FormField label="Monedas Aceptadas" required>
          <MultiSelect
            value={formData.acceptedCurrencies}
            options={currencyOptions}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                acceptedCurrencies: e.value,
              }))
            }
            placeholder={
              currenciesLoading ? "Cargando monedas..." : "Seleccione monedas"
            }
            display="chip"
            disabled={currenciesLoading}
            required
          />
        </FormField>
      </div>
      <div className="col-12 md:col-6">
        <FormField
          label="Margen sobre tipo de cambio (%)"
          htmlFor="exchangeRateMargin"
        >
          <InputNumber
            inputId="exchangeRateMargin"
            value={formData.exchangeRateMargin}
            onValueChange={(e) => handleNumberChange(e, "exchangeRateMargin")}
            mode="decimal"
            min={0}
            max={100}
            step={0.1}
            suffix="%"
            disabled={currenciesLoading}
          />
        </FormField>
      </div>
      <div className="col-12 md:col-6">
        <FormField label="Decimales para redondeo" htmlFor="decimalPlaces">
          <InputNumber
            inputId="decimalPlaces"
            value={formData.decimalPlaces}
            onValueChange={(e) => handleNumberChange(e, "decimalPlaces")}
            mode="decimal"
            min={0}
            max={6}
            disabled={currenciesLoading}
          />
        </FormField>
      </div>

      <div className="col-12">
        <span className="block font-semibold mb-3">
          Precios Fijos en Otras Monedas
        </span>
        <div className="formgrid grid">
          <div className="col-12 md:col-4">
            <FormField label="Moneda" htmlFor="fixedPriceCurrency">
              <Dropdown
                id="fixedPriceCurrency"
                value={fixedPrice.currency}
                options={availableFixedPriceCurrencies}
                onChange={(e) =>
                  setFixedPrice((prev) => ({
                    ...prev,
                    currency: e.value,
                  }))
                }
                placeholder="Seleccione moneda"
                disabled={availableFixedPriceCurrencies.length === 0}
              />
            </FormField>
          </div>
          <div className="col-12 md:col-4">
            <FormField label="Precio" htmlFor="fixedPriceAmount">
              {fixedPrice.currency ? (
                <InputNumber
                  inputId="fixedPriceAmount"
                  value={fixedPrice.amount}
                  onValueChange={(e) =>
                    setFixedPrice((prev) => ({
                      ...prev,
                      amount: e.value,
                    }))
                  }
                  mode="currency"
                  currency={fixedPrice.currency}
                  locale="es-ES"
                />
              ) : (
                <InputNumber
                  inputId="fixedPriceAmount"
                  value={fixedPrice.amount}
                  onValueChange={(e) =>
                    setFixedPrice((prev) => ({
                      ...prev,
                      amount: e.value,
                    }))
                  }
                  mode="decimal"
                  disabled
                  placeholder="Seleccione moneda primero"
                />
              )}
            </FormField>
          </div>
          <div className="col-12 md:col-4 flex align-items-end">
            <Button
              label="Agregar"
              icon="pi pi-plus"
              severity="secondary"
              className="mb-3"
              onClick={handleAddFixedPrice}
              disabled={!fixedPrice.currency || fixedPrice.amount === null}
            />
          </div>
        </div>
        {formData.fixedPrices.length > 0 && (
          <div className="grid">
            {formData.fixedPrices.map((price, index) => (
              <div className="col-12 md:col-6" key={index}>
                <div className="p-inputgroup">
                  <span className="p-inputgroup-addon">{price.currency}</span>
                  <InputNumber
                    value={price.amount}
                    mode="currency"
                    currency={price.currency}
                    locale="es-ES"
                    disabled
                  />
                  <Button
                    icon="pi pi-trash"
                    severity="danger"
                    onClick={() => handleRemoveFixedPrice(index)}
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
