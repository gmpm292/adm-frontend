import { PageHeader } from "../../../../components/ui";
import { PaymentRuleTable } from "../components/PaymentRuleTable";

export function PaymentRuleListPage() {
  return (
    <>
      <PageHeader
        title="Reglas de pago"
        subtitle="Cómo se calcula lo que cobra cada tipo de trabajador: importes fijos por período y comisiones por venta."
      />
      <PaymentRuleTable />
    </>
  );
}
