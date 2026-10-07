import { PageHeader } from "../../../../components/ui";
import { AttendanceTable } from "../components/AttendanceTable";

export function AttendanceListPage() {
  return (
    <>
      <PageHeader
        title="Asistencia"
        subtitle="Entrada, salida y horas de cada trabajador, día a día. Cada madrugada se abre el registro del día como «Ausente»."
      />
      <AttendanceTable />
    </>
  );
}
