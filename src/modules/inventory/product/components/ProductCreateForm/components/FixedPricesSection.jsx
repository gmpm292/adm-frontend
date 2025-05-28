import React from 'react';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';

export const FixedPricesSection = ({
  fixedPrice,
  setFixedPrice,
  availableFixedPriceCurrencies,
  handleAddFixedPrice,
  handleRemoveFixedPrice,
  formData
}) => (
  <>
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
  </>
);