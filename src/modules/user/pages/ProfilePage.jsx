import React from 'react';
import { Card } from 'primereact/card';
import { TabView, TabPanel } from 'primereact/tabview';
import { Toast } from 'primereact/toast';
import { ProfileForm } from '../components/ProfileForm';
import { SecuritySettings } from '../components/SecuritySettings';
import '../styles/Profile.css';

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
    <div className="profile-page">
      <Toast ref={toastRef} position="top-right" />
      <Card title="Mi Perfil" className="shadow-2">
        <TabView>
          <TabPanel header="Información Personal" leftIcon="pi pi-user mr-2">
            <ProfileForm showSuccess={showSuccess} />
          </TabPanel>
          <TabPanel header="Seguridad" leftIcon="pi pi-shield mr-2">
            <SecuritySettings showSuccess={showSuccess} />
          </TabPanel>
        </TabView>
      </Card>
    </div>
  );
}