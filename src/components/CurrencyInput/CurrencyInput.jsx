import React from "react";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { classNames } from "primereact/utils";

export const CurrencyInput = ({
  value,
  currency,
  onValueChange,
  onCurrencyChange,
  currencyOptions,
  label,
  id,
  name,
  disabled = false,
  required = false,
  min = 0,
  max,
  mode = "decimal",
  placeholder = "",
  className = "",
  currencyPlaceholder = "Moneda",
  showClear = false,
  inputWidth = "70%",
  dropdownWidth = "30%",
}) => {
  return (
    <div className={classNames("currency-input", className)}>
      {label && (
        <label htmlFor={id}>
          {label}
          {required && <span className="required-asterisk">*</span>}
        </label>
      )}

      <div className="p-inputgroup">
        <InputNumber
          id={id}
          name={name}
          value={value}
          onValueChange={onValueChange}
          mode={mode}
          currency={"USD"}
          min={min}
          max={max}
          placeholder={placeholder}
          disabled={disabled}
          className="currency-input-number"
          style={{ width: inputWidth }}
        />
        <Dropdown
          value={currency}
          options={currencyOptions}
          onChange={onCurrencyChange}
          optionLabel="label"
          optionValue="value"
          placeholder={currencyPlaceholder}
          disabled={disabled || !currencyOptions?.length}
          className="currency-dropdown"
          style={{ width: dropdownWidth }}
          showClear={showClear}
        />
      </div>
    </div>
  );
};
