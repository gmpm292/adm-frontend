import React from 'react';
import { Card } from 'primereact/card';
import { SaleTable } from '../components/SaleTable';
import '../styles/SaleList.css';

export function SaleListPage() {
    return (
        <div className="sale-list-page">
            <Card title="Gestión de Ventas">
                <SaleTable />
            </Card>
        </div>
    );
}