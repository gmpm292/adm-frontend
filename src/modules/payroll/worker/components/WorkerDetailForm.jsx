import React, { useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { useLazyQuery } from '@apollo/client';
import { GET_WORKER_BY_ID } from '../graphql/queries';
import { ProgressSpinner } from 'primereact/progressspinner';
import { FormField } from '../../../../components/ui';

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
      className="w-full md:w-30rem"
      onHide={onHide}
      modal
    >
      {loading ? (
        <div className="flex justify-content-center">
          <ProgressSpinner />
        </div>
      ) : worker ? (
        <div className="grid">
          <div className="col-12 md:col-6">
            <FormField label="Usuario">
              <span>{worker.user?.name} {worker.user?.lastName}</span>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Email">
              <span>{worker.user?.email}</span>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Tipo">
              <span>{worker.workerType}</span>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Salario Base">
              <span>{worker.baseSalary}</span>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Business">
              <span>{worker.business?.name || 'N/A'}</span>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Oficina">
              <span>{worker.office?.name || 'N/A'}</span>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Departamento">
              <span>{worker.department?.name || 'N/A'}</span>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Equipo">
              <span>{worker.team?.name || 'N/A'}</span>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Regla de Pago">
              <span>{worker.paymentRule?.name || 'N/A'}</span>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Creado en">
              <span>{new Date(worker.createdAt).toLocaleString()}</span>
            </FormField>
          </div>
          <div className="col-12 md:col-6">
            <FormField label="Última actualización">
              <span>{new Date(worker.updatedAt).toLocaleString()}</span>
            </FormField>
          </div>
        </div>
      ) : (
        <p className="text-color-secondary">No se encontró información del trabajador.</p>
      )}
    </Dialog>
  );
};