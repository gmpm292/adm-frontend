import React from 'react';
import { Card } from 'primereact/card';
import { DeliveryTable } from '../components/DeliveryTable';
import '../styles/DeliveryList.css';

export function DeliveryListPage() {
    return (
        <div className="delivery-list-page">
            <Card title="Gestión de Mensajerías">
                <DeliveryTable />
            </Card>
        </div>
    );
}