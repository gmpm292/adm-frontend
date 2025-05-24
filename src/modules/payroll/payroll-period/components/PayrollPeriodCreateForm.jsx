import React, { useState, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { useMutation } from '@apollo/client';
import { CREATE_PAYROLL_PERIOD } from '../graphql/queries';
import { Toast } from 'primereact/toast';
import SecurityEntitySelector from '../../../../components/SecurityEntitySelector/SecurityEntitySelector';

export const PayrollPeriodCreateForm = ({ visible, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: null,
    endDate: null,
    isClosed: false,
    businessId: null,
    officeId: null,
    departmentId: null,
    teamId: null
  });
  const toast = useRef(null);
  const [createPayrollPeriod] = useMutation(CREATE_PAYROLL_PERIOD);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSecurityEntitiesChange = (entities) => {
    setFormData(prev => ({ ...prev, ...entities }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.startDate || !formData.endDate) {
        throw new Error('Nombre, fecha de inicio y fecha de fin son campos requeridos');
      }

      if (formData.startDate > formData.endDate) {
        throw new Error('La fecha de inicio no puede ser mayor que la fecha de fin');
      }

      await createPayrollPeriod({
        variables: {
          createPayrollPeriodInput: {
            ...formData,
            startDate: formData.startDate.toISOString(),
            endDate: formData.endDate.toISOString()
          }
        }
      });

      toast.current.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Período de nómina creado correctamente',
        life: 3000
      });

      onSuccess();
      onHide();
      setFormData({
        name: '',
        description: '',
        startDate: null,
        endDate: null,
        isClosed: false,
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
        header="Crear Nuevo Período de Nómina" 
        visible={visible} 
        style={{ width: '50vw' }} 
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
            <div className="p-col-12 p-md-6">
              <div className="p-field">
                <label htmlFor="startDate">Fecha de Inicio*</label>
                <Calendar
                  id="startDate"
                  value={formData.startDate}
                  onChange={(e) => handleDateChange('startDate', e.value)}
                  dateFormat="dd/mm/yy"
                  showIcon
                  required
                />
              </div>
            </div>
            <div className="p-col-12 p-md-6">
              <div className="p-field">
                <label htmlFor="endDate">Fecha de Fin*</label>
                <Calendar
                  id="endDate"
                  value={formData.endDate}
                  onChange={(e) => handleDateChange('endDate', e.value)}
                  dateFormat="dd/mm/yy"
                  showIcon
                  required
                />
              </div>
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