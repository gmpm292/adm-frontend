import React, { useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { useLazyQuery } from '@apollo/client';
import { GET_PAYROLL_PERIOD_BY_ID } from '../graphql/queries';
import { ProgressSpinner } from 'primereact/progressspinner';

export const PayrollPeriodDetailForm = ({ payrollPeriodId, visible, onHide }) => {
  const [getPayrollPeriod, { data, loading }] = useLazyQuery(GET_PAYROLL_PERIOD_BY_ID, {
    variables: { id: payrollPeriodId },
    fetchPolicy: 'network-only',
    skip: !payrollPeriodId,
  });

  useEffect(() => {
    if (visible && payrollPeriodId) {
      getPayrollPeriod();
    }
  }, [visible, payrollPeriodId, getPayrollPeriod]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  const payrollPeriod = data?.payrollPeriod;

  return (
    <Dialog
      header="Detalles del Período de Nómina"
      visible={visible}
      style={{ width: '600px' }}
      onHide={onHide}
      modal
    >
      {loading ? (
        <div className="flex justify-center">
          <ProgressSpinner />
        </div>
      ) : payrollPeriod ? (
        <div className="p-fluid">
          <div className="field"><b>Nombre:</b> {payrollPeriod.name}</div>
          <div className="field"><b>Fecha Inicio:</b> {formatDate(payrollPeriod.startDate)}</div>
          <div className="field"><b>Fecha Fin:</b> {formatDate(payrollPeriod.endDate)}</div>
          <div className="field"><b>Estado:</b> {payrollPeriod.isClosed ? 'Cerrado' : 'Abierto'}</div>
          <div className="field"><b>Descripción:</b> {payrollPeriod.description || 'N/A'}</div>
          <div className="field"><b>Business:</b> {payrollPeriod.business?.name || 'N/A'}</div>
          <div className="field"><b>Oficina:</b> {payrollPeriod.office?.name || 'N/A'}</div>
          <div className="field"><b>Departamento:</b> {payrollPeriod.department?.name || 'N/A'}</div>
          <div className="field"><b>Equipo:</b> {payrollPeriod.team?.name || 'N/A'}</div>
          <div className="field"><b>Creado en:</b> {formatDate(payrollPeriod.createdAt)}</div>
          <div className="field"><b>Última actualización:</b> {formatDate(payrollPeriod.updatedAt)}</div>
        </div>
      ) : (
        <p>No se encontró información del período de nómina.</p>
      )}
    </Dialog>
  );
};