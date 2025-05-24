import React, { useState, useEffect } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { useLazyQuery } from '@apollo/client';

import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { GET_USERS } from '../graphql/queries';

export const UserSelector = ({ onUserSelected, selectedUserId, disabled = false }) => {
  const [getUsers, { data, loading, error }] = useLazyQuery(GET_USERS);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getUsers({
      variables: {
        options: {
          skip: 0,
          take: 100,
          filters: [],
          sorts: [{ property: 'name', direction: 'ASC' }]
        }
      }
    });
  }, [getUsers]);

  useEffect(() => {
    if (data?.users?.data) {
      const formattedUsers = data.users.data
        .filter(user => user.enabled) // Solo usuarios activos
        .map(user => ({
          id: user.id,
          name: `${user.name} ${user.lastName || ''}`.trim(),
          email: user.email
        }));
      setUsers(formattedUsers);

      if (selectedUserId) {
        const foundUser = formattedUsers.find(u => u.id === selectedUserId);
        setSelectedUser(foundUser || null);
      }
    }
  }, [data, selectedUserId]);

  const handleUserChange = (e) => {
    setSelectedUser(e.value);
    if (onUserSelected) {
      onUserSelected(e.value);
    }
  };

  const userTemplate = (option) => {
    if (!option) return <div>Seleccionar usuario</div>;
    return (
      <div className="flex align-items-center">
        <div>
          <div>{option.name}</div>
          <div className="text-sm text-color-secondary">{option.email}</div>
        </div>
      </div>
    );
  };

  if (loading) return <ProgressSpinner style={{ width: '30px', height: '30px' }} />;
  if (error) return <Message severity="error" text="Error cargando usuarios" />;

  return (
    <Dropdown
      value={selectedUser}
      options={users}
      onChange={handleUserChange}
      optionLabel="name"
      placeholder="Seleccione un usuario"
      filter
      filterBy="name,email"
      showClear
      disabled={disabled}
      valueTemplate={userTemplate}
      itemTemplate={userTemplate}
      className="w-full"
      emptyMessage="No se encontraron usuarios"
    />
  );
};