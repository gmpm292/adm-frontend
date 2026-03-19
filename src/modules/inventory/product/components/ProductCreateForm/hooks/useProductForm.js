import { useState, useEffect } from "react";
import { useLazyQuery, useQuery } from "@apollo/client";
import { GET_CURRENCIES } from "../../../../../payroll/currency/graphql/queries";
import { ConditionalOperator } from "../../../../../../enums/conditional-operation.enum";
import { calculateTotalPrice } from "../../../../../../utils/priceCalculations";
import { GET_MATERIAL_COST_BY_ID } from "../../../graphql/queries";
import { GET_OFFICES } from "../../../../../../components/SecurityEntitySelector/queries"; // 👈 Importar query de oficinas

export const useProductForm = (visible) => {
  const [formData, setFormData] = useState({
    name: "",
    unitOfMeasureId: null,
    materialCostId: null,
    costPrice: null,
    costCurrency: "",
    basePrice: null,
    baseCurrency: "",
    warranty: "30 días", // Valor por defecto
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
    quantity: 1,
    createInventory: false,
    selectedOffices: [],
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
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [officeOptions, setOfficeOptions] = useState([]); // 👈 Estado para opciones de oficinas

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

  // Query para obtener detalles del material
  const [getMaterialDetails, { data: materialData }] = useLazyQuery(
    GET_MATERIAL_COST_BY_ID,
    {
      fetchPolicy: "network-only",
    },
  );

  // Query para obtener oficinas
  const [getOffices, { loading: officesLoading }] = useLazyQuery(GET_OFFICES, {
    onCompleted: (data) => {
      const offices =
        data?.offices?.data?.map((office) => ({
          label: office.name,
          value: office.id,
          businessId: office.business?.id,
          businessName: office.business?.name,
        })) || [];
      setOfficeOptions(offices);
    },
  });

  // Cargar oficinas cuando el formulario está visible
  useEffect(() => {
    if (visible) {
      getOffices({
        variables: {
          options: {
            take: 100,
            sorts: [{ property: "name", direction: "ASC" }],
          },
        },
      });
    }
  }, [visible, getOffices]);

  // Efecto para cargar detalles del material cuando se selecciona
  useEffect(() => {
    const loadMaterialDetails = async () => {
      if (formData.materialCostId) {
        try {
          const { data } = await getMaterialDetails({
            variables: { id: formData.materialCostId },
          });
          if (data?.materialCost) {
            setSelectedMaterial(data.materialCost);

            // Calcular precio total basado en cantidad
            const totalCost = calculateTotalPrice(
              formData.quantity || 1,
              data.materialCost.costPrice,
            );

            // Actualizar formData con los valores del material
            setFormData((prev) => ({
              ...prev,
              costPrice: totalCost,
              costCurrency:
                data.materialCost.currency?.code || prev.costCurrency,
              baseCurrency:
                data.materialCost.currency?.code || prev.baseCurrency,
              unitOfMeasureId:
                data.materialCost.unitOfMeasure?.id || prev.unitOfMeasureId,
            }));
          }
        } catch (error) {
          console.error("Error loading material details:", error);
        }
      } else {
        setSelectedMaterial(null);
      }
    };

    loadMaterialDetails();
  }, [formData.materialCostId, formData.quantity, getMaterialDetails]);

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
      warranty: "30 días",
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
      quantity: 1,
      createInventory: false,
      selectedOffices: [],
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
    setSelectedMaterial(null);
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
    officeOptions,
    officesLoading,
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
    selectedMaterial,
  };
};
