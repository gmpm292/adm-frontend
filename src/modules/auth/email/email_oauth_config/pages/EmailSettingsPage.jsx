import React from "react";
import { PageHeader } from "../../../../../components/ui";
import { OAuthButton } from "../components/oauth_config";

export function EmailSettingsPage() {
  return (
    <>
      <PageHeader
        title="Email OAuth2"
        subtitle="Conecta la cuenta de Google con la que el sistema envía los correos."
      />
      <div className="grid">
        <div className="col-12 lg:col-8 xl:col-6">
          <OAuthButton />
        </div>
      </div>
    </>
  );
}
