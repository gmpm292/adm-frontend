import React from 'react';
import { Dialog } from 'primereact/dialog';
import { useLazyQuery } from '@apollo/client';
import { GET_WORKER_PAYMENT_BY_ID } from '../graphql/queries';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tag } from 'primereact/tag';

const paymentMethodLabels = {
  CASH: 'Efectivo',
  BANK_TRANSFER: 'Transferencia Bancaria',
  CHECK: 'Cheque',
  MOBILE_PAYMENT: 'Pago Móvil',
  OTHER: 'Otro'
};

const paymentTypeLabels = {
  SALARY: 'Salario',
  COMMISSION: 'Comisión',
  BONUS: 'Bono',
  OTHER: 'Otro'
};

export const WorkerPaymentDetailForm = ({ paymentId, visible, onHide }) => {
  const [getWorkerPayment, { data, loading, error }] = useLazyQuery(GET_WORKER_PAYMENT_BY_ID, {
    variables: { id: paymentId },
    fetchPolicy: 'network-only'
  });

  React.useEffect(() => {
    if (visible && paymentId) {
      getWorkerPayment();
    }
  }, [visible, paymentId, getWorkerPayment]);

  const payment = data?.workerPayment;

  const renderBreakdown = (breakdown) => {
    if (!breakdown) return null;

    return (
      <div className="p-fluid p-grid">
        <div className="p-col-6">
          <label className="font-bold">Salario Base</label>
          <p>{breakdown.baseSalary ? `$${breakdown.baseSalary.toFixed(2)}` : 'N/A'}</p>
        </div>
        <div className="p-col-6">
          <label className="font-bold">Comisiones</label>
          <p>{breakdown.commissions ? `$${breakdown.commissions.toFixed(2)}` : 'N/A'}</p>
        </div>
        <div className="p-col-6">
          <label className="font-bold">Bonos</label>
          <p>{breakdown.bonuses ? `$${breakdown.bonuses.toFixed(2)}` : 'N/A'}</p>
        </div>
        <div className="p-col-6">
          <label className="font-bold">Deducciones</label>
          <p>{breakdown.deductions ? `$${breakdown.deductions.toFixed(2)}` : 'N/A'}</p>
        </div>
      </div>
    );
  };

  return (
    <Dialog
      header="Detalles del Pago al Trabajador"
      visible={visible}
      style={{ width: '700px' }}
      onHide={onHide}
      modal
    >
      {loading ? (
        <div className="flex justify-center">
          <ProgressSpinner />
        </div>
      ) : error ? (
        <div className="p-message p-message-error">
          Error al cargar los detalles del pago
        </div>
      ) : payment ? (
        <div className="p-fluid">
          <div className="p-grid">
            <div className="p-col-6">
              <label className="font-bold">Monto</label>
              <p>${payment.amount.toFixed(2)} {payment.currency}</p>
            </div>
            <div className="p-col-6">
              <label className="font-bold">Tasa de Cambio</label>
              <p>{payment.exchangeRate ? payment.exchangeRate.toFixed(4) : '1.0000'}</p>
            </div>
          </div>

          <div className="p-grid">
            <div className="p-col-6">
              <label className="font-bold">Método de Pago</label>
              <p>{paymentMethodLabels[payment.paymentMethod]}</p>
            </div>
            <div className="p-col-6">
              <label className="font-bold">Tipo de Pago</label>
              <Tag
                value={paymentTypeLabels[payment.paymentType]}
                severity={
                  payment.paymentType === 'SALARY' ? 'info' : 
                  payment.paymentType === 'COMMISSION' ? 'success' : 'warning'
                }
              />
            </div>
          </div>

          <div className="field">
            <label className="font-bold">Periodo de Nómina</label>
            <p>
              {payment.payrollPeriod?.name} (
              {new Date(payment.payrollPeriod?.startDate).toLocaleDateString()} - 
              {new Date(payment.payrollPeriod?.endDate).toLocaleDateString()})
            </p>
          </div>

          <div className="field">
            <label className="font-bold">Trabajador</label>
            <p>
              {payment.worker?.user?.name} {payment.worker?.user?.lastName} - 
              {payment.worker?.workerType}
            </p>
          </div>

          <div className="field">
            <label className="font-bold">Desglose</label>
            {renderBreakdown(payment.breakdown)}
          </div>

          <div className="field">
            <label className="font-bold">Notas</label>
            <p>{payment.notes || 'Ninguna'}</p>
          </div>

          <div className="p-grid">
            <div className="p-col-6">
              <label className="font-bold">Fecha de Creación</label>
              <p>{new Date(payment.createdAt).toLocaleString()}</p>
            </div>
            <div className="p-col-6">
              <label className="font-bold">Última Actualización</label>
              <p>{new Date(payment.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      ) : (
        <p>No se encontró información del pago.</p>
      )}
    </Dialog>
  );
};