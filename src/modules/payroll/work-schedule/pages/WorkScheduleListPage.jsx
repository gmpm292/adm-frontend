import React from 'react';
import { PageHeader } from '../../../../components/ui';
import { WorkScheduleTable } from '../components/WorkScheduleTable';

export function WorkScheduleListPage() {
    return (
        <>
            <PageHeader
                title="Horarios laborales"
                subtitle="Define los periodos y días de trabajo de cada oficina."
            />
            <WorkScheduleTable />
        </>
    );
}
