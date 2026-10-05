import React from 'react';
import { PageHeader } from '../../../components/ui';
import { UserTable } from '../components/UserTable';

export function UserListPage() {
    return (
        <>
            <PageHeader
                title="Usuarios"
                subtitle="Crea cuentas, asigna roles y controla el acceso de cada persona."
            />
            <UserTable />
        </>
    );
}
