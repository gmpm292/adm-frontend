import React from 'react';
import { PageHeader } from '../../../../components/ui';
import { WorkerPaymentTable } from '../components/WorkerPaymentTable';

export function WorkerPaymentListPage() {
    return (
        <>
            <PageHeader
                title="Pagos a trabajadores"
                subtitle="Consulta y registra los pagos de salarios, comisiones y bonos."
            />
            <WorkerPaymentTable />
        </>
    );
}
