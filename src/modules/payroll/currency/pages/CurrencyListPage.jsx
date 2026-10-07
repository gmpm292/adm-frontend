import React from 'react';
import { PageHeader } from '../../../../components/ui';
import { CurrencyTable } from '../components/CurrencyTable';

export function CurrencyListPage() {
  return (
    <>
      <PageHeader
        title="Monedas"
        subtitle="Monedas en las que se vende y cobra, con su tasa frente al CUP. Son comunes a todas las empresas."
      />
      <CurrencyTable />
    </>
  );
}
