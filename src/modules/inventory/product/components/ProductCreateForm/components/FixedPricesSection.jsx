import React from "react";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { FormField } from "../../../../../../components/ui";

export const FixedPricesSection = ({
  fixedPrice,
  setFixedPrice,
  availableFixedPriceCurrencies,
  handleAddFixedPrice,
  handleRemoveFixedPrice,
  formData,
}) => (
  <>
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
  </>
);
