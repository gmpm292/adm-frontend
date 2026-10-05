import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import { useMutation, useQuery } from "@apollo/client";
import {
  GET_PAYMENT_RULE_BY_ID,
  UPDATE_PAYMENT_RULE,
} from "../graphql/queries";
import { Toast } from "primereact/toast";
import { Message } from "primereact/message";
import { FormField } from "../../../../components/ui";
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

export const PaymentRuleEditForm = ({
  paymentRuleId,
  visible,
  onHide,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    paymentType: null,
    workerType: null,
    otherType: "",
    isActive: true,
    distributeProfits: false,
    paymentCurrency: "USD",
    scope: "BUSINESS",
    conditions: {
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
  const [updatePaymentRule] = useMutation(UPDATE_PAYMENT_RULE);

  const { loading, error } = useQuery(GET_PAYMENT_RULE_BY_ID, {
    variables: { id: paymentRuleId },
    skip: !paymentRuleId,
    onCompleted: (data) => {
      if (data?.paymentRule) {
        const rule = data.paymentRule;
        setFormData({
          id: rule.id,
          name: rule.name,
          description: rule.description || "",
          paymentType: rule.paymentType,
          workerType: rule.workerType,
          otherType: rule.otherType || "",
          isActive: rule.isActive,
          distributeProfits: rule.distributeProfits || false,
          paymentCurrency: rule.paymentCurrency || "USD",
          scope: rule.scope || "BUSINESS",
          conditions: {
            priceRanges: rule.conditions?.priceRanges || [],
            saleQuantity: rule.conditions?.saleQuantity || [],
            fixedAmount: rule.conditions?.fixedAmount || null,
            percentage: rule.conditions?.percentage || null,
          },
          businessId: rule.business?.id || null,
          officeId: rule.office?.id || null,
          departmentId: rule.department?.id || null,
          teamId: rule.team?.id || null,
        });
      }
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (e) => {
    setFormData((prev) => ({ ...prev, isActive: e.value }));
  };

  const handleDistributeProfitsChange = (e) => {
    setFormData((prev) => ({ ...prev, distributeProfits: e.value }));
  };

  const handleSecurityEntitiesChange = (entities) => {
    setFormData((prev) => ({ ...prev, ...entities }));
  };

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

  const handleWorkerTypeChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      workerType: e.value,
      otherType: e.value === "OTHER" ? prev.otherType : "",
    }));
  };

  const handleCurrencyChange = (e) => {
    setFormData((prev) => ({ ...prev, paymentCurrency: e.value }));
  };

  const handleScopeChange = (e) => {
    setFormData((prev) => ({ ...prev, scope: e.value }));
  };

  const handleAddPriceRange = () => {
    setFormData((prev) => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        priceRanges: [
          ...prev.conditions.priceRanges,
          {
            min: 0,
            max: null,
            currency: prev.paymentCurrency || "USD",
            amount: null,
            percentage: null,
          },
        ],
      },
    }));
  };

  const handlePriceRangeChange = (index, condition) => {
    const newPriceRanges = [...formData.conditions.priceRanges];
    newPriceRanges[index] = condition;
    setFormData((prev) => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        priceRanges: newPriceRanges,
      },
    }));
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

  const handleAddSaleQuantity = () => {
    setFormData((prev) => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        saleQuantity: [
          ...prev.conditions.saleQuantity,
          { minProducts: 1, ratePerProduct: null, percentagePerProduct: null },
        ],
      },
    }));
  };

  const handleSaleQuantityChange = (index, condition) => {
    const newSaleQuantity = [...formData.conditions.saleQuantity];
    newSaleQuantity[index] = condition;
    setFormData((prev) => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        saleQuantity: newSaleQuantity,
      },
    }));
  };

  const handleRemoveSaleQuantity = (index) => {
    setFormData((prev) => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        saleQuantity: prev.conditions.saleQuantity.filter(
          (_, i) => i !== index,
        ),
      },
    }));
  };

  const handleFixedAmountChange = (condition) => {
    setFormData((prev) => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        fixedAmount: condition,
      },
    }));
  };

  const handlePercentageChange = (condition) => {
    setFormData((prev) => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        percentage: condition,
      },
    }));
  };

  const handleSubmit = async () => {
    try {
      const { name, paymentType, workerType, paymentCurrency, scope } =
        formData;

      if (!name || !paymentType || !workerType || !paymentCurrency || !scope) {
        throw new Error(
          "Nombre, tipo de pago, tipo de trabajador, moneda y ámbito son campos requeridos",
        );
      }

      if (workerType === "OTHER" && !formData.otherType.trim()) {
        throw new Error(
          "Debe especificar el tipo de trabajador cuando selecciona 'Otro'.",
        );
      }

      const conditionsInput = {};

      if (
        formData.paymentType === "PRICE_RANGE" &&
        formData.conditions.priceRanges.length === 0
      ) {
        throw new Error("Debe agregar al menos un rango de precios");
      }

      if (
        formData.paymentType === "SALE_QUANTITY" &&
        formData.conditions.saleQuantity.length === 0
      ) {
        throw new Error(
          "Debe agregar al menos una condición de cantidad de ventas",
        );
      }

      if (
        formData.paymentType === "FIXED_AMOUNT" &&
        !formData.conditions.fixedAmount
      ) {
        throw new Error("Debe configurar el monto fijo");
      }

      if (
        formData.paymentType === "PERCENTAGE" &&
        !formData.conditions.percentage
      ) {
        throw new Error("Debe configurar el porcentaje");
      }

      if (formData.paymentType === "PRICE_RANGE") {
        conditionsInput.priceRanges = formData.conditions.priceRanges;
      } else if (formData.paymentType === "SALE_QUANTITY") {
        conditionsInput.saleQuantity = formData.conditions.saleQuantity;
      } else if (formData.paymentType === "FIXED_AMOUNT") {
        conditionsInput.fixedAmount = formData.conditions.fixedAmount;
      } else if (formData.paymentType === "PERCENTAGE") {
        conditionsInput.percentage = formData.conditions.percentage;
      }

      await updatePaymentRule({
        variables: {
          updatePaymentRuleInput: {
            id: formData.id,
            name: formData.name,
            description: formData.description,
            paymentType: formData.paymentType,
            workerType: formData.workerType,
            isActive: formData.isActive,
            distributeProfits: formData.distributeProfits,
            paymentCurrency: formData.paymentCurrency,
            scope: formData.scope,
            conditions: conditionsInput,
            businessId: formData.businessId,
            officeId: formData.officeId,
            departmentId: formData.departmentId,
            teamId: formData.teamId,
            ...(formData.workerType === "OTHER" && {
              otherType: formData.otherType,
            }),
          },
        },
      });

      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Regla de pago actualizada correctamente",
        life: 3000,
      });

      onSuccess();
      onHide();
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
    <>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        onClick={onHide}
        severity="secondary"
      />
      <Button
        label="Guardar"
        icon="pi pi-check"
        onClick={handleSubmit}
        autoFocus
      />
    </>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header="Editar Regla de Pago"
        visible={visible}
        className="w-full md:w-10 lg:w-8"
        footer={footer}
        onHide={onHide}
      >
        {loading ? (
          <p className="text-color-secondary">Cargando...</p>
        ) : error ? (
          <Message
            severity="error"
            text="Error al cargar regla de pago"
            className="w-full"
          />
        ) : (
          <div className="p-fluid">
            <FormField label="Nombre" htmlFor="name" required>
              <InputText
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </FormField>

            <FormField label="Descripción" htmlFor="description">
              <InputText
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </FormField>

            <div className="formgrid grid">
              <div className="col-12 md:col-4">
                <FormField label="Tipo de Pago" htmlFor="paymentType" required>
                  <Dropdown
                    id="paymentType"
                    value={formData.paymentType}
                    options={paymentTypes}
                    onChange={handlePaymentTypeChange}
                    optionLabel="label"
                    placeholder="Seleccione"
                    required
                  />
                </FormField>
              </div>
              <div className="col-12 md:col-4">
                <FormField label="Tipo de Trabajador" htmlFor="workerType" required>
                  <Dropdown
                    id="workerType"
                    value={formData.workerType}
                    options={workerTypes}
                    onChange={handleWorkerTypeChange}
                    optionLabel="label"
                    placeholder="Seleccione"
                    required
                  />
                </FormField>
              </div>
              {formData.workerType === "OTHER" && (
                <div className="col-12 md:col-4">
                  <FormField label="Especificar Tipo" htmlFor="otherType" required>
                    <InputText
                      id="otherType"
                      name="otherType"
                      value={formData.otherType}
                      onChange={handleChange}
                      placeholder="Especifique el tipo de trabajador"
                      required
                    />
                  </FormField>
                </div>
              )}
              {formData.workerType !== "OTHER" && (
                <div className="col-12 md:col-4">
                  <FormField label="Estado" htmlFor="isActive">
                    <div className="flex align-items-center">
                      <InputSwitch
                        id="isActive"
                        checked={formData.isActive}
                        onChange={handleStatusChange}
                      />
                      <span className="ml-2">
                        {formData.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </FormField>
                </div>
              )}
              <div className="col-12 md:col-4">
                <FormField label="Moneda de Pago" htmlFor="paymentCurrency" required>
                  <Dropdown
                    id="paymentCurrency"
                    value={formData.paymentCurrency}
                    options={currencyOptions}
                    onChange={handleCurrencyChange}
                    optionLabel="label"
                    placeholder="Seleccione"
                    required
                  />
                </FormField>
              </div>
              <div className="col-12 md:col-4">
                <FormField label="Ámbito" htmlFor="scope" required>
                  <Dropdown
                    id="scope"
                    value={formData.scope}
                    options={scopedAccessOptions}
                    onChange={handleScopeChange}
                    optionLabel="label"
                    placeholder="Seleccione"
                    required
                  />
                </FormField>
              </div>
              <div className="col-12 md:col-4">
                <FormField label="Distribuir Beneficios" htmlFor="distributeProfits">
                  <div className="flex align-items-center">
                    <InputSwitch
                      id="distributeProfits"
                      checked={formData.distributeProfits}
                      onChange={handleDistributeProfitsChange}
                    />
                    <span className="ml-2">
                      {formData.distributeProfits ? "Sí" : "No"}
                    </span>
                  </div>
                </FormField>
              </div>
            </div>

            <SecurityEntitySelector
              onSelectionChange={handleSecurityEntitiesChange}
              initialValues={{
                businessId: formData.businessId,
                officeId: formData.officeId,
                departmentId: formData.departmentId,
                teamId: formData.teamId,
              }}
            />

            {formData.paymentType === "PRICE_RANGE" && (
              <div className="mb-4">
                <div className="flex justify-content-between align-items-center mb-3">
                  <span className="font-medium">Rangos de Precio</span>
                  <Button
                    label="Agregar Rango"
                    icon="pi pi-plus"
                    size="small"
                    severity="secondary"
                    onClick={handleAddPriceRange}
                  />
                </div>
                {formData.conditions.priceRanges.map((range, index) => (
                  <PriceRangeCondition
                    key={index}
                    index={index}
                    condition={range}
                    onChange={(condition) =>
                      handlePriceRangeChange(index, condition)
                    }
                    onRemove={() => handleRemovePriceRange(index)}
                    currencyOptions={currencyOptions}
                    mainCurrency={formData.paymentCurrency}
                    isFirst={index === 0}
                  />
                ))}
              </div>
            )}

            {formData.paymentType === "SALE_QUANTITY" && (
              <div className="mb-4">
                <div className="flex justify-content-between align-items-center mb-3">
                  <span className="font-medium">Condiciones de Cantidad de Ventas</span>
                  <Button
                    label="Agregar Condición"
                    icon="pi pi-plus"
                    size="small"
                    severity="secondary"
                    onClick={handleAddSaleQuantity}
                  />
                </div>
                {formData.conditions.saleQuantity.map((condition, index) => (
                  <SaleQuantityCondition
                    key={index}
                    condition={condition}
                    onChange={(cond) => handleSaleQuantityChange(index, cond)}
                    onRemove={() => handleRemoveSaleQuantity(index)}
                  />
                ))}
              </div>
            )}

            {formData.paymentType === "FIXED_AMOUNT" && (
              <FormField label="Monto Fijo">
                <FixedAmountCondition
                  condition={
                    formData.conditions.fixedAmount || {
                      amount: 0,
                    }
                  }
                  onChange={handleFixedAmountChange}
                />
              </FormField>
            )}

            {formData.paymentType === "PERCENTAGE" && (
              <FormField label="Porcentaje">
                <PercentageCondition
                  condition={
                    formData.conditions.percentage || {
                      percentage: 0,
                    }
                  }
                  onChange={handlePercentageChange}
                />
              </FormField>
            )}
          </div>
        )}
      </Dialog>
    </>
  );
};
