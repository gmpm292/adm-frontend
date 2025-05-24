import React, { useState, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import { useMutation } from '@apollo/client';
import { CREATE_PAYMENT_RULE } from '../graphql/queries';
import { Toast } from 'primereact/toast';
import { FixedAmountCondition } from '../conditions/FixedAmountCondition';
import { PercentageCondition } from '../conditions/PercentageCondition';
import { PriceRangeCondition } from '../conditions/PriceRangeCondition';
import { SaleQuantityCondition } from '../conditions/SaleQuantityCondition';
import SecurityEntitySelector from '../../../../components/SecurityEntitySelector/SecurityEntitySelector';

const paymentTypes = [
  { label: 'Rango de precios', value: 'PRICE_RANGE' },
  { label: 'Cantidad de ventas', value: 'SALE_QUANTITY' },
  { label: 'Monto fijo', value: 'FIXED_AMOUNT' },
  { label: 'Porcentaje', value: 'PERCENTAGE' }
];

const workerTypes = [
  { label: 'Agente', value: 'AGENT' },
  { label: 'Publicista', value: 'PUBLICIST' },
  { label: 'Económico', value: 'ECONOMIC' },
  { label: 'Otro', value: 'OTHER' }
];

export const PaymentRuleCreateForm = ({ visible, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    paymentType: null,
    workerType: null,
    isActive: true,
    conditions: {
      paymentCurrency: 'USD',
      priceRanges: [],
      saleQuantity: [],
      fixedAmount: null,
      percentage: null
    },
    businessId: null,
    officeId: null,
    departmentId: null,
    teamId: null
  });
  const toast = useRef(null);
  const [createPaymentRule] = useMutation(CREATE_PAYMENT_RULE);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (e) => {
    setFormData(prev => ({ ...prev, isActive: e.value }));
  };

  const handleSecurityEntitiesChange = (entities) => {
    setFormData(prev => ({ ...prev, ...entities }));
  };

  const handlePaymentTypeChange = (e) => {
    setFormData(prev => ({
      ...prev,
      paymentType: e.value,
      conditions: {
        ...prev.conditions,
        priceRanges: [],
        saleQuantity: [],
        fixedAmount: null,
        percentage: null
      }
    }));
  };

  const handleAddPriceRange = () => {
    setFormData(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        priceRanges: [
          ...prev.conditions.priceRanges,
          { min: 0, max: null, currency: 'USD', amount: 0, scope: 'BUSINESS' }
        ]
      }
    }));
  };

  const handlePriceRangeChange = (index, condition) => {
    const newPriceRanges = [...formData.conditions.priceRanges];
    newPriceRanges[index] = condition;
    setFormData(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        priceRanges: newPriceRanges
      }
    }));
  };

  const handleRemovePriceRange = (index) => {
    setFormData(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        priceRanges: prev.conditions.priceRanges.filter((_, i) => i !== index)
      }
    }));
  };

  const handleAddSaleQuantity = () => {
    setFormData(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        saleQuantity: [
          ...prev.conditions.saleQuantity,
          { minProducts: 1, ratePerProduct: 0, scope: 'BUSINESS' }
        ]
      }
    }));
  };

  const handleSaleQuantityChange = (index, condition) => {
    const newSaleQuantity = [...formData.conditions.saleQuantity];
    newSaleQuantity[index] = condition;
    setFormData(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        saleQuantity: newSaleQuantity
      }
    }));
  };

  const handleRemoveSaleQuantity = (index) => {
    setFormData(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        saleQuantity: prev.conditions.saleQuantity.filter((_, i) => i !== index)
      }
    }));
  };

  const handleFixedAmountChange = (condition) => {
    setFormData(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        fixedAmount: condition
      }
    }));
  };

  const handlePercentageChange = (condition) => {
    setFormData(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        percentage: condition
      }
    }));
  };

  const handleCurrencyChange = (e) => {
    setFormData(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        paymentCurrency: e.target.value
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.paymentType || !formData.workerType) {
        throw new Error('Nombre, tipo de pago y tipo de trabajador son campos requeridos');
      }

      const conditionsInput = {
        paymentCurrency: formData.conditions.paymentCurrency
      };

      if (formData.paymentType === 'PRICE_RANGE' && formData.conditions.priceRanges.length === 0) {
        throw new Error('Debe agregar al menos un rango de precios');
      }

      if (formData.paymentType === 'SALE_QUANTITY' && formData.conditions.saleQuantity.length === 0) {
        throw new Error('Debe agregar al menos una condición de cantidad de ventas');
      }

      if (formData.paymentType === 'FIXED_AMOUNT' && !formData.conditions.fixedAmount) {
        throw new Error('Debe configurar el monto fijo');
      }

      if (formData.paymentType === 'PERCENTAGE' && !formData.conditions.percentage) {
        throw new Error('Debe configurar el porcentaje');
      }

      if (formData.paymentType === 'PRICE_RANGE') {
        conditionsInput.priceRanges = formData.conditions.priceRanges;
      } else if (formData.paymentType === 'SALE_QUANTITY') {
        conditionsInput.saleQuantity = formData.conditions.saleQuantity;
      } else if (formData.paymentType === 'FIXED_AMOUNT') {
        conditionsInput.fixedAmount = formData.conditions.fixedAmount;
      } else if (formData.paymentType === 'PERCENTAGE') {
        conditionsInput.percentage = formData.conditions.percentage;
      }

      await createPaymentRule({
        variables: {
          createPaymentRuleInput: {
            ...formData,
            conditions: conditionsInput
          }
        }
      });

      toast.current.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Regla de pago creada correctamente',
        life: 3000
      });

      onSuccess();
      onHide();
      setFormData({
        name: '',
        description: '',
        paymentType: null,
        workerType: null,
        isActive: true,
        conditions: {
          paymentCurrency: 'USD',
          priceRanges: [],
          saleQuantity: [],
          fixedAmount: null,
          percentage: null
        },
        businessId: null,
        officeId: null,
        departmentId: null,
        teamId: null
      });
    } catch (err) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: err.message,
        life: 3000
      });
    }
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="Crear" icon="pi pi-check" onClick={handleSubmit} autoFocus />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog 
        header="Crear Nueva Regla de Pago" 
        visible={visible} 
        style={{ width: '70vw' }} 
        footer={footer} 
        onHide={onHide}
      >
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="name">Nombre*</label>
            <InputText 
              id="name" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required
            />
          </div>

          <div className="p-field">
            <label htmlFor="description">Descripción</label>
            <InputText 
              id="description" 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
            />
          </div>

          <div className="p-grid">
            <div className="p-col-12 p-md-4">
              <div className="p-field">
                <label htmlFor="paymentType">Tipo de Pago*</label>
                <Dropdown
                  id="paymentType"
                  value={formData.paymentType}
                  options={paymentTypes}
                  onChange={handlePaymentTypeChange}
                  optionLabel="label"
                  placeholder="Seleccione"
                  required
                />
              </div>
            </div>
            <div className="p-col-12 p-md-4">
              <div className="p-field">
                <label htmlFor="workerType">Tipo de Trabajador*</label>
                <Dropdown
                  id="workerType"
                  value={formData.workerType}
                  options={workerTypes}
                  onChange={(e) => setFormData(prev => ({ ...prev, workerType: e.value }))}
                  optionLabel="label"
                  placeholder="Seleccione"
                  required
                />
              </div>
            </div>
            <div className="p-col-12 p-md-4">
              <div className="p-field">
                <label htmlFor="isActive">Estado</label>
                <div className="flex align-items-center">
                  <InputSwitch
                    id="isActive"
                    checked={formData.isActive}
                    onChange={handleStatusChange}
                  />
                  <span className="ml-2">
                    {formData.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <SecurityEntitySelector
            onSelectionChange={handleSecurityEntitiesChange}
          />

          <div className="p-field">
            <label htmlFor="paymentCurrency">Moneda de Pago*</label>
            <InputText
              id="paymentCurrency"
              value={formData.conditions.paymentCurrency}
              onChange={handleCurrencyChange}
              required
            />
          </div>

          {formData.paymentType === 'PRICE_RANGE' && (
            <div className="p-field">
              <div className="flex justify-content-between align-items-center">
                <label>Rangos de Precio</label>
                <Button
                  label="Agregar Rango"
                  icon="pi pi-plus"
                  className="p-button-sm"
                  onClick={handleAddPriceRange}
                />
              </div>
              {formData.conditions.priceRanges.map((range, index) => (
                <PriceRangeCondition
                  key={index}
                  condition={range}
                  onChange={(condition) => handlePriceRangeChange(index, condition)}
                  onRemove={() => handleRemovePriceRange(index)}
                />
              ))}
            </div>
          )}

          {formData.paymentType === 'SALE_QUANTITY' && (
            <div className="p-field">
              <div className="flex justify-content-between align-items-center">
                <label>Condiciones de Cantidad de Ventas</label>
                <Button
                  label="Agregar Condición"
                  icon="pi pi-plus"
                  className="p-button-sm"
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

          {formData.paymentType === 'FIXED_AMOUNT' && (
            <div className="p-field">
              <label>Monto Fijo</label>
              <FixedAmountCondition
                condition={formData.conditions.fixedAmount || { amount: 0, scope: 'BUSINESS' }}
                onChange={handleFixedAmountChange}
              />
            </div>
          )}

          {formData.paymentType === 'PERCENTAGE' && (
            <div className="p-field">
              <label>Porcentaje</label>
              <PercentageCondition
                condition={formData.conditions.percentage || { percentage: 0, scope: 'BUSINESS' }}
                onChange={handlePercentageChange}
              />
            </div>
          )}
        </div>
      </Dialog>
    </>
  );
};