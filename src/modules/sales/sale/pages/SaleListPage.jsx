import React from 'react';
import { SaleTable } from '../components/SaleTable';
import { PageHeader } from '../../../../components/ui';

export function SaleListPage() {
    return (
        <>
            <PageHeader
                title="Ventas"
                subtitle="Registra ventas, valida sus pagos y consulta su estado."
            />
            <SaleTable />
        </>
    );
}
