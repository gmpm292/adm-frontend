import { PageHeader } from "../../../../components/ui";
import { PayrollPeriodTable } from "../components/PayrollPeriodTable";

export function PayrollPeriodListPage() {
  return (
    <>
      <PageHeader
        title="Períodos de nómina"
        subtitle="Semanas o meses que se liquidan: al terminar, se calculan sus pagos y, una vez hechos, se cierran."
      />
      <PayrollPeriodTable />
    </>
  );
}
