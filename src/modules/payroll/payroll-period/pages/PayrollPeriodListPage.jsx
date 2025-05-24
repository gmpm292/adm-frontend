import React from 'react';
import { Card } from 'primereact/card';
import { PayrollPeriodTable } from '../components/PayrollPeriodTable';
import '../styles/PayrollPeriodList.css';

export function PayrollPeriodListPage() {
    return (
        <div className="payroll-period-list-page">
            <Card title="Gestión de Períodos de Nómina">
                <PayrollPeriodTable />
            </Card>
        </div>
    );
}