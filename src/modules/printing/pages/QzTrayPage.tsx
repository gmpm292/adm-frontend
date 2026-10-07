import { PageHeader } from "../../../components/ui";
import { QzTrayConfig } from "../components/QzTrayConfig";

export function QzTrayPage() {
  return (
    <>
      <PageHeader
        title="Impresión"
        subtitle="Tickets de venta y comprobantes en impresoras térmicas, a través de QZ Tray."
      />
      <div className="grid">
        <div className="col-12 lg:col-8 xl:col-6">
          <QzTrayConfig />
        </div>
      </div>
    </>
  );
}
