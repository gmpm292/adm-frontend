import React, { useState, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { useMutation, useQuery } from '@apollo/client';
import { GET_CURRENCY_BY_CODE, UPDATE_CURRENCY } from '../graphql/queries';
import { Toast } from 'primereact/toast';
import SecurityEntitySelector from '../../../../components/SecurityEntitySelector/SecurityEntitySelector';

export const CurrencyEditForm = ({ currencyCode, visible, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    id: null,
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
  const [updateCurrency] = useMutation(UPDATE_CURRENCY);

  const { loading, error } = useQuery(GET_CURRENCY_BY_CODE, {
    variables: { code: currencyCode },
    skip: !currencyCode,
    onCompleted: (data) => {
      if (data?.currency) {
        setFormData({
          id: data.currency.id,
          code: data.currency.code,
          name: data.currency.name,
          symbol: data.currency.symbol,
          exchangeRateToCUP: data.currency.exchangeRateToCUP,
          isActive: data.currency.isActive,
          businessId: data.currency.business?.id || null,
          officeId: data.currency.office?.id || null,
          departmentId: data.currency.department?.id || null,
          teamId: data.currency.team?.id || null
        });
      }
    }
  });

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

      await updateCurrency({
        variables: {
          updateCurrencyInput: {
            id: formData.id,
            ...formData,
            exchangeRateToCUP: Number(formData.exchangeRateToCUP)
          }
        }
      });

      toast.current.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Moneda actualizada correctamente',
        life: 3000
      });

      onSuccess();
      onHide();
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
      <Button label="Guardar" icon="pi pi-check" onClick={handleSubmit} autoFocus />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog 
        header="Editar Moneda" 
        visible={visible} 
        style={{ width: '50vw' }} 
        footer={footer} 
        onHide={onHide}
      >
        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p>Error al cargar moneda</p>
        ) : (
          <div className="p-fluid">
            <div className="p-field">
              <label htmlFor="code">Código</label>
              <InputText 
                id="code" 
                name="code" 
                value={formData.code} 
                onChange={handleChange} 
                disabled
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
              initialValues={{
                businessId: formData.businessId,
                officeId: formData.officeId,
                departmentId: formData.departmentId,
                teamId: formData.teamId
              }}
            />
          </div>
        )}
      </Dialog>
    </>
  );
};