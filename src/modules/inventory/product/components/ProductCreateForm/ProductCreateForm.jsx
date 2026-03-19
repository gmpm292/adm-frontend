import React, { useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { useMutation } from "@apollo/client";
import { Toast } from "primereact/toast";
import { useProductForm } from "./hooks/useProductForm";
import { BasicInfoPanel } from "./components/BasicInfoPanel";
import { AttributesPanel } from "./components/AttributesPanel";
import { PricingPanel } from "./components/PricingPanel";
import { SalesRulesPanel } from "./components/SalesRulesPanel";
import { InventoryCreationPanel } from "./components/InventoryCreationPanel";
import { CREATE_PRODUCT } from "../../graphql/queries";
import { CREATE_INVENTORY } from "../../../inventory/graphql/queries";

export const ProductCreateForm = ({ visible, onHide, onSuccess }) => {
  const toast = useRef(null);
  const [createProduct] = useMutation(CREATE_PRODUCT);
  const [createInventory] = useMutation(CREATE_INVENTORY);
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
  } = useProductForm(visible);

  const handleToggle = (index) => {
    setOpenPanel(openPanel === index ? null : index);
  };

  // Función para crear inventarios automáticos
  const createAutomaticInventories = async (productId) => {
    if (!formData.createInventory || !formData.selectedOffices?.length) {
      return;
    }

    // Obtener detalles completos de las oficinas seleccionadas desde officeOptions
    const offices = formData.selectedOffices.map((officeId) => {
      const office = officeOptions.find((opt) => opt.value === officeId);
      return {
        id: officeId,
        name: office?.label || `Oficina ${officeId}`,
        businessId: office?.businessId || formData.businessId,
      };
    });

    // Crear inventarios en paralelo
    const inventoryPromises = offices.map((office) =>
      createInventory({
        variables: {
          inventory: {
            productId: productId,
            currentStock: 0,
            minStock: 0,
            location: office.name,
            businessId: office.businessId || formData.businessId,
            officeId: office.id,
            departmentId: null,
            teamId: null,
          },
        },
      }),
    );

    await Promise.all(inventoryPromises);
  };

  const handleSubmit = async () => {
    try {
      // Validaciones actualizadas
      if (!formData.name || !formData.unitOfMeasureId || !formData.categoryId) {
        throw new Error(
          "Nombre, unidad de medida y categoría son campos requeridos",
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

      // Validar selección de oficinas si se activó la creación automática
      if (
        formData.createInventory &&
        (!formData.selectedOffices || formData.selectedOffices.length === 0)
      ) {
        throw new Error(
          "Debe seleccionar al menos una oficina para crear inventarios automáticos",
        );
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
        unitOfMeasureId: formData.unitOfMeasureId,
        materialCostId: formData.materialCostId,
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

      // Crear el producto
      const { data } = await createProduct({
        variables: { product: input },
      });

      const newProductId = data?.createProduct?.id;

      // Si se activó la creación automática de inventarios, crearlos
      if (formData.createInventory && newProductId) {
        await createAutomaticInventories(newProductId);

        toast.current.show({
          severity: "success",
          summary: "Éxito",
          detail: "Producto e inventarios creados correctamente",
          life: 3000,
        });
      } else {
        toast.current.show({
          severity: "success",
          summary: "Éxito",
          detail: "Producto creado correctamente",
          life: 3000,
        });
      }

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
            setFormData={setFormData}
            openPanel={openPanel}
            handleToggle={() => handleToggle(0)}
            handleChange={handleChange}
            handleCategorySelect={handleCategorySelect}
            handleUnitOfMeasureChange={handleUnitOfMeasureChange}
            handleMaterialCostChange={handleMaterialCostChange}
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
            quantity={formData.quantity}
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

          <InventoryCreationPanel
            formData={formData}
            setFormData={setFormData}
            openPanel={openPanel}
            handleToggle={() => handleToggle(4)}
          />
        </div>
      </Dialog>
    </>
  );
};
