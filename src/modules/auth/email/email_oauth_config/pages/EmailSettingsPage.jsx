import { PageHeader } from "../../../../../components/ui";
import { EmailSettings } from "../components/EmailSettings";

export function EmailSettingsPage() {
  return (
    <>
      <PageHeader
        title="Correo"
        subtitle="Cómo envía el sistema los correos: enlaces de contraseña, avisos de alta..."
      />
      <div className="grid">
        <div className="col-12 lg:col-8 xl:col-6">
          <EmailSettings />
        </div>
      </div>
    </>
  );
}
