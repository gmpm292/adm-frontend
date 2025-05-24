import React, { useState, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { InputSwitch } from 'primereact/inputswitch';
import { Checkbox } from 'primereact/checkbox';
import { useMutation, useQuery } from '@apollo/client';
import { GET_WORK_SCHEDULE_BY_ID, UPDATE_WORK_SCHEDULE } from '../graphql/queries';
import { Toast } from 'primereact/toast';
import SecurityEntitySelector from '../../../../components/SecurityEntitySelector/SecurityEntitySelector';

export const WorkScheduleEditForm = ({ workScheduleId, visible, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    startDate: null,
    endDate: null,
    workingDays: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false
    },
    isRecurring: false,
    notes: '',
    officeId: null,
    businessId: null,
    departmentId: null,
    teamId: null
  });
  const toast = useRef(null);
  const [updateWorkSchedule] = useMutation(UPDATE_WORK_SCHEDULE);

  const { loading, error } = useQuery(GET_WORK_SCHEDULE_BY_ID, {
    variables: { id: workScheduleId },
    skip: !workScheduleId,
    onCompleted: (data) => {
      if (data?.workSchedule) {
        const schedule = data.workSchedule;
        setFormData({
          id: schedule.id,
          startDate: new Date(schedule.startDate),
          endDate: new Date(schedule.endDate),
          workingDays: schedule.workingDays,
          isRecurring: schedule.isRecurring,
          notes: schedule.notes || '',
          officeId: schedule.office?.id || null,
          businessId: schedule.business?.id || null,
          departmentId: schedule.department?.id || null,
          teamId: schedule.team?.id || null
        });
      }
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRecurringChange = (e) => {
    setFormData(prev => ({ ...prev, isRecurring: e.value }));
  };

  const handleDayChange = (day, checked) => {
    setFormData(prev => ({
      ...prev,
      workingDays: {
        ...prev.workingDays,
        [day]: checked
      }
    }));
  };

  const handleSecurityEntitiesChange = (entities) => {
    setFormData(prev => ({ ...prev, ...entities }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.startDate || !formData.endDate) {
        throw new Error('Las fechas de inicio y fin son requeridas');
      }

      if (Object.values(formData.workingDays).every(day => !day)) {
        throw new Error('Debe seleccionar al menos un día de trabajo');
      }

      await updateWorkSchedule({
        variables: {
          updateWorkScheduleInput: {
            id: formData.id,
            startDate: formData.startDate,
            endDate: formData.endDate,
            workingDays: formData.workingDays,
            isRecurring: formData.isRecurring,
            notes: formData.notes,
            officeId: formData.officeId
          }
        }
      });

      toast.current.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Horario de trabajo actualizado correctamente',
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
        header="Editar Horario de Trabajo" 
        visible={visible} 
        style={{ width: '50vw' }} 
        footer={footer} 
        onHide={onHide}
      >
        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p>Error al cargar horario de trabajo</p>
        ) : (
          <div className="p-fluid">
            <div className="p-grid">
              <div className="p-col-12 p-md-6">
                <div className="p-field">
                  <label htmlFor="startDate">Fecha de Inicio*</label>
                  <Calendar
                    id="startDate"
                    value={formData.startDate}
                    onChange={(e) => handleDateChange('startDate', e.value)}
                    showTime
                    hourFormat="24"
                    dateFormat="dd/mm/yy"
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
                    showTime
                    hourFormat="24"
                    dateFormat="dd/mm/yy"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="p-field">
              <label>Días de Trabajo*</label>
              <div className="p-grid">
                {Object.keys(formData.workingDays).map(day => (
                  <div key={day} className="p-col-12 p-md-3">
                    <div className="flex align-items-center">
                      <Checkbox
                        inputId={day}
                        checked={formData.workingDays[day]}
                        onChange={(e) => handleDayChange(day, e.checked)}
                      />
                      <label htmlFor={day} className="ml-2 capitalize">
                        {day === 'monday' ? 'Lunes' :
                         day === 'tuesday' ? 'Martes' :
                         day === 'wednesday' ? 'Miércoles' :
                         day === 'thursday' ? 'Jueves' :
                         day === 'friday' ? 'Viernes' :
                         day === 'saturday' ? 'Sábado' : 'Domingo'}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-field">
              <label htmlFor="isRecurring">Recurrente</label>
              <div className="flex align-items-center">
                <InputSwitch
                  id="isRecurring"
                  checked={formData.isRecurring}
                  onChange={handleRecurringChange}
                />
                <span className="ml-2">
                  {formData.isRecurring ? 'Sí' : 'No'}
                </span>
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
              showOfficeOnly
            />
          </div>
        )}
      </Dialog>
    </>
  );
};