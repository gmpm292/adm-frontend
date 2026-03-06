// attendance/pages/AttendanceListPage.tsx
import React from "react";
import { Card } from "primereact/card";
import "../styles/AttendanceList.css";
import AttendanceTable from "../components/AttendanceTable";

export function AttendanceListPage() {
  return (
    <div className="attendance-list-page">
      <Card title="Gestión de Asistencia">
        <AttendanceTable />
      </Card>
    </div>
  );
}

export default AttendanceListPage;
