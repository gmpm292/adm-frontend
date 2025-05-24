import React, { useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { useLazyQuery } from '@apollo/client';
import { GET_WORKER_BY_ID } from '../graphql/queries';
import { ProgressSpinner } from 'primereact/progressspinner';

export const WorkerDetailForm = ({ workerId, visible, onHide }) => {
  const [getWorker, { data, loading }] = useLazyQuery(GET_WORKER_BY_ID, {
    variables: { id: workerId },
    fetchPolicy: 'network-only',
    skip: !workerId,
  });

  useEffect(() => {
    if (visible && workerId) {
      getWorker();
    }
  }, [visible, workerId, getWorker]);

  const worker = data?.worker;

  return (
    <Dialog
      header="Detalles del Trabajador"
      visible={visible}
      style={{ width: '600px' }}
      onHide={onHide}
      modal
    >
      {loading ? (
        <div className="flex justify-center">
          <ProgressSpinner />
        </div>
      ) : worker ? (
        <div className="p-fluid">
          <div className="field"><b>Usuario:</b> {worker.user?.name} {worker.user?.lastName}</div>
          <div className="field"><b>Email:</b> {worker.user?.email}</div>
          <div className="field"><b>Tipo:</b> {worker.workerType}</div>
          <div className="field"><b>Salario Base:</b> {worker.baseSalary}</div>
          <div className="field"><b>Business:</b> {worker.business?.name || 'N/A'}</div>
          <div className="field"><b>Oficina:</b> {worker.office?.name || 'N/A'}</div>
          <div className="field"><b>Departamento:</b> {worker.department?.name || 'N/A'}</div>
          <div className="field"><b>Equipo:</b> {worker.team?.name || 'N/A'}</div>
          <div className="field"><b>Regla de Pago:</b> {worker.paymentRule?.name || 'N/A'}</div>
          <div className="field"><b>Creado en:</b> {new Date(worker.createdAt).toLocaleString()}</div>
          <div className="field"><b>Última actualización:</b> {new Date(worker.updatedAt).toLocaleString()}</div>
        </div>
      ) : (
        <p>No se encontró información del trabajador.</p>
      )}
    </Dialog>
  );
};