import React from 'react';
import { Dialog } from 'primereact/dialog';
import { useLazyQuery } from '@apollo/client';
import { GET_WORK_SCHEDULE_BY_ID } from '../graphql/queries';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tag } from 'primereact/tag';
import { Message } from 'primereact/message';
import { FormField } from '../../../../components/ui';

const dayLabels = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo'
};

const scopeLabels = {
  BUSINESS: 'Business',
  OFFICE: 'Oficina',
  DEPARTMENT: 'Departamento',
  TEAM: 'Equipo'
};

export const WorkScheduleDetailForm = ({ workScheduleId, visible, onHide }) => {
  const [getWorkSchedule, { data, loading, error }] = useLazyQuery(GET_WORK_SCHEDULE_BY_ID, {
    variables: { id: workScheduleId },
    fetchPolicy: 'network-only'
  });

  React.useEffect(() => {
    if (visible && workScheduleId) {
      getWorkSchedule();
    }
  }, [visible, workScheduleId, getWorkSchedule]);

  const workSchedule = data?.workSchedule;

  const renderWorkingDays = (workingDays) => {
    if (!workingDays) return null;

    return (
      <div className="flex flex-wrap gap-2">
        {Object.entries(workingDays).map(([day, isWorking]) => (
          <Tag 
            key={day}
            value={dayLabels[day]}
            severity={isWorking ? 'success' : 'danger'}
            icon={isWorking ? 'pi pi-check' : 'pi pi-times'}
          />
        ))}
      </div>
    );
  };

  return (
    <Dialog
      header="Detalles del Horario de Trabajo"
      visible={visible}
      className="w-full md:w-30rem"
      onHide={onHide}
      modal
    >
      {loading ? (
        <div className="flex justify-content-center">
          <ProgressSpinner />
        </div>
      ) : error ? (
        <Message
          severity="error"
          text="Error al cargar los detalles del horario"
          className="w-full"
        />
      ) : workSchedule ? (
        <div className="grid">
          <div className="col-12">
            <FormField label="Nombre">
              <span>{workSchedule.name || 'N/A'}</span>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Fecha de Inicio">
              <span>{new Date(workSchedule.startDate).toLocaleDateString()}</span>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Fecha de Fin">
              <span>{new Date(workSchedule.endDate).toLocaleDateString()}</span>
            </FormField>
          </div>
          <div className="col-12">
            <FormField label="Días de Trabajo">
              {renderWorkingDays(workSchedule.workingDays)}
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Recurrente">
              <div>
                <Tag
                  value={workSchedule.isRecurring ? 'Sí' : 'No'}
                  severity={workSchedule.isRecurring ? 'success' : 'danger'}
                  icon={workSchedule.isRecurring ? 'pi pi-check' : 'pi pi-times'}
                />
              </div>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Ámbito">
              <span>{scopeLabels[workSchedule.scope] || 'N/A'}</span>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Business">
              <span>{workSchedule.business?.name || 'N/A'}</span>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Oficina">
              <span>{workSchedule.office?.name || 'N/A'}</span>
            </FormField>
          </div>
          <div className="col-12">
            <FormField label="Notas">
              <span>{workSchedule.notes || 'Ninguna'}</span>
            </FormField>
          </div>
        </div>
      ) : (
        <p className="text-color-secondary">No se encontró información del horario de trabajo.</p>
      )}
    </Dialog>
  );
};
