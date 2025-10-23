import React, { useState, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";
import { useLazyQuery } from "@apollo/client";
import { GET_CURRENCIES } from "../graphql/queries";
import { Skeleton } from "primereact/skeleton";

export const CurrencyDropdown = ({
  value,
  onChange,
  placeholder = "Seleccione una moneda",
  filter = true,
  showClear = false,
  disabled = false,
  className = "",
  required = false,
  onlyActive = true,
  ...props
}) => {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);

  const [getCurrencies] = useLazyQuery(GET_CURRENCIES, {
    onCompleted: (data) => {
      let currencyData = data?.currencies?.data || [];

      // Filtrar solo monedas activas si se solicita
      if (onlyActive) {
        currencyData = currencyData.filter((currency) => currency.isActive);
      }

      // ✅ Usar todas las monedas del backend sin filtros adicionales
      const formattedCurrencies = currencyData.map((currency) => ({
        label: `${currency.code} - ${currency.name} (${currency.symbol})`,
        value: currency.code,
        data: currency,
      }));

      setCurrencies(formattedCurrencies);
      setLoading(false);
    },
    onError: (error) => {
      console.error("Error fetching currencies:", error);
      setCurrencies([]);
      setLoading(false);
    },
  });

  useEffect(() => {
    setLoading(true);
    getCurrencies({
      variables: {
        options: {
          take: 100,
          sorts: [{ property: "code", direction: "ASC" }],
        },
      },
    });
  }, [getCurrencies]);

  const handleChange = (e) => {
    if (e.value === null || e.value === undefined) {
      return;
    }
    if (onChange) {
      onChange(e);
    }
  };

  const selectedTemplate = (option, props) => {
    if (option) {
      return (
        <div className="flex align-items-center">
          <span className="font-bold">{option.value}</span>
          <span className="ml-2">- {option.data?.name}</span>
        </div>
      );
    }
    return <span>{props.placeholder}</span>;
  };

  const itemTemplate = (option) => {
    return (
      <div className="flex align-items-center justify-content-between">
        <div>
          <span className="font-bold">{option.value}</span>
          <span className="ml-2">- {option.data?.name}</span>
        </div>
        <div className="flex align-items-center gap-2">
          <span className="text-color-secondary">{option.data?.symbol}</span>
          {option.data?.exchangeRateToCUP && (
            <small className="text-color-secondary">
              (1 {option.value} = {option.data.exchangeRateToCUP} CUP)
            </small>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return <Skeleton height="40px" className={className} />;
  }

  return (
    <Dropdown
      value={value}
      onChange={handleChange}
      options={currencies}
      optionLabel="label"
      optionValue="value"
      placeholder={placeholder}
      filter={filter}
      showClear={showClear}
      disabled={disabled}
      className={`w-full ${className}`}
      required={required}
      valueTemplate={selectedTemplate}
      itemTemplate={itemTemplate}
      emptyMessage="No se encontraron monedas"
      emptyFilterMessage="No se encontraron monedas que coincidan"
      {...props}
    />
  );
};

export default CurrencyDropdown;
