import React from 'react';
import { Card } from 'primereact/card';
import { InventoryTable } from '../components/InventoryTable';
import '../styles/InventoryList.css';

export function InventoryListPage() {
    return (
        <div className="inventory-list-page">
            <Card title="Gestión de Inventarios">
                <InventoryTable />
            </Card>
        </div>
    );
}