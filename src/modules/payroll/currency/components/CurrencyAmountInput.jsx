import React, { useState, useEffect } from "react";
import { InputNumber } from "primereact/inputnumber";
import { CurrencyDropdown } from "./CurrencyDropdown";
import { useLazyQuery } from "@apollo/client";
import { GET_CURRENCIES } from "../graphql/queries";
import { Skeleton } from "primereact/skeleton";

// Componente interno para los detalles de la moneda - NO SE EXPORTA
const CurrencyDetails = ({ currency, amount, className = "" }) => {
  if (!currency) return null;

  return (
    <div
      className={`p-2 border-round border-1 surface-border bg-gray-50 mt-2 ${className}`}
    >
      <div className="text-sm text-color-secondary">
        <div className="flex justify-content-between">
          <span>Moneda:</span>
          <span className="font-medium">
            {currency.name} ({currency.code})
          </span>
        </div>
        {currency.exchangeRateToCUP && (
          <div className="flex justify-content-between">
            <span>Tasa de cambio:</span>
            <span className="font-medium">
              1 {currency.code} = {currency.exchangeRateToCUP} CUP
            </span>
          </div>
        )}
        {amount && currency.exchangeRateToCUP && (
          <div className="flex justify-content-between">
            <span>Equivalente en CUP:</span>
            <span className="font-bold text-green-600">
              {(amount * currency.exchangeRateToCUP).toLocaleString("en-US", {
                style: "currency",
                currency: "CUP",
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente principal - TODO INTEGRADO
export const CurrencyAmountInput = ({
  amount,
  onAmountChange,
  currencyCode,
  onCurrencyChange,
  placeholder = "Ingrese el monto",
  showCurrencyDetails = false, // ✅ AHORA FUNCIONA CORRECTAMENTE
  disabled = false,
  className = "",
  required = false,
  mode = "currency",
  min = 0,
  max = undefined,
  onlyActiveCurrencies = true,
  ...props
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [loading, setLoading] = useState(false);

  const [getCurrencies] = useLazyQuery(GET_CURRENCIES, {
    onCompleted: (data) => {
      let currencyData = data?.currencies?.data || [];

      if (onlyActiveCurrencies) {
        currencyData = currencyData.filter((currency) => currency.isActive);
      }

      // Encontrar la moneda seleccionada si existe
      if (currencyCode) {
        const currentCurrency = currencyData.find(
          (curr) => curr.code === currencyCode
        );
        setSelectedCurrency(currentCurrency);
      }

      setLoading(false);
    },
    onError: (error) => {
      console.error("Error fetching currencies:", error);
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

  const handleCurrencyChange = (e) => {
    const newCurrencyCode = e.value;

    // Obtener los datos completos de la moneda seleccionada
    getCurrencies({
      variables: {
        options: {
          take: 100,
          sorts: [{ property: "code", direction: "ASC" }],
        },
      },
      onCompleted: (data) => {
        let currencyData = data?.currencies?.data || [];
        if (onlyActiveCurrencies) {
          currencyData = currencyData.filter((currency) => currency.isActive);
        }

        const currency = currencyData.find(
          (curr) => curr.code === newCurrencyCode
        );
        setSelectedCurrency(currency);

        if (onCurrencyChange) {
          onCurrencyChange(newCurrencyCode, currency);
        }
      },
    });
  };

  const handleAmountChange = (e) => {
    if (onAmountChange) {
      onAmountChange(e.value, selectedCurrency);
    }
  };

  if (loading) {
    return (
      <div className={`flex gap-2 ${className}`}>
        <Skeleton height="40px" className="flex-1" />
        <Skeleton height="40px" className="w-8rem" />
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex gap-2">
        {/* Input del monto */}
        <div className="flex-1">
          <InputNumber
            value={amount}
            onValueChange={handleAmountChange}
            placeholder={placeholder}
            mode={mode}
            currency={currencyCode || "USD"}
            locale="en-US"
            disabled={disabled}
            className="w-full"
            required={required}
            min={min}
            max={max}
            useGrouping={true}
            {...props}
          />
        </div>

        {/* Dropdown de monedas */}
        <div className="w-10rem">
          <CurrencyDropdown
            value={currencyCode}
            onChange={handleCurrencyChange}
            placeholder="Moneda"
            disabled={disabled}
            onlyActive={onlyActiveCurrencies}
          />
        </div>
      </div>

      {/* ✅ AHORA SÍ FUNCIONA: Solo muestra detalles si showCurrencyDetails es true */}
      {showCurrencyDetails && selectedCurrency && (
        <CurrencyDetails currency={selectedCurrency} amount={amount} />
      )}
    </div>
  );
};

// ✅ SOLO EXPORTAMOS EL COMPONENTE PRINCIPAL
export default CurrencyAmountInput;
