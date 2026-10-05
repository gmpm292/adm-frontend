import React from 'react';
import { PageHeader } from '../../../../components/ui';
import { WorkerTable } from '../components/WorkerTable';

export function WorkerListPage() {
  return (
    <>
      <PageHeader
        title="Trabajadores"
        subtitle="Gestiona los trabajadores, su tipo, salario base y ubicación en la empresa."
      />
      <WorkerTable />
    </>
  );
}
