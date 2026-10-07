import { useEffect, useRef, useState } from "react";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Message } from "primereact/message";
import { EmptyState, InfoRow } from "../../../../../components/ui";
import { getErrorMessage } from "../../../../../utils/errors";
import {
  EMAIL_OAUTH_CALLBACK,
  GET_EMAIL_STATUS,
  INIT_EMAIL_OAUTH,
} from "../graphql/email-oauth.queries";

const EMAIL_ROUTE = `${import.meta.env.BASE_URL}#/system/email`;

const PROVIDERS = {
  gmail_oauth2: "Cuenta de Google",
  smtp: "Servidor SMTP",
};

/** Código que deja Google en la dirección al volver de autorizar */
const codeFromUrl = () => {
  const hash = window.location.hash;
  const queryIndex = hash.indexOf("?");
  if (queryIndex === -1) return null;
  return new URLSearchParams(hash.substring(queryIndex + 1)).get("code");
};

/**
 * Estado del correo y conexión de la cuenta de Google. Los datos (proveedor,
 * cuenta, claves) se cambian en Configuración.
 */
export function EmailSettings() {
  const [result, setResult] = useState(null);
  const [startError, setStartError] = useState(null);
  const callbackSent = useRef(false);

  const { data, loading, refetch } = useQuery(GET_EMAIL_STATUS, {
    fetchPolicy: "network-only",
  });
  const [initOAuth, { loading: starting }] = useLazyQuery(INIT_EMAIL_OAUTH, {
    fetchPolicy: "network-only",
  });
  const [sendCallback, { loading: finishing }] =
    useMutation(EMAIL_OAUTH_CALLBACK);

  // Al volver de Google: se envía el código una sola vez (un código no se
  // puede usar dos veces) y se limpia la dirección
  useEffect(() => {
    const code = codeFromUrl();
    if (!code || callbackSent.current) return;
    callbackSent.current = true;
    window.history.replaceState({}, document.title, EMAIL_ROUTE);
    sendCallback({ variables: { code } })
      .then(({ data: response }) => {
        setResult(response.oauth2EmailCallback);
        refetch();
      })
      .catch((err) =>
        setResult({ success: false, message: getErrorMessage(err) })
      );
  }, [sendCallback, refetch]);

  const startOAuth = async () => {
    setStartError(null);
    setResult(null);
    const { data: response, error } = await initOAuth();
    if (error) {
      setStartError(getErrorMessage(error));
      return;
    }
    window.location.href = response.oauth2InitEmailAuth.url;
  };

  if (loading || finishing) {
    return (
      <EmptyState icon="pi pi-spin pi-spinner" title="Comprobando el correo..." />
    );
  }

  const provider = data?.emailHealthStatus?.provider;
  const isHealthy = !!data?.emailHealthStatus?.isHealthy;
  const account = data?.oauth2EmailStatus?.email;
  const usesGoogle = provider === "gmail_oauth2";

  return (
    <Card>
      {result && (
        <Message
          severity={result.success ? "success" : "error"}
          text={result.message}
          className="w-full mb-3"
        />
      )}
      {startError && (
        <Message severity="error" text={startError} className="w-full mb-3" />
      )}

      <div className="flex flex-column gap-3">
        <InfoRow icon="pi pi-send" label="Envío">
          {PROVIDERS[provider] ?? "Sin configurar"}
        </InfoRow>
        {usesGoogle && (
          <InfoRow icon="pi pi-google" label="Cuenta conectada">
            {account ?? "Ninguna"}
          </InfoRow>
        )}
        <Message
          severity={isHealthy ? "success" : "warn"}
          text={
            isHealthy
              ? "Se pueden enviar correos"
              : usesGoogle
                ? "Falta autorizar la cuenta que indica EMAIL_USER en Configuración"
                : provider === "smtp"
                  ? "Faltan datos del servidor SMTP en Configuración"
                  : "Activa los grupos de correo en Configuración y elige el proveedor (EMAIL_PROVIDER)"
          }
          className="w-full justify-content-start"
        />
      </div>

      {usesGoogle && (
        <div className="flex flex-column align-items-start gap-2 mt-4">
          <Button
            label={account ? "Volver a autorizar" : "Autorizar con Google"}
            icon="pi pi-google"
            severity={account ? "secondary" : undefined}
            onClick={startOAuth}
            loading={starting}
          />
          <small className="text-color-secondary">
            Te lleva a Google: entra con la cuenta que envía los correos.
          </small>
        </div>
      )}
    </Card>
  );
}
