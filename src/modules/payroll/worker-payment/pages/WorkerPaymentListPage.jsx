import React from 'react';
import { Card } from 'primereact/card';
import { WorkerPaymentTable } from '../components/WorkerPaymentTable';
import '../styles/WorkerPaymentList.css';

export function WorkerPaymentListPage() {
    return (
        <div className="worker-payment-list-page">
            <Card title="Gestión de Pagos a Trabajadores">
                <WorkerPaymentTable />
            </Card>
        </div>
    );
}