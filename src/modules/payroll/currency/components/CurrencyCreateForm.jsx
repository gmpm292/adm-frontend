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
import { FormField } from '../../../../components/ui';

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
    <>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} severity="secondary" />
      <Button label="Crear" icon="pi pi-check" onClick={handleSubmit} autoFocus />
    </>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header="Crear Nueva Moneda"
        visible={visible}
        className="w-full md:w-8 lg:w-6"
        footer={footer}
        onHide={onHide}
      >
        <div className="formgrid grid">
          <div className="col-12 md:col-6">
            <FormField label="Código" htmlFor="code" required>
              <InputText
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                tooltip="Código de 3 letras (ej: USD, EUR)"
                tooltipOptions={{ position: 'top' }}
              />
            </FormField>
          </div>

          <div className="col-12 md:col-6">
            <FormField label="Nombre" htmlFor="name" required>
              <InputText
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </FormField>
          </div>

          <div className="col-12 md:col-6">
            <FormField label="Símbolo" htmlFor="symbol" required>
              <InputText
                id="symbol"
                name="symbol"
                value={formData.symbol}
                onChange={handleChange}
                required
              />
            </FormField>
          </div>

          <div className="col-12 md:col-6">
            <FormField label="Tasa de cambio (CUP)" htmlFor="exchangeRateToCUP" required>
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
            </FormField>
          </div>

          <div className="col-12">
            <FormField label="Estado" htmlFor="isActive">
              <div className="flex align-items-center gap-2">
                <InputSwitch
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleStatusChange}
                />
                <span>
                  {formData.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </FormField>
          </div>

          <div className="col-12">
            <SecurityEntitySelector
              onSelectionChange={handleSecurityEntitiesChange}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};
