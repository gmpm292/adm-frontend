import React from 'react';
import { useParams } from 'react-router-dom';
import { Card } from 'primereact/card';
import { SaleDetailTable } from '../components/SaleDetailTable';
import '../styles/SaleDetailList.css';

export function SaleDetailListPage() {
    const { saleId } = useParams();
    
    return (
        <div className="sale-detail-list-page">
            <Card title={`Detalles de Venta #${saleId}`}>
                <SaleDetailTable saleId={parseInt(saleId)} />
            </Card>
        </div>
    );
}