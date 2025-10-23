import { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { GET_CURRENCIES } from "../graphql/queries";

export const useCurrencies = (options = {}) => {
  const { onlyActive = true, take = 100 } = options;
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [getCurrencies] = useLazyQuery(GET_CURRENCIES, {
    onCompleted: (data) => {
      let currencyData = data?.currencies?.data || [];

      if (onlyActive) {
        currencyData = currencyData.filter((currency) => currency.isActive);
      }

      setCurrencies(currencyData);
      setLoading(false);
    },
    onError: (err) => {
      setError(err);
      setLoading(false);
    },
  });

  useEffect(() => {
    setLoading(true);
    getCurrencies({
      variables: {
        options: {
          take,
          sorts: [{ property: "code", direction: "ASC" }],
        },
      },
    });
  }, [getCurrencies, take]);

  const getCurrencyByCode = (code) => {
    return currencies.find((currency) => currency.code === code);
  };

  const getActiveCurrencies = () => {
    return currencies.filter((currency) => currency.isActive);
  };

  const refreshCurrencies = () => {
    setLoading(true);
    getCurrencies({
      variables: {
        options: {
          take,
          sorts: [{ property: "code", direction: "ASC" }],
        },
      },
    });
  };

  return {
    currencies,
    loading,
    error,
    getCurrencyByCode,
    getActiveCurrencies,
    refreshCurrencies,
  };
};
