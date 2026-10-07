import { PageHeader } from "../../../../components/ui";
import { WorkerTable } from "../components/WorkerTable";

export function WorkerListPage() {
  return (
    <>
      <PageHeader
        title="Trabajadores"
        subtitle="Quién vende, reparte o cobra nómina: su tipo, salario y oficina. Las reglas de pago se aplican según el tipo."
      />
      <WorkerTable />
    </>
  );
}
