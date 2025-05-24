import React from 'react';
import { Card } from 'primereact/card';
import { CurrencyTable } from '../components/CurrencyTable';
import '../styles/CurrencyList.css';

export function CurrencyListPage() {
  return (
    <div className="currency-list-page">
      <Card title="Gestión de Monedas">
        <CurrencyTable />
      </Card>
    </div>
  );
}