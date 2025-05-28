import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";

// import { ConditionalOperator } from "../../../../enums/conditional-operation.enum";
import { GET_CURRENCIES } from "../../../../../payroll/currency/graphql/queries";
import { ConditionalOperator } from "../../../../../../enums/conditional-operation.enum";

export const useProductForm = (visible) => {
  const [formData, setFormData] = useState({
    name: "",
    unitOfMeasure: "",
    costPrice: null,
    costCurrency: "",
    basePrice: null,
    baseCurrency: "",
    warranty: "",
    categoryId: null,
    acceptedCurrencies: [],
    exchangeRateMargin: 0,
    decimalPlaces: 2,
    fixedPrices: [],
    businessId: null,
    officeId: null,
    departmentId: null,
    teamId: null,
    attributes: {},
    saleRules: {
      minQuantity: null,
      maxQuantity: null,
      bulkDiscounts: [],
    },
  });

  const [attributeKey, setAttributeKey] = useState("");
  const [attributeValue, setAttributeValue] = useState("");
  const [bulkDiscount, setBulkDiscount] = useState({
    minQty: null,
    discount: null,
    applicableCurrencies: [],
  });
  const [fixedPrice, setFixedPrice] = useState({
    currency: "",
    amount: null,
  });

  const {
    data: currenciesData,
    loading: currenciesLoading,
    error: currenciesError,
  } = useQuery(GET_CURRENCIES, {
    fetchPolicy: "network-only",
    variables: {
      options: {
        filters: {
          property: "isActive",
          operator: ConditionalOperator.IS_NOT_NULL,
        },
      },
    },
    skip: !visible,
  });

  const currencyOptions =
    currenciesData?.currencies?.data?.map((currency) => ({
      label: `${currency.code} - ${currency.name}`,
      value: currency.code,
    })) || [];

  const availableFixedPriceCurrencies = currencyOptions.filter(
    (currency) =>
      currency.value !== formData.baseCurrency &&
      !formData.fixedPrices.some((fp) => fp.currency === currency.value)
  );

  useEffect(() => {
    if (fixedPrice.currency === formData.baseCurrency) {
      setFixedPrice((prev) => ({
        ...prev,
        currency: "",
        amount: null,
      }));
    }
  }, [formData.baseCurrency]);

  const handleSecurityEntitiesChange = (entities) => {
    setFormData((prev) => ({
      ...prev,
      ...entities,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e, name) => {
    setFormData((prev) => ({ ...prev, [name]: e.value }));
  };

  const handleCategorySelect = (categoryId) => {
    setFormData((prev) => ({ ...prev, categoryId }));
  };

  const handleAddAttribute = () => {
    if (attributeKey && attributeValue) {
      setFormData((prev) => ({
        ...prev,
        attributes: {
          ...prev.attributes,
          [attributeKey]: attributeValue,
        },
      }));
      setAttributeKey("");
      setAttributeValue("");
    }
  };

  const handleRemoveAttribute = (key) => {
    const newAttributes = { ...formData.attributes };
    delete newAttributes[key];
    setFormData((prev) => ({
      ...prev,
      attributes: newAttributes,
    }));
  };

  const handleAddBulkDiscount = () => {
    if (
      bulkDiscount.minQty &&
      bulkDiscount.discount &&
      bulkDiscount.applicableCurrencies.length > 0
    ) {
      setFormData((prev) => ({
        ...prev,
        saleRules: {
          ...prev.saleRules,
          bulkDiscounts: [
            ...prev.saleRules.bulkDiscounts,
            {
              minQty: bulkDiscount.minQty,
              discount: bulkDiscount.discount,
              applicableCurrencies: bulkDiscount.applicableCurrencies,
            },
          ],
        },
      }));
      setBulkDiscount({
        minQty: null,
        discount: null,
        applicableCurrencies: [],
      });
    }
  };

  const handleRemoveBulkDiscount = (index) => {
    const newBulkDiscounts = [...formData.saleRules.bulkDiscounts];
    newBulkDiscounts.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      saleRules: {
        ...prev.saleRules,
        bulkDiscounts: newBulkDiscounts,
      },
    }));
  };

  const handleAddFixedPrice = () => {
    if (fixedPrice.currency && fixedPrice.amount !== null) {
      setFormData((prev) => ({
        ...prev,
        fixedPrices: [
          ...prev.fixedPrices,
          {
            currency: fixedPrice.currency,
            amount: fixedPrice.amount,
          },
        ],
      }));
      setFixedPrice({
        currency: "",
        amount: null,
      });
    }
  };

  const handleRemoveFixedPrice = (index) => {
    const newFixedPrices = [...formData.fixedPrices];
    newFixedPrices.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      fixedPrices: newFixedPrices,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      unitOfMeasure: "",
      costPrice: null,
      costCurrency: "",
      basePrice: null,
      baseCurrency: "",
      warranty: "",
      categoryId: null,
      acceptedCurrencies: [],
      exchangeRateMargin: 0,
      decimalPlaces: 2,
      fixedPrices: [],
      businessId: null,
      officeId: null,
      departmentId: null,
      teamId: null,
      attributes: {},
      saleRules: {
        minQuantity: null,
        maxQuantity: null,
        bulkDiscounts: [],
      },
    });
    setAttributeKey("");
    setAttributeValue("");
    setBulkDiscount({
      minQty: null,
      discount: null,
      applicableCurrencies: [],
    });
    setFixedPrice({
      currency: "",
      amount: null,
    });
  };

  return {
    formData,
    setFormData,
    attributeKey,
    setAttributeKey,
    attributeValue,
    setAttributeValue,
    bulkDiscount,
    setBulkDiscount,
    fixedPrice,
    setFixedPrice,
    currenciesLoading,
    currenciesError,
    currencyOptions,
    availableFixedPriceCurrencies,
    handleSecurityEntitiesChange,
    handleChange,
    handleNumberChange,
    handleCategorySelect,
    handleAddAttribute,
    handleRemoveAttribute,
    handleAddBulkDiscount,
    handleRemoveBulkDiscount,
    handleAddFixedPrice,
    handleRemoveFixedPrice,
    resetForm,
  };
};
