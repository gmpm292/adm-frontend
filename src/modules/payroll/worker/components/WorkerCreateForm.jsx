import React, { useState, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { useMutation } from '@apollo/client';
import { CREATE_WORKER } from '../graphql/queries';
import { Toast } from 'primereact/toast';
import SecurityEntitySelector from '../../../../components/SecurityEntitySelector/SecurityEntitySelector';
import { UserSelector } from '../../../user/components/UserSelector';

export const WorkerCreateForm = ({ visible, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    userId: null,
    workerType: null,
    baseSalary: 0,
    businessId: null,
    officeId: null,
    departmentId: null,
    teamId: null,
    paymentRuleId: null
  });
  const toast = useRef(null);
  const [createWorker, { loading }] = useMutation(CREATE_WORKER);

  const workerTypes = [
    { label: 'Agente', value: 'AGENT' },
    { label: 'Publicista', value: 'PUBLICIST' },
    { label: 'Económico', value: 'ECONOMIC' },
    { label: 'Otro', value: 'OTHER' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e) => {
    setFormData(prev => ({ ...prev, baseSalary: e.value }));
  };

  const handleSecurityEntitiesChange = (entities) => {
    setFormData(prev => ({ ...prev, ...entities }));
  };

  const handleUserChange = (user) => {
    setFormData(prev => ({ ...prev, userId: user?.id || null }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.userId || !formData.workerType) {
        throw new Error('Usuario y tipo de trabajador son campos requeridos');
      }

      await createWorker({
        variables: {
          createWorkerInput: {
            ...formData,
            baseSalary: Number(formData.baseSalary)
          }
        }
      });

      toast.current.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Trabajador creado correctamente',
        life: 3000
      });

      onSuccess();
      onHide();
      setFormData({
        userId: null,
        workerType: null,
        baseSalary: 0,
        businessId: null,
        officeId: null,
        departmentId: null,
        teamId: null,
        paymentRuleId: null
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
    <div>
      <Button 
        label="Cancelar" 
        icon="pi pi-times" 
        onClick={onHide} 
        className="p-button-text" 
        disabled={loading}
      />
      <Button 
        label={loading ? 'Creando...' : 'Crear'} 
        icon="pi pi-check" 
        onClick={handleSubmit} 
        autoFocus 
        loading={loading}
      />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog 
        header="Crear Nuevo Trabajador" 
        visible={visible} 
        style={{ width: '50vw' }} 
        footer={footer} 
        onHide={onHide}
        closable={!loading}
        onShow={() => {
          setFormData({
            userId: null,
            workerType: null,
            baseSalary: 0,
            businessId: null,
            officeId: null,
            departmentId: null,
            teamId: null,
            paymentRuleId: null
          });
        }}
      >
        <div className="p-fluid">
          <div className="p-field mb-4">
            <label htmlFor="user">Usuario*</label>
            <UserSelector
              onUserSelected={handleUserChange}
              selectedUserId={formData.userId}
            />
          </div>

          <div className="p-field mb-4">
            <label htmlFor="workerType">Tipo de Trabajador*</label>
            <Dropdown
              id="workerType"
              value={formData.workerType}
              options={workerTypes}
              onChange={handleChange}
              optionLabel="label"
              name="workerType"
              placeholder="Seleccione un tipo"
              className="w-full"
              disabled={loading}
              required
            />
          </div>

          <div className="p-field mb-4">
            <label htmlFor="baseSalary">Salario Base</label>
            <InputNumber
              id="baseSalary"
              value={formData.baseSalary}
              onValueChange={handleNumberChange}
              mode="currency"
              currency="USD"
              locale="en-US"
              min={0}
              className="w-full"
              disabled={loading}
            />
          </div>

          <div className="p-field">
            <SecurityEntitySelector
              onSelectionChange={handleSecurityEntitiesChange}
              disabled={loading}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};