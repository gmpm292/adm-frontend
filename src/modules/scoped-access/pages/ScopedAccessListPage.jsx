import { PageHeader } from "../../../components/ui";
import ScopedAccessTable from "../components/ScopedAccessTable";

export function ScopedAccessListPage() {
  return (
    <>
      <PageHeader
        title="Niveles de acceso"
        subtitle="Qué registros ve cada usuario de una empresa al usar una operación. Sin nivel configurado, cada operación aplica el suyo."
      />
      <ScopedAccessTable />
    </>
  );
}
