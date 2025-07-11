import React from "react";
import { Card } from "primereact/card";
import { OAuthButton } from "../components/oauth_config";


export function EmailSettingsPage() {
  return (
    <div className="p-4">
      <Card title="Configuración Email OAuth2">
        <OAuthButton />
      </Card>
    </div>
  );
}
