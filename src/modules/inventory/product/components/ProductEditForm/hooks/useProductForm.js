import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_CURRENCIES } from "../../../../../payroll/currency/graphql/queries";
import { GET_PRODUCT_BY_ID } from "../../../graphql/queries";
import { ConditionalOperator } from "../../../../../../enums/conditional-operation.enum";

export const useProductForm = (productId, visible) => {
  const [formData, setFormData] = useState({
    name: "",
    unitOfMeasureId: null,
    materialCostId: null,
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

  // Query para obtener las monedas
  const {
    data: currenciesData,
    loading: currenciesLoading,
    error: currenciesError,
  } = useQuery(GET_CURRENCIES, {
    fetchPolicy: "network-only",
    variables: {
      options: {
        filters: [
          {
            property: "isActive",
            operator: ConditionalOperator.IS_NOT_NULL,
          },
        ],
      },
    },
    skip: !visible,
  });

  // Query para obtener el producto a editar
  const { loading, error, data } = useQuery(GET_PRODUCT_BY_ID, {
    variables: { id: productId },
    skip: !productId || !visible,
    onCompleted: (data) => {
      if (data?.product) {
        const product = data.product;
        setFormData({
          name: product.name || "",
          unitOfMeasureId: product.unitOfMeasure?.id || null, // 👈 Cambiado
          materialCostId: product.materialCost?.id || null, // 👈 Nuevo
          costPrice: product.costPrice || null,
          costCurrency: product.costCurrency || "",
          basePrice: product.basePrice || null,
          baseCurrency: product.baseCurrency || "",
          warranty: product.warranty || "",
          categoryId: product.category?.id || null,
          acceptedCurrencies: product.pricingConfig?.acceptedCurrencies || [],
          exchangeRateMargin: product.pricingConfig?.exchangeRateMargin || 0,
          decimalPlaces: product.pricingConfig?.decimalPlaces || 2,
          fixedPrices: product.pricingConfig?.fixedPrices || [],
          businessId: product.business?.id || null,
          officeId: product.office?.id || null,
          departmentId: product.department?.id || null,
          teamId: product.team?.id || null,
          attributes: product.attributes || {},
          saleRules: {
            minQuantity: product.saleRules?.minQuantity || null,
            maxQuantity: product.saleRules?.maxQuantity || null,
            bulkDiscounts: product.saleRules?.bulkDiscounts || [],
          },
        });
      }
    },
  });

  const currencyOptions =
    currenciesData?.currencies?.data?.map((currency) => ({
      label: `${currency.code} - ${currency.name}`,
      value: currency.code,
    })) || [];

  const availableFixedPriceCurrencies = currencyOptions.filter(
    (currency) =>
      currency.value !== formData.baseCurrency &&
      !formData.fixedPrices.some((fp) => fp.currency === currency.value),
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

  const handleUnitOfMeasureChange = (e) => {
    setFormData((prev) => ({ ...prev, unitOfMeasureId: e.value }));
  };

  const handleMaterialCostChange = (e) => {
    setFormData((prev) => ({ ...prev, materialCostId: e.value }));
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
      unitOfMeasureId: null,
      materialCostId: null,
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
    handleUnitOfMeasureChange,
    handleMaterialCostChange,
    handleAddAttribute,
    handleRemoveAttribute,
    handleAddBulkDiscount,
    handleRemoveBulkDiscount,
    handleAddFixedPrice,
    handleRemoveFixedPrice,
    resetForm,
    loading,
    error,
  };
};
