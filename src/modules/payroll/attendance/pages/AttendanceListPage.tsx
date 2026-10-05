// attendance/pages/AttendanceListPage.tsx
import React from "react";
import { PageHeader } from "../../../../components/ui";
import AttendanceTable from "../components/AttendanceTable";

export function AttendanceListPage() {
  return (
    <>
      <PageHeader
        title="Asistencia"
        subtitle="Registra y consulta la asistencia diaria de los trabajadores."
      />
      <AttendanceTable />
    </>
  );
}

export default AttendanceListPage;
