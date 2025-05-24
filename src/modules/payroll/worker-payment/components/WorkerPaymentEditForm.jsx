import React, { useState, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { useMutation, useQuery } from '@apollo/client';
import { GET_WORKER_PAYMENT_BY_ID, UPDATE_WORKER_PAYMENT } from '../graphql/queries';
import { Toast } from 'primereact/toast';
import SecurityEntitySelector from '../../../../components/SecurityEntitySelector/SecurityEntitySelector';

const paymentMethods = [
  { label: 'Efectivo', value: 'CASH' },
  { label: 'Transferencia Bancaria', value: 'BANK_TRANSFER' },
  { label: 'Cheque', value: 'CHECK' },
  { label: 'Pago Móvil', value: 'MOBILE_PAYMENT' },
  { label: 'Otro', value: 'OTHER' }
];

const paymentTypes = [
  { label: 'Salario', value: 'SALARY' },
  { label: 'Comisión', value: 'COMMISSION' },
  { label: 'Bono', value: 'BONUS' },
  { label: 'Otro', value: 'OTHER' }
];

export const WorkerPaymentEditForm = ({ paymentId, visible, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    amount: 0,
    currency: 'USD',
    exchangeRate: 1,
    paymentMethod: null,
    paymentType: null,
    paymentDate: null,
    notes: '',
    breakdown: {
      baseSalary: 0,
      commissions: 0,
      bonuses: 0,
      deductions: 0
    },
    workerId: null,
    payrollPeriodId: null,
    businessId: null,
    officeId: null,
    departmentId: null,
    teamId: null
  });
  const toast = useRef(null);
  const [updateWorkerPayment] = useMutation(UPDATE_WORKER_PAYMENT);

  const { loading, error } = useQuery(GET_WORKER_PAYMENT_BY_ID, {
    variables: { id: paymentId },
    skip: !paymentId,
    onCompleted: (data) => {
      if (data?.workerPayment) {
        const payment = data.workerPayment;
        setFormData({
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          exchangeRate: payment.exchangeRate || 1,
          paymentMethod: payment.paymentMethod,
          paymentType: payment.paymentType,
          paymentDate: new Date(payment.createdAt),
          notes: payment.notes || '',
          breakdown: payment.breakdown || {
            baseSalary: 0,
            commissions: 0,
            bonuses: 0,
            deductions: 0
          },
          workerId: payment.worker?.id || null,
          payrollPeriodId: payment.payrollPeriod?.id || null,
          businessId: payment.business?.id || null,
          officeId: payment.office?.id || null,
          departmentId: payment.department?.id || null,
          teamId: payment.team?.id || null
        });
      }
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBreakdownChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      breakdown: {
        ...prev.breakdown,
        [field]: value
      }
    }));
  };

  const handleDateChange = (value) => {
    setFormData(prev => ({ ...prev, paymentDate: value }));
  };

  const handleSecurityEntitiesChange = (entities) => {
    setFormData(prev => ({ ...prev, ...entities }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.amount || !formData.paymentMethod || !formData.paymentType || !formData.paymentDate) {
        throw new Error('Monto, método de pago, tipo de pago y fecha son campos requeridos');
      }

      await updateWorkerPayment({
        variables: {
          updateWorkerPaymentInput: {
            id: formData.id,
            amount: Number(formData.amount),
            currency: formData.currency,
            exchangeRate: Number(formData.exchangeRate),
            paymentMethod: formData.paymentMethod,
            paymentType: formData.paymentType,
            breakdown: {
              baseSalary: Number(formData.breakdown.baseSalary || 0),
              commissions: Number(formData.breakdown.commissions || 0),
              bonuses: Number(formData.breakdown.bonuses || 0),
              deductions: Number(formData.breakdown.deductions || 0)
            },
            notes: formData.notes,
            workerId: formData.workerId,
            payrollPeriodId: formData.payrollPeriodId,
            businessId: formData.businessId,
            officeId: formData.officeId,
            departmentId: formData.departmentId,
            teamId: formData.teamId
          }
        }
      });

      toast.current.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Pago actualizado correctamente',
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
        header="Editar Pago a Trabajador" 
        visible={visible} 
        style={{ width: '50vw' }} 
        footer={footer} 
        onHide={onHide}
      >
        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p>Error al cargar pago</p>
        ) : (
          <div className="p-fluid">
            <div className="p-grid">
              <div className="p-col-12 p-md-6">
                <div className="p-field">
                  <label htmlFor="amount">Monto*</label>
                  <InputNumber
                    id="amount"
                    value={formData.amount}
                    onValueChange={(e) => handleNumberChange('amount', e.value)}
                    mode="currency"
                    currency={formData.currency}
                    locale="en-US"
                    required
                  />
                </div>
              </div>
              <div className="p-col-12 p-md-6">
                <div className="p-field">
                  <label htmlFor="currency">Moneda*</label>
                  <InputText
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => handleChange(e)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="p-grid">
              <div className="p-col-12 p-md-6">
                <div className="p-field">
                  <label htmlFor="exchangeRate">Tasa de Cambio</label>
                  <InputNumber
                    id="exchangeRate"
                    value={formData.exchangeRate}
                    onValueChange={(e) => handleNumberChange('exchangeRate', e.value)}
                    min={0}
                    max={100}
                  />
                </div>
              </div>
              <div className="p-col-12 p-md-6">
                <div className="p-field">
                  <label htmlFor="paymentDate">Fecha de Pago*</label>
                  <Calendar
                    id="paymentDate"
                    value={formData.paymentDate}
                    onChange={(e) => handleDateChange(e.value)}
                    dateFormat="dd/mm/yy"
                    showIcon
                    required
                  />
                </div>
              </div>
            </div>

            <div className="p-grid">
              <div className="p-col-12 p-md-6">
                <div className="p-field">
                  <label htmlFor="paymentMethod">Método de Pago*</label>
                  <Dropdown
                    id="paymentMethod"
                    value={formData.paymentMethod}
                    options={paymentMethods}
                    onChange={(e) => handleNumberChange('paymentMethod', e.value)}
                    optionLabel="label"
                    placeholder="Seleccione"
                    required
                  />
                </div>
              </div>
              <div className="p-col-12 p-md-6">
                <div className="p-field">
                  <label htmlFor="paymentType">Tipo de Pago*</label>
                  <Dropdown
                    id="paymentType"
                    value={formData.paymentType}
                    options={paymentTypes}
                    onChange={(e) => handleNumberChange('paymentType', e.value)}
                    optionLabel="label"
                    placeholder="Seleccione"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="p-field">
              <label>Desglose</label>
              <div className="p-grid">
                <div className="p-col-12 p-md-3">
                  <label htmlFor="baseSalary">Salario Base</label>
                  <InputNumber
                    id="baseSalary"
                    value={formData.breakdown.baseSalary}
                    onValueChange={(e) => handleBreakdownChange('baseSalary', e.value)}
                    mode="currency"
                    currency={formData.currency}
                    locale="en-US"
                  />
                </div>
                <div className="p-col-12 p-md-3">
                  <label htmlFor="commissions">Comisiones</label>
                  <InputNumber
                    id="commissions"
                    value={formData.breakdown.commissions}
                    onValueChange={(e) => handleBreakdownChange('commissions', e.value)}
                    mode="currency"
                    currency={formData.currency}
                    locale="en-US"
                  />
                </div>
                <div className="p-col-12 p-md-3">
                  <label htmlFor="bonuses">Bonos</label>
                  <InputNumber
                    id="bonuses"
                    value={formData.breakdown.bonuses}
                    onValueChange={(e) => handleBreakdownChange('bonuses', e.value)}
                    mode="currency"
                    currency={formData.currency}
                    locale="en-US"
                  />
                </div>
                <div className="p-col-12 p-md-3">
                  <label htmlFor="deductions">Deducciones</label>
                  <InputNumber
                    id="deductions"
                    value={formData.breakdown.deductions}
                    onValueChange={(e) => handleBreakdownChange('deductions', e.value)}
                    mode="currency"
                    currency={formData.currency}
                    locale="en-US"
                  />
                </div>
              </div>
            </div>

            <div className="p-field">
              <label htmlFor="notes">Notas</label>
              <InputText
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
              />
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