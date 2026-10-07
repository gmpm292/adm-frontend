import { PageHeader } from "../../../../components/ui";
import { WorkerPaymentTable } from "../components/WorkerPaymentTable";

export function WorkerPaymentListPage() {
  return (
    <>
      <PageHeader
        title="Pagos a trabajadores"
        subtitle="Lo que se le debe a cada trabajador: comisiones calculadas, salarios y bonificaciones. Márcalos como pagados al hacerlos."
      />
      <WorkerPaymentTable />
    </>
  );
}
