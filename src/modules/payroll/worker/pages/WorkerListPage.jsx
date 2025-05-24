import React from 'react';
import { Card } from 'primereact/card';
import { WorkerTable } from '../components/WorkerTable';
import '../styles/WorkerList.css';

export function WorkerListPage() {
  return (
    <div className="worker-list-page">
      <Card title="Gestión de Trabajadores">
        <WorkerTable />
      </Card>
    </div>
  );
}