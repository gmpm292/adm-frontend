import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import { Toast } from "primereact/toast";
import { Fieldset } from "primereact/fieldset";
import { useMutation } from "@apollo/client";
import { CurrencyInput } from "../../../../components/CurrencyInput/CurrencyInput";
import { CREATE_PAYMENT_RULE } from "../graphql/queries";
import { FixedAmountCondition } from "../conditions/FixedAmountCondition";
import { PercentageCondition } from "../conditions/PercentageCondition";
import { PriceRangeCondition } from "../conditions/PriceRangeCondition";
import { SaleQuantityCondition } from "../conditions/SaleQuantityCondition";
import SecurityEntitySelector from "../../../../components/SecurityEntitySelector/SecurityEntitySelector";

const paymentTypes = [
  { label: "Rango de precios", value: "PRICE_RANGE" },
  { label: "Cantidad de ventas", value: "SALE_QUANTITY" },
  { label: "Monto fijo", value: "FIXED_AMOUNT" },
  { label: "Porcentaje", value: "PERCENTAGE" },
];

const workerTypes = [
  { label: "Publicista", value: "PUBLICIST" },
  { label: "Económico", value: "ECONOMIC" },
  { label: "Trabajador de servicios", value: "SERVICE" },
  { label: "Mensajero", value: "COURIER" },
  { label: "Técnico/Especialista", value: "TECHNICIAN" },
  { label: "Personal operativo", value: "OPERATIVE" },
  { label: "Director", value: "PRINCIPAL" },
  { label: "Administrativo", value: "ADMINISTRATIVE" },
  { label: "Gerente", value: "MANAGER" },
  { label: "Supervisor", value: "SUPERVISOR" },
  { label: "Agente", value: "AGENT" },
  { label: "Otro", value: "OTHER" },
];

const scopedAccessOptions = [
  { label: "Business", value: "BUSINESS" },
  { label: "Oficina", value: "OFFICE" },
  { label: "Departamento", value: "DEPARTMENT" },
  { label: "Equipo", value: "TEAM" },
  { label: "Personal", value: "PERSONAL" },
  { label: "Relacionado", value: "RELATED" },
];

const currencyOptions = [
  { label: "USD", value: "USD" },
  { label: "CUP", value: "CUP" },
  { label: "MLC", value: "MLC" },
];

export const PaymentRuleCreateForm = ({ visible, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    paymentType: null,
    workerType: null,
    isActive: true,
    conditions: {
      paymentCurrency: "USD",
      scope: "BUSINESS",
      priceRanges: [],
      saleQuantity: [],
      fixedAmount: null,
      percentage: null,
    },
    businessId: null,
    officeId: null,
    departmentId: null,
    teamId: null,
  });

  const toast = useRef(null);
  const [createPaymentRule] = useMutation(CREATE_PAYMENT_RULE);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (e) =>
    setFormData((prev) => ({ ...prev, isActive: e.value }));

  const handleSecurityEntitiesChange = (entities) =>
    setFormData((prev) => ({ ...prev, ...entities }));

  const handlePaymentTypeChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      paymentType: e.value,
      conditions: {
        ...prev.conditions,
        priceRanges: [],
        saleQuantity: [],
        fixedAmount: null,
        percentage: null,
      },
    }));
  };

  const handleCurrencyChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        paymentCurrency: e.value,
      },
    }));
  };

  const handleScopeChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        scope: e.value,
      },
    }));
  };

  const handleAddPriceRange = React.useCallback(() => {
    setFormData((prev) => {
      // Obtener la moneda del primer rango si existe, sino usar paymentCurrency
      const mainCurrency =
        prev.conditions.priceRanges[0]?.currency ||
        prev.conditions.paymentCurrency ||
        "USD";

      return {
        ...prev,
        conditions: {
          ...prev.conditions,
          priceRanges: [
            ...prev.conditions.priceRanges,
            {
              min: 0,
              max: null,
              currency: mainCurrency, // Usar la moneda principal
              amount: 0,
            },
          ],
        },
      };
    });
  }, []);

  const handlePriceRangeChange = (index, newCondition) => {
    setFormData((prev) => {
      const newRanges = [...prev.conditions.priceRanges];
      newRanges[index] = newCondition;

      // Sincronizar moneda si es el primer rango
      if (index === 0) {
        const firstCurrency = newCondition.currency;
        newRanges.forEach((range, i) => {
          if (i > 0) newRanges[i].currency = firstCurrency;
        });
      }

      return {
        ...prev,
        conditions: { ...prev.conditions, priceRanges: newRanges },
      };
    });
  };

  const handleRemovePriceRange = (index) => {
    setFormData((prev) => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        priceRanges: prev.conditions.priceRanges.filter((_, i) => i !== index),
      },
    }));
  };

  const handleAddSaleQuantity = React.useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        saleQuantity: [
          ...prev.conditions.saleQuantity,
          { minProducts: 1, ratePerProduct: 0 },
        ],
      },
    }));
  }, []);

  const handleSaleQuantityChange = React.useCallback((index, condition) => {
    setFormData((prev) => {
      const updated = [...prev.conditions.saleQuantity];
      updated[index] = condition;
      return {
        ...prev,
        conditions: { ...prev.conditions, saleQuantity: updated },
      };
    });
  }, []);

  const handleRemoveSaleQuantity = (index) => {
    setFormData((prev) => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        saleQuantity: prev.conditions.saleQuantity.filter(
          (_, i) => i !== index
        ),
      },
    }));
  };

  const handleFixedAmountChange = (condition) =>
    setFormData((prev) => ({
      ...prev,
      conditions: { ...prev.conditions, fixedAmount: condition },
    }));

  const handlePercentageChange = (condition) =>
    setFormData((prev) => ({
      ...prev,
      conditions: { ...prev.conditions, percentage: condition },
    }));

  const handleSubmit = async () => {
    try {
      const { name, paymentType, workerType, conditions } = formData;

      // Validaciones básicas
      if (!name || !paymentType || !workerType) {
        throw new Error(
          "Nombre, tipo de pago y tipo de trabajador son requeridos."
        );
      }

      // Validaciones específicas por tipo de pago
      switch (paymentType) {
        case "PRICE_RANGE":
          validatePriceRanges(conditions.priceRanges);
          break;
        case "SALE_QUANTITY":
          if (conditions.saleQuantity.length === 0) {
            throw new Error(
              "Debe agregar al menos una condición de cantidad de ventas."
            );
          }
          break;
        case "FIXED_AMOUNT":
          if (!conditions.fixedAmount) {
            throw new Error("Debe configurar el monto fijo.");
          }
          break;
        case "PERCENTAGE":
          if (!conditions.percentage) {
            throw new Error("Debe configurar el porcentaje.");
          }
          break;
      }

      const conditionsInput = {
        paymentCurrency: conditions.paymentCurrency,
        scope: conditions.scope,
      };

      switch (paymentType) {
        case "PRICE_RANGE":
          if (!conditions.priceRanges.length)
            throw new Error("Debe agregar al menos un rango de precios.");
          conditionsInput.priceRanges = conditions.priceRanges;
          break;

        case "SALE_QUANTITY":
          if (!conditions.saleQuantity.length)
            throw new Error(
              "Debe agregar al menos una condición de cantidad de ventas."
            );
          conditionsInput.saleQuantity = conditions.saleQuantity;
          break;

        case "FIXED_AMOUNT":
          if (!conditions.fixedAmount)
            throw new Error("Debe configurar el monto fijo.");
          conditionsInput.fixedAmount = conditions.fixedAmount;
          break;

        case "PERCENTAGE":
          if (!conditions.percentage)
            throw new Error("Debe configurar el porcentaje.");
          conditionsInput.percentage = conditions.percentage;
          break;
      }

      await createPaymentRule({
        variables: {
          createPaymentRuleInput: { ...formData, conditions: conditionsInput },
        },
      });

      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Regla de pago creada correctamente",
        life: 3000,
      });

      onSuccess();
      onHide();
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: err.message,
        life: 4000,
      });
    }
  };

  const validatePriceRanges = (ranges) => {
    // 1. Validar que haya al menos un rango
    if (ranges.length === 0) {
      throw new Error("Debe agregar al menos un rango de precios");
    }

    // 2. Validar campos obligatorios en cada rango
    for (let i = 0; i < ranges.length; i++) {
      const range = ranges[i];

      if (range.min === null || range.min === undefined) {
        throw new Error(`El mínimo del rango ${i + 1} es requerido`);
      }

      if (range.amount === null || range.amount === undefined) {
        throw new Error(`El monto del rango ${i + 1} es requerido`);
      }

      // Solo validar máximo si no es el último rango
      if (
        i < ranges.length - 1 &&
        (range.max === null || range.max === undefined)
      ) {
        throw new Error(
          `El máximo del rango ${
            i + 1
          } es requerido (excepto para el último rango)`
        );
      }
    }

    // 3. Validar que los rangos sean consecutivos y no se solapen
    for (let i = 1; i < ranges.length; i++) {
      const prevRange = ranges[i - 1];
      const currentRange = ranges[i];

      if (prevRange.max === null || currentRange.min === null) {
        continue; // Si es el último rango, no validar
      }

      if (currentRange.min < prevRange.max) {
        throw new Error(
          `El mínimo del rango ${
            i + 1
          } debe ser mayor o igual al máximo del rango anterior`
        );
      }
    }

    // 4. Validar que los montos sean positivos
    for (let i = 0; i < ranges.length; i++) {
      if (ranges[i].amount < 0) {
        throw new Error(`El monto del rango ${i + 1} debe ser positivo`);
      }
    }

    // 5. Validar que la moneda sea la misma en todos los rangos
    const firstCurrency = ranges[0]?.currency;
    for (let i = 1; i < ranges.length; i++) {
      if (ranges[i].currency !== firstCurrency) {
        throw new Error("Todos los rangos deben usar la misma moneda");
      }
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header="Crear Nueva Regla de Pago"
        visible={visible}
        style={{ width: "60vw" }}
        onHide={onHide}
        footer={
          <div className="flex justify-content-end gap-2">
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
            />
          </div>
        }
      >
        <div className="p-fluid">
          <Fieldset legend="Datos Generales" className="mb-4">
            <div className="grid formgrid">
              <div className="col-12 md:col-6">
                <label htmlFor="name">Nombre*</label>
                <InputText
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="col-12 md:col-6">
                <label htmlFor="description">Descripción</label>
                <InputText
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
              <div className="col-12 md:col-4">
                <label htmlFor="paymentType">Tipo de Pago*</label>
                <Dropdown
                  id="paymentType"
                  value={formData.paymentType}
                  options={paymentTypes}
                  onChange={handlePaymentTypeChange}
                  optionLabel="label"
                  placeholder="Seleccione"
                />
              </div>
              <div className="col-12 md:col-4">
                <label htmlFor="workerType">Tipo de Trabajador*</label>
                <Dropdown
                  id="workerType"
                  value={formData.workerType}
                  options={workerTypes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, workerType: e.value }))
                  }
                  optionLabel="label"
                  placeholder="Seleccione"
                />
              </div>
              <div className="col-12 md:col-4">
                <label htmlFor="isActive">Estado</label>
                <div className="flex align-items-center gap-2">
                  <InputSwitch
                    id="isActive"
                    checked={formData.isActive}
                    onChange={handleStatusChange}
                  />
                  <span>{formData.isActive ? "Activo" : "Inactivo"}</span>
                </div>
              </div>
            </div>
          </Fieldset>

          <Fieldset legend="Ubicación y Entidad de Seguridad" className="mb-4">
            <SecurityEntitySelector
              onSelectionChange={handleSecurityEntitiesChange}
            />
          </Fieldset>

          <Fieldset legend="Condiciones de Pago">
            <div className="grid">
              <div className="col-12 md:col-6">
                <label htmlFor="paymentCurrency">Moneda de Pago*</label>
                <Dropdown
                  id="paymentCurrency"
                  value={formData.conditions.paymentCurrency}
                  options={currencyOptions}
                  onChange={handleCurrencyChange}
                  optionLabel="label"
                  placeholder="Seleccione"
                  className="w-full"
                />
              </div>
              <div className="col-12 md:col-6">
                <label htmlFor="scope">Ámbito*</label>
                <Dropdown
                  id="scope"
                  value={formData.conditions.scope}
                  options={scopedAccessOptions}
                  onChange={handleScopeChange}
                  placeholder="Seleccione"
                  required
                  className="w-full"
                />
              </div>
            </div>

            {formData.paymentType === "PRICE_RANGE" && (
              <div>
                <div className="flex justify-content-between align-items-center mb-2">
                  <label>Rangos de Precio</label>
                  <Button
                    label="Agregar"
                    icon="pi pi-plus"
                    className="p-button-sm"
                    onClick={handleAddPriceRange}
                  />
                </div>
                {formData.conditions.priceRanges.map((range, i) => (
                  <PriceRangeCondition
                    key={i}
                    index={i}
                    condition={range}
                    onChange={(c) => handlePriceRangeChange(i, c)}
                    onRemove={() => handleRemovePriceRange(i)}
                    currencyOptions={currencyOptions}
                    mainCurrency={formData.conditions.paymentCurrency}
                    isFirst={i === 0}
                  />
                ))}
              </div>
            )}

            {formData.paymentType === "SALE_QUANTITY" && (
              <div>
                <div className="flex justify-content-between align-items-center mb-2">
                  <label>Condiciones de Venta</label>
                  <Button
                    label="Agregar"
                    icon="pi pi-plus"
                    className="p-button-sm"
                    onClick={handleAddSaleQuantity}
                  />
                </div>
                {formData.conditions.saleQuantity.map((cond, i) => (
                  <SaleQuantityCondition
                    key={i}
                    condition={cond}
                    onChange={(c) => handleSaleQuantityChange(i, c)}
                    onRemove={() => handleRemoveSaleQuantity(i)}
                  />
                ))}
              </div>
            )}

            {formData.paymentType === "FIXED_AMOUNT" && (
              <FixedAmountCondition
                condition={formData.conditions.fixedAmount || { amount: 0 }}
                onChange={handleFixedAmountChange}
              />
            )}

            {formData.paymentType === "PERCENTAGE" && (
              <PercentageCondition
                condition={formData.conditions.percentage || { percentage: 0 }}
                onChange={handlePercentageChange}
              />
            )}
          </Fieldset>
        </div>
      </Dialog>
    </>
  );
};
