import React from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { Toast } from 'primereact/toast';
import { PageHeader } from '../../../components/ui';
import { ProfileForm } from '../components/ProfileForm';
import { SecuritySettings } from '../components/SecuritySettings';

export function ProfilePage() {
  const toastRef = React.useRef(null);

  const showSuccess = (message) => {
    toastRef.current.show({
      severity: 'success',
      summary: 'Éxito',
      detail: message,
      life: 3000
    });
  };

  return (
    <>
      <Toast ref={toastRef} position="top-right" />
      <PageHeader
        title="Mi perfil"
        subtitle="Consulta tus datos personales y la seguridad de tu cuenta."
      />
      <TabView>
        <TabPanel header="Información Personal" leftIcon="pi pi-user mr-2">
          <ProfileForm showSuccess={showSuccess} />
        </TabPanel>
        <TabPanel header="Seguridad" leftIcon="pi pi-shield mr-2">
          <SecuritySettings showSuccess={showSuccess} />
        </TabPanel>
      </TabView>
    </>
  );
}
