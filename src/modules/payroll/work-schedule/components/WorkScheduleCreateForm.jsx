import React, { useState, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { InputSwitch } from 'primereact/inputswitch';
import { useMutation } from '@apollo/client';
import { CREATE_WORK_SCHEDULE } from '../graphql/queries';
import { Toast } from 'primereact/toast';
import { FormField } from '../../../../components/ui';
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
    <>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} severity="secondary" />
      <Button label="Crear" icon="pi pi-check" onClick={handleSubmit} autoFocus />
    </>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header="Crear Nuevo Horario Laboral"
        visible={visible}
        className="w-full md:w-8 lg:w-6"
        footer={footer}
        onHide={onHide}
      >
        <div className="formgrid grid">
          <div className="col-12 md:col-6">
            <FormField label="Fecha de Inicio" htmlFor="startDate" required>
              <Calendar
                id="startDate"
                value={formData.startDate}
                onChange={(e) => handleDateChange('startDate', e.value)}
                dateFormat="dd/mm/yy"
                showIcon
                required
              />
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Fecha de Fin" htmlFor="endDate" required>
              <Calendar
                id="endDate"
                value={formData.endDate}
                onChange={(e) => handleDateChange('endDate', e.value)}
                dateFormat="dd/mm/yy"
                showIcon
                required
              />
            </FormField>
          </div>

          <div className="col-12">
            <FormField label="Recurrente" htmlFor="isRecurring">
              <div className="flex align-items-center gap-2">
                <InputSwitch
                  id="isRecurring"
                  checked={formData.isRecurring}
                  onChange={handleStatusChange}
                />
                <span>
                  {formData.isRecurring ? 'Sí' : 'No'}
                </span>
              </div>
            </FormField>
          </div>

          <div className="col-12">
            <FormField label="Días Laborales" required>
              <WorkDaysSelector
                workingDays={formData.workingDays}
                onChange={handleWorkingDaysChange}
              />
            </FormField>
          </div>

          <div className="col-12">
            <FormField label="Notas" htmlFor="notes">
              <InputText
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
              />
            </FormField>
          </div>

          <div className="col-12">
            <SecurityEntitySelector
              onSelectionChange={handleSecurityEntitiesChange}
              requireOffice={true}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};
