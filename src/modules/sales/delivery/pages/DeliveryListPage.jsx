import React from 'react';
import { DeliveryTable } from '../components/DeliveryTable';
import { PageHeader } from '../../../../components/ui';

export function DeliveryListPage() {
    return (
        <>
            <PageHeader
                title="Mensajerías"
                subtitle="Da seguimiento a las ventas con entrega y confirma las pendientes."
            />
            <DeliveryTable />
        </>
    );
}
