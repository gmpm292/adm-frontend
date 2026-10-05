import React from 'react';
import { PageHeader } from '../../../../components/ui';
import { CurrencyTable } from '../components/CurrencyTable';

export function CurrencyListPage() {
  return (
    <>
      <PageHeader
        title="Monedas"
        subtitle="Administra las monedas disponibles y su tasa de cambio frente al CUP."
      />
      <CurrencyTable />
    </>
  );
}
