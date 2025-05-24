import React from 'react';
import { Card } from 'primereact/card';
import { PaymentRuleTable } from '../components/PaymentRuleTable';
import '../styles/PaymentRuleList.css';

export function PaymentRuleListPage() {
  return (
    <div className="payment-rule-list-page">
      <Card title="Gestión de Reglas de Pago">
        <PaymentRuleTable />
      </Card>
    </div>
  );
}