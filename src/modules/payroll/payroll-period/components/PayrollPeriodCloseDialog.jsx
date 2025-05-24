import React, { useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { useMutation } from '@apollo/client';
import { CLOSE_PAYROLL_PERIOD } from '../graphql/queries';
import { Toast } from 'primereact/toast';

export const PayrollPeriodCloseDialog = ({ periodId, visible, onHide, onSuccess }) => {
  const toast = useRef(null);
  const [closePayrollPeriod] = useMutation(CLOSE_PAYROLL_PERIOD);

  const handleClosePeriod = async () => {
    try {
      await closePayrollPeriod({ variables: { id: periodId } });

      toast.current.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Período de nómina cerrado correctamente',
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
      <Button label="Cerrar Período" icon="pi pi-lock" onClick={handleClosePeriod} className="p-button-warning" />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog 
        header="Cerrar Período de Nómina" 
        visible={visible} 
        style={{ width: '40vw' }} 
        footer={footer} 
        onHide={onHide}
        modal
      >
        <p>¿Estás seguro de que deseas cerrar este período de nómina? Esta acción no se puede deshacer.</p>
        <p className="p-mt-3"><strong>Nota:</strong> Al cerrar el período, no se podrán realizar más pagos asociados a él.</p>
      </Dialog>
    </>
  );
};