import React, { useState, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { useMutation } from '@apollo/client';
import { CREATE_CURRENCY } from '../graphql/queries';
import { Toast } from 'primereact/toast';
import SecurityEntitySelector from '../../../../components/SecurityEntitySelector/SecurityEntitySelector';

export const CurrencyCreateForm = ({ visible, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    symbol: '',
    exchangeRateToCUP: 1,
    isActive: true,
    businessId: null,
    officeId: null,
    departmentId: null,
    teamId: null
  });
  const toast = useRef(null);
  const [createCurrency] = useMutation(CREATE_CURRENCY);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.value }));
  };

  const handleStatusChange = (e) => {
    setFormData(prev => ({ ...prev, isActive: e.value }));
  };

  const handleSecurityEntitiesChange = (entities) => {
    setFormData(prev => ({ ...prev, ...entities }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.code || !formData.name || !formData.symbol) {
        throw new Error('Código, nombre y símbolo son campos requeridos');
      }

      await createCurrency({
        variables: {
          createCurrencyInput: {
            ...formData,
            exchangeRateToCUP: Number(formData.exchangeRateToCUP)
          }
        }
      });

      toast.current.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Moneda creada correctamente',
        life: 3000
      });

      onSuccess();
      onHide();
      setFormData({
        code: '',
        name: '',
        symbol: '',
        exchangeRateToCUP: 1,
        isActive: true,
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
        header="Crear Nueva Moneda" 
        visible={visible} 
        style={{ width: '50vw' }} 
        footer={footer} 
        onHide={onHide}
      >
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="code">Código*</label>
            <InputText 
              id="code" 
              name="code" 
              value={formData.code} 
              onChange={handleChange} 
              required
              tooltip="Código de 3 letras (ej: USD, EUR)"
              tooltipOptions={{ position: 'top' }}
            />
          </div>

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
            <label htmlFor="symbol">Símbolo*</label>
            <InputText 
              id="symbol" 
              name="symbol" 
              value={formData.symbol} 
              onChange={handleChange} 
              required
            />
          </div>

          <div className="p-field">
            <label htmlFor="exchangeRateToCUP">Tasa de cambio (CUP)*</label>
            <InputNumber
              id="exchangeRateToCUP"
              name="exchangeRateToCUP"
              value={formData.exchangeRateToCUP}
              onValueChange={handleNumberChange}
              mode="decimal"
              min={0}
              max={1000}
              required
            />
          </div>

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

          <SecurityEntitySelector
            onSelectionChange={handleSecurityEntitiesChange}
          />
        </div>
      </Dialog>
    </>
  );
};