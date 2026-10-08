import { TabPanel, TabView } from "primereact/tabview";
import { PageHeader } from "../../../../../components/ui";
import { EmailTemplatesTab } from "../../email_templates/components/EmailTemplatesTab";
import { EmailStatsTab } from "../../email_stats/components/EmailStatsTab";
import { EmailSettings } from "../components/EmailSettings";

export function EmailSettingsPage() {
  return (
    <>
      <PageHeader
        title="Correo"
        subtitle="Cómo envía el sistema los correos: enlaces de contraseña, avisos de alta..."
      />
      <TabView>
        <TabPanel header="Conexión" leftIcon="pi pi-cog mr-2">
          <div className="grid">
            <div className="col-12 lg:col-8 xl:col-6">
              <EmailSettings />
            </div>
          </div>
        </TabPanel>
        <TabPanel header="Plantillas" leftIcon="pi pi-file mr-2">
          <EmailTemplatesTab />
        </TabPanel>
        <TabPanel header="Envíos y estadísticas" leftIcon="pi pi-chart-bar mr-2">
          <EmailStatsTab />
        </TabPanel>
      </TabView>
    </>
  );
}
