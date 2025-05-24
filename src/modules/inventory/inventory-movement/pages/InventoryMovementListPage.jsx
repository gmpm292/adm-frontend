import React from 'react';
import { Card } from 'primereact/card';
import { InventoryMovementTable } from '../components/InventoryMovementTable';
import '../styles/InventoryMovementList.css';

export function InventoryMovementListPage() {
    return (
        <div className="inventory-movement-list-page">
            <Card title="Gestión de Movimientos de Inventario">
                <InventoryMovementTable />
            </Card>
        </div>
    );
}