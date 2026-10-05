import React from 'react';
import { PageHeader } from '../../../../components/ui';
import { PayrollPeriodTable } from '../components/PayrollPeriodTable';

export function PayrollPeriodListPage() {
    return (
        <>
            <PageHeader
                title="Períodos de nómina"
                subtitle="Crea, calcula y cierra los períodos en los que se liquidan los pagos."
            />
            <PayrollPeriodTable />
        </>
    );
}
