import React from 'react';
import { Panel } from 'primereact/panel';
import { InputNumber } from 'primereact/inputnumber';
import { MultiSelect } from 'primereact/multiselect';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { CurrencyInput } from '../../../../../../components/CurrencyInput/CurrencyInput';

export const PricingPanel = ({
  formData,
  openPanel,
  handleToggle,
  currenciesLoading,
  currencyOptions,
  availableFixedPriceCurrencies,
  handleNumberChange,
  fixedPrice,
  setFixedPrice,
  handleAddFixedPrice,
  handleRemoveFixedPrice
}) => (
  <Panel
    header="Costos y Precios"
    toggleable
    collapsed={openPanel !== 2}
    onToggle={handleToggle}
  >
    <div className="p-grid p-fluid">
      <div className="p-col-12 p-md-6">
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
          placeholder={
            currenciesLoading ? "Cargando..." : "Ingrese precio"
          }
          currencyPlaceholder={
            currenciesLoading ? "Cargando..." : "Moneda"
          }
          required
        />
      </div>
      <div className="p-col-12 p-md-6">
        <CurrencyInput
          id="basePrice"
          name="basePrice"
          label="Precio Base*"
          value={formData.basePrice}
          currency={formData.baseCurrency}
          onValueChange={(e) => handleNumberChange(e, "basePrice")}
          onCurrencyChange={(e) =>
            setFormData((prev) => ({ ...prev, baseCurrency: e.value }))
          }
          currencyOptions={currencyOptions}
          disabled={currenciesLoading}
          placeholder={
            currenciesLoading ? "Cargando..." : "Ingrese precio"
          }
          currencyPlaceholder={
            currenciesLoading ? "Cargando..." : "Moneda"
          }
          required
        />
      </div>
      <div className="p-col-12">
        <div className="p-field">
          <label>Monedas Aceptadas*</label>
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
              currenciesLoading
                ? "Cargando monedas..."
                : "Seleccione monedas"
            }
            display="chip"
            disabled={currenciesLoading}
            required
          />
        </div>
      </div>
      <div className="p-col-12 p-md-6">
        <div className="p-field">
          <label htmlFor="exchangeRateMargin">
            Margen sobre tipo de cambio (%)
          </label>
          <InputNumber
            id="exchangeRateMargin"
            value={formData.exchangeRateMargin}
            onValueChange={(e) =>
              handleNumberChange(e, "exchangeRateMargin")
            }
            mode="decimal"
            min={0}
            max={100}
            step={0.1}
            suffix="%"
            disabled={currenciesLoading}
          />
        </div>
      </div>
      <div className="p-col-12 p-md-6">
        <div className="p-field">
          <label htmlFor="decimalPlaces">Decimales para redondeo</label>
          <InputNumber
            id="decimalPlaces"
            value={formData.decimalPlaces}
            onValueChange={(e) =>
              handleNumberChange(e, "decimalPlaces")
            }
            mode="decimal"
            min={0}
            max={6}
            disabled={currenciesLoading}
          />
        </div>
      </div>

      <div className="p-col-12">
        <div className="p-field">
          <label>Precios Fijos en Otras Monedas</label>
          <div className="p-grid p-fluid">
            <div className="p-col-12 p-md-4">
              <label htmlFor="fixedPriceCurrency">Moneda</label>
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
            </div>
            <div className="p-col-12 p-md-4">
              <label htmlFor="fixedPriceAmount">Precio</label>
              {fixedPrice.currency ? (
                <InputNumber
                  id="fixedPriceAmount"
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
                  id="fixedPriceAmount"
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
            </div>
            <div className="p-col-12 p-md-4">
              <div className="p-field" style={{ paddingTop: "1.5rem" }}>
                <Button
                  label="Agregar"
                  icon="pi pi-plus"
                  onClick={handleAddFixedPrice}
                  disabled={
                    !fixedPrice.currency || fixedPrice.amount === null
                  }
                />
              </div>
            </div>
          </div>
        </div>
        {formData.fixedPrices.length > 0 && (
          <div className="p-grid">
            {formData.fixedPrices.map((price, index) => (
              <div className="p-col-12 p-md-6" key={index}>
                <div className="p-inputgroup">
                  <span className="p-inputgroup-addon">
                    {price.currency}
                  </span>
                  <InputNumber
                    value={price.amount}
                    mode="currency"
                    currency={price.currency}
                    locale="es-ES"
                    disabled
                  />
                  <Button
                    icon="pi pi-trash"
                    className="p-button-danger"
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