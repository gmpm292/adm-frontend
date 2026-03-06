import React, { useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { useMutation } from "@apollo/client";
import { CREATE_PRODUCT } from "../../graphql/queries";
import { Toast } from "primereact/toast";
import { Panel } from "primereact/panel";
import { useProductForm } from "./hooks/useProductForm";
import { BasicInfoPanel } from "./components/BasicInfoPanel";
import { AttributesPanel } from "./components/AttributesPanel";
import { PricingPanel } from "./components/PricingPanel";
import { SalesRulesPanel } from "./components/SalesRulesPanel";

export const ProductCreateForm = ({ visible, onHide, onSuccess }) => {
  const toast = useRef(null);
  const [createProduct] = useMutation(CREATE_PRODUCT);
  const [openPanel, setOpenPanel] = useState(null);

  const {
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
  } = useProductForm(visible);

  const handleToggle = (index) => {
    setOpenPanel(openPanel === index ? null : index);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.unitOfMeasure || !formData.categoryId) {
        console.log("formData", formData);
        throw new Error(
          "Nombre, unidad de medida y categoría son campos requeridos"
        );
      }

      if (!formData.costPrice || !formData.costCurrency) {
        throw new Error("Precio de costo y moneda son requeridos");
      }

      if (!formData.basePrice || !formData.baseCurrency) {
        throw new Error("Precio Venta y moneda son requeridos");
      }

      if (formData.acceptedCurrencies.length === 0) {
        throw new Error("Debe seleccionar al menos una moneda aceptada");
      }

      const pricingConfig = {
        acceptedCurrencies: formData.acceptedCurrencies,
        fixedPrices:
          formData.fixedPrices.length > 0 ? formData.fixedPrices : null,
        exchangeRateMargin: formData.exchangeRateMargin || 0,
        decimalPlaces: formData.decimalPlaces || 2,
      };

      const input = {
        name: formData.name,
        unitOfMeasure: formData.unitOfMeasure,
        costPrice: formData.costPrice,
        costCurrency: formData.costCurrency,
        basePrice: formData.basePrice,
        baseCurrency: formData.baseCurrency,
        warranty: formData.warranty,
        categoryId: formData.categoryId,
        businessId: formData.businessId,
        officeId: formData.officeId,
        departmentId: formData.departmentId,
        teamId: formData.teamId,
        attributes:
          Object.keys(formData.attributes).length > 0
            ? formData.attributes
            : null,
        pricingConfig,
        saleRules:
          formData.saleRules.bulkDiscounts.length > 0 ||
          formData.saleRules.minQuantity !== null ||
          formData.saleRules.maxQuantity !== null
            ? formData.saleRules
            : null,
      };

      await createProduct({
        variables: {
          product: input,
        },
      });

      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Producto creado correctamente",
        life: 3000,
      });

      onSuccess();
      onHide();
      resetForm();
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: err.message,
        life: 3000,
      });
    }
  };

  const footer = (
    <div>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        onClick={onHide}
        className="p-button-text"
      />
      <Button
        label="Crear"
        icon="pi pi-check"
        onClick={handleSubmit}
        autoFocus
        disabled={currenciesLoading}
      />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header="Crear Nuevo Producto"
        visible={visible}
        style={{ width: "70vw" }}
        footer={footer}
        onHide={onHide}
        resizable
        draggable
      >
        {currenciesError && (
          <div className="p-message p-message-error">
            Error al cargar las monedas: {currenciesError.message}
          </div>
        )}

        <div className="p-fluid">
          <BasicInfoPanel
            formData={formData}
            openPanel={openPanel}
            handleToggle={() => handleToggle(0)}
            handleChange={handleChange}
            handleCategorySelect={handleCategorySelect}
            handleSecurityEntitiesChange={handleSecurityEntitiesChange}
          />

          <AttributesPanel
            formData={formData}
            openPanel={openPanel}
            handleToggle={() => handleToggle(1)}
            attributeKey={attributeKey}
            setAttributeKey={setAttributeKey}
            attributeValue={attributeValue}
            setAttributeValue={setAttributeValue}
            handleAddAttribute={handleAddAttribute}
            handleRemoveAttribute={handleRemoveAttribute}
          />

          <PricingPanel
            formData={formData}
            setFormData={setFormData}
            openPanel={openPanel}
            handleToggle={() => handleToggle(2)}
            currenciesLoading={currenciesLoading}
            currencyOptions={currencyOptions}
            availableFixedPriceCurrencies={availableFixedPriceCurrencies}
            handleNumberChange={handleNumberChange}
            fixedPrice={fixedPrice}
            setFixedPrice={setFixedPrice}
            handleAddFixedPrice={handleAddFixedPrice}
            handleRemoveFixedPrice={handleRemoveFixedPrice}
          />

          <SalesRulesPanel
            formData={formData}
            openPanel={openPanel}
            handleToggle={() => handleToggle(3)}
            currencyOptions={currencyOptions}
            bulkDiscount={bulkDiscount}
            setBulkDiscount={setBulkDiscount}
            handleAddBulkDiscount={handleAddBulkDiscount}
            handleRemoveBulkDiscount={handleRemoveBulkDiscount}
          />
        </div>
      </Dialog>
    </>
  );
};
