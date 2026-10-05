import React from 'react';
import { PageHeader } from '../../../../components/ui';
import { PaymentRuleTable } from '../components/PaymentRuleTable';

export function PaymentRuleListPage() {
  return (
    <>
      <PageHeader
        title="Reglas de pago"
        subtitle="Configura cómo se calcula el pago de cada tipo de trabajador."
      />
      <PaymentRuleTable />
    </>
  );
}
