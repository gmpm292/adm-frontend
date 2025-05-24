import React from 'react';
import { Card } from 'primereact/card';
import { CustomerTable } from '../components/CustomerTable';
import '../styles/CustomerList.css';

export function CustomerListPage() {
    return (
        <div className="customer-list-page">
            <Card title="Gestión de Clientes">
                <CustomerTable />
            </Card>
        </div>
    );
}