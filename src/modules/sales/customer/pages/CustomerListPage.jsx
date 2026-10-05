import React from 'react';
import { CustomerTable } from '../components/CustomerTable';
import { PageHeader } from '../../../../components/ui';

export function CustomerListPage() {
    return (
        <>
            <PageHeader
                title="Clientes"
                subtitle="Consulta, crea y actualiza los clientes de la empresa."
            />
            <CustomerTable />
        </>
    );
}
