import { PageHeader } from "../../../../components/ui";
import { WorkScheduleTable } from "../components/WorkScheduleTable";

export function WorkScheduleListPage() {
  return (
    <>
      <PageHeader
        title="Horarios"
        subtitle="Semanas de trabajo de cada oficina y qué días se trabaja en ellas."
      />
      <WorkScheduleTable />
    </>
  );
}
