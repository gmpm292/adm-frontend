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
import { Message } from 'primereact/message';
import { FormField } from '../../../../components/ui';
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
    <>
      <Button label="Cancelar" icon="pi pi-times" onClick={onHide} severity="secondary" />
      <Button label="Guardar" icon="pi pi-check" onClick={handleSubmit} autoFocus />
    </>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header="Editar Horario de Trabajo"
        visible={visible}
        className="w-full md:w-8 lg:w-6"
        footer={footer}
        onHide={onHide}
      >
        {loading ? (
          <p className="text-color-secondary">Cargando...</p>
        ) : error ? (
          <Message severity="error" text="Error al cargar horario de trabajo" className="w-full" />
        ) : (
          <div className="formgrid grid">
            <div className="col-12 md:col-6">
              <FormField label="Fecha de Inicio" htmlFor="startDate" required>
                <Calendar
                  id="startDate"
                  value={formData.startDate}
                  onChange={(e) => handleDateChange('startDate', e.value)}
                  showTime
                  hourFormat="24"
                  dateFormat="dd/mm/yy"
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
                  showTime
                  hourFormat="24"
                  dateFormat="dd/mm/yy"
                  required
                />
              </FormField>
            </div>

            <div className="col-12">
              <FormField label="Días de Trabajo" required>
                <div className="grid">
                  {Object.keys(formData.workingDays).map(day => (
                    <div key={day} className="col-6 md:col-3">
                      <div className="flex align-items-center gap-2">
                        <Checkbox
                          inputId={day}
                          checked={formData.workingDays[day]}
                          onChange={(e) => handleDayChange(day, e.checked)}
                        />
                        <label htmlFor={day} className="capitalize">
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
              </FormField>
            </div>

            <div className="col-12">
              <FormField label="Recurrente" htmlFor="isRecurring">
                <div className="flex align-items-center gap-2">
                  <InputSwitch
                    id="isRecurring"
                    checked={formData.isRecurring}
                    onChange={handleRecurringChange}
                  />
                  <span>
                    {formData.isRecurring ? 'Sí' : 'No'}
                  </span>
                </div>
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
                initialValues={{
                  businessId: formData.businessId,
                  officeId: formData.officeId,
                  departmentId: formData.departmentId,
                  teamId: formData.teamId
                }}
                showOfficeOnly
              />
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
};
