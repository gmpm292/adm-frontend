import React from 'react';
import { Dialog } from 'primereact/dialog';
import { useLazyQuery } from '@apollo/client';
import { GET_WORK_SCHEDULE_BY_ID } from '../graphql/queries';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tag } from 'primereact/tag';

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
      <div className="flex flex-wrap gap-2 mt-2">
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
      style={{ width: '600px' }}
      onHide={onHide}
      modal
    >
      {loading ? (
        <div className="flex justify-center">
          <ProgressSpinner />
        </div>
      ) : error ? (
        <div className="p-message p-message-error">
          Error al cargar los detalles del horario
        </div>
      ) : workSchedule ? (
        <div className="p-fluid">
          <div className="field">
            <label className="font-bold">Nombre</label>
            <p>{workSchedule.name || 'N/A'}</p>
          </div>

          <div className="field">
            <label className="font-bold">Fecha de Inicio</label>
            <p>{new Date(workSchedule.startDate).toLocaleDateString()}</p>
          </div>

          <div className="field">
            <label className="font-bold">Fecha de Fin</label>
            <p>{new Date(workSchedule.endDate).toLocaleDateString()}</p>
          </div>

          <div className="field">
            <label className="font-bold">Días de Trabajo</label>
            {renderWorkingDays(workSchedule.workingDays)}
          </div>

          <div className="field">
            <label className="font-bold">Recurrente</label>
            <Tag
              value={workSchedule.isRecurring ? 'Sí' : 'No'}
              severity={workSchedule.isRecurring ? 'success' : 'danger'}
              icon={workSchedule.isRecurring ? 'pi pi-check' : 'pi pi-times'}
            />
          </div>

          <div className="field">
            <label className="font-bold">Ámbito</label>
            <p>{scopeLabels[workSchedule.scope] || 'N/A'}</p>
          </div>

          <div className="field">
            <label className="font-bold">Business</label>
            <p>{workSchedule.business?.name || 'N/A'}</p>
          </div>

          <div className="field">
            <label className="font-bold">Oficina</label>
            <p>{workSchedule.office?.name || 'N/A'}</p>
          </div>

          <div className="field">
            <label className="font-bold">Notas</label>
            <p>{workSchedule.notes || 'Ninguna'}</p>
          </div>
        </div>
      ) : (
        <p>No se encontró información del horario de trabajo.</p>
      )}
    </Dialog>
  );
};