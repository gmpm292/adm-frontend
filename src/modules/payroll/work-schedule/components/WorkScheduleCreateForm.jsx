import React, { useState, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { InputSwitch } from 'primereact/inputswitch';
import { useMutation } from '@apollo/client';
import { CREATE_WORK_SCHEDULE } from '../graphql/queries';
import { Toast } from 'primereact/toast';
import { WorkDaysSelector } from './WorkDaysSelector';
import SecurityEntitySelector from '../../../../components/SecurityEntitySelector/SecurityEntitySelector';

export const WorkScheduleCreateForm = ({ visible, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    startDate: null,
    endDate: null,
    isRecurring: false,
    notes: '',
    workingDays: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    },
    businessId: null,
    officeId: null,
    departmentId: null,
    teamId: null
  });
  const toast = useRef(null);
  const [createWorkSchedule] = useMutation(CREATE_WORK_SCHEDULE);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStatusChange = (e) => {
    setFormData(prev => ({ ...prev, isRecurring: e.value }));
  };

  const handleWorkingDaysChange = (workingDays) => {
    setFormData(prev => ({ ...prev, workingDays }));
  };

  const handleSecurityEntitiesChange = (entities) => {
    setFormData(prev => ({ ...prev, ...entities }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.startDate || !formData.endDate || !formData.officeId) {
        throw new Error('Fechas y oficina son campos requeridos');
      }

      if (formData.startDate > formData.endDate) {
        throw new Error('La fecha de inicio no puede ser mayor que la fecha de fin');
      }

      const atLeastOneDaySelected = Object.values(formData.workingDays).some(day => day);
      if (!atLeastOneDaySelected) {
        throw new Error('Debe seleccionar al menos un día laboral');
      }

      await createWorkSchedule({
        variables: {
          createWorkScheduleInput: {
            ...formData,
            startDate: formData.startDate.toISOString(),
            endDate: formData.endDate.toISOString(),
            workingDays: formData.workingDays
          }
        }
      });

      toast.current.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Horario laboral creado correctamente',
        life: 3000
      });

      onSuccess();
      onHide();
      setFormData({
        startDate: null,
        endDate: null,
        isRecurring: false,
        notes: '',
        workingDays: {
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: false,
          sunday: false
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
        header="Crear Nuevo Horario Laboral" 
        visible={visible} 
        style={{ width: '60vw' }} 
        footer={footer} 
        onHide={onHide}
      >
        <div className="p-fluid">
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

          <div className="p-field">
            <label htmlFor="isRecurring">Recurrente</label>
            <div className="flex align-items-center">
              <InputSwitch
                id="isRecurring"
                checked={formData.isRecurring}
                onChange={handleStatusChange}
              />
              <span className="ml-2">
                {formData.isRecurring ? 'Sí' : 'No'}
              </span>
            </div>
          </div>

          <div className="p-field">
            <label>Días Laborales*</label>
            <WorkDaysSelector 
              workingDays={formData.workingDays}
              onChange={handleWorkingDaysChange}
            />
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
            requireOffice={true}
          />
        </div>
      </Dialog>
    </>
  );
};