import React from 'react';
import { Card } from 'primereact/card';
import { UserTable } from '../components/UserTable';
import '../styles/UserList.css';

export function UserListPage() {
    return (
        <div className="user-list-page">
            <Card title="Gestión de Usuarios">
                <UserTable />
            </Card>
        </div>
    );
}