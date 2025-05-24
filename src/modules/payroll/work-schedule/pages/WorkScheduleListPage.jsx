import React from 'react';
import { Card } from 'primereact/card';
import { WorkScheduleTable } from '../components/WorkScheduleTable';
import '../styles/WorkScheduleList.css';

export function WorkScheduleListPage() {
    return (
        <div className="work-schedule-list-page">
            <Card title="Gestión de Horarios Laborales">
                <WorkScheduleTable />
            </Card>
        </div>
    );
}