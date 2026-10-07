import { PageHeader } from "../../../components/ui";
import RoleGuardTable from "../components/RoleGuardTable";

export function RoleGuardListPage() {
  return (
    <>
      <PageHeader
        title="Permisos por operación"
        subtitle="Qué roles pueden usar cada operación del servidor. Mandan los del código salvo que se personalicen aquí."
      />
      <RoleGuardTable />
    </>
  );
}
