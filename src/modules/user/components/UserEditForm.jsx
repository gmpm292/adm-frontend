import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputSwitch } from 'primereact/inputswitch';
import { useMutation, useQuery } from '@apollo/client';
import { GET_USER_BY_ID, UPDATE_USER } from '../graphql/queries';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';

export const UserEditForm = ({ userId, visible, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    mobile: '',
    enabled: true
  });
  const toast = useRef(null);
  const [updateUser] = useMutation(UPDATE_USER);

  const { loading, error } = useQuery(GET_USER_BY_ID, {
    variables: { id: userId },
    skip: !userId,
    onCompleted: (data) => {
      if (data?.user) {
        setFormData({
          name: data.user.name || '',
          lastName: data.user.lastName || '',
          email: data.user.email || '',
          mobile: data.user.mobile || '',
          enabled: data.user.enabled
        });
      }
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (e) => {
    setFormData(prev => ({ ...prev, enabled: e.value }));
  };

  const handleSubmit = async () => {
    try {
      await updateUser({
        variables: {
          user: {
            id: userId,
            ...formData
          }
        }
      });

      toast.current.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Usuario actualizado correctamente',
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
        header="Editar Usuario" 
        visible={visible} 
        style={{ width: '50vw' }} 
        footer={footer} 
        onHide={onHide}
      >
        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p>Error al cargar usuario</p>
        ) : (
          <div className="p-fluid">
            <div className="p-field">
              <label htmlFor="name">Nombres</label>
              <InputText 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
              />
            </div>

            <div className="p-field">
              <label htmlFor="lastName">Apellidos</label>
              <InputText 
                id="lastName" 
                name="lastName" 
                value={formData.lastName} 
                onChange={handleChange} 
              />
            </div>

            <div className="p-field">
              <label htmlFor="email">Email</label>
              <InputText 
                id="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                disabled
              />
            </div>

            <div className="p-field">
              <label htmlFor="mobile">Teléfono</label>
              <InputText 
                id="mobile" 
                name="mobile" 
                value={formData.mobile} 
                onChange={handleChange} 
              />
            </div>

            <div className="p-field">
              <label htmlFor="enabled">Estado</label>
              <div className="flex align-items-center">
                <InputSwitch
                  id="enabled"
                  checked={formData.enabled}
                  onChange={handleStatusChange}
                />
                <span className="ml-2">
                  {formData.enabled ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
};