import React, { useState, useEffect } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";
import { Divider } from "primereact/divider";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client";
import {
  INIT_EMAIL_OAUTH,
  GET_EMAIL_OAUTH_STATUS,
  EMAIL_OAUTH_CALLBACK,
  GET_EMAIL_HEALTH_STATUS,
} from "../graphql/email-oauth.queries";

export function OAuthButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estado actual de configuración
  const { data: statusData, refetch: refetchStatus } = useQuery(
    GET_EMAIL_OAUTH_STATUS,
    {
      fetchPolicy: "network-only",
      onError: (err) => {
        console.error("Error checking OAuth status:", err);
        setError("Error al verificar el estado de configuración");
      },
    }
  );

  const { data: healthData } = useQuery(GET_EMAIL_HEALTH_STATUS, {
    fetchPolicy: "network-only",
  });

  // Init OAuth (es una query, no una mutación)
  const [loadInitOAuth] = useLazyQuery(INIT_EMAIL_OAUTH, {
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      window.location.href = data.oauth2InitEmailAuth.url;
    },
    onError: (err) => {
      console.error("OAuth initialization error:", err);
      setError(err.message || "Error al iniciar el flujo de autenticación");
      setLoading(false);
    },
  });

  // Callback
  const [handleOAuthCallback] = useMutation(EMAIL_OAUTH_CALLBACK, {
    onCompleted: (data) => {
      if (data.oauth2EmailCallback.success) {
        refetchStatus();
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      } else {
        setError(data.oauth2EmailCallback.message || "La autenticación falló");
      }
    },
    onError: (err) => {
      setError(err.message || "Error al procesar la autenticación");
    },
  });

  const startOAuthFlow = () => {
    setLoading(true);
    setError(null);
    loadInitOAuth();
  };

  // Procesar callback si viene el código en la URL
  useEffect(() => {
    const hash = window.location.hash; // ej: "#/system/email?code=XYZ&..."
    const queryIndex = hash.indexOf("?");
    if (queryIndex === -1) return;

    const queryString = hash.substring(queryIndex + 1);
    const params = new URLSearchParams(queryString);
    const code = params.get("code");

    if (code) {
      const processCallback = async () => {
        setLoading(true);
        try {
          await handleOAuthCallback({ variables: { code } });
        } catch (err) {
          console.error("Callback error:", err);
          setError("Error al procesar la autenticación");
        } finally {
          setLoading(false);
        }
      };

      processCallback();
    }
  }, [handleOAuthCallback]);

  const isConfigured = statusData?.oauth2EmailStatus?.isConfigured || false;
  const isHealthy = healthData?.emailHealthStatus?.isHealthy || false;

  return (
    <div className="oauth-button-container">
      <Card title="Configuración de Correo Electrónico" className="shadow-2">
        {error && (
          <Message
            severity="error"
            text={error}
            className="w-full mb-4"
            onClose={() => setError(null)}
          />
        )}

        <div className="flex flex-column align-items-center gap-3">
          <i className="pi pi-envelope text-6xl text-primary-500"></i>

          <Divider className="w-full" />

          {isConfigured ? (
            <>
              <Message
                severity={isHealthy ? "success" : "warn"}
                text={
                  isHealthy
                    ? "El servicio de correo está configurado y funcionando correctamente"
                    : "El servicio de correo está configurado pero presenta problemas"
                }
                className="w-full"
              />
              <Button
                label="Reconfigurar"
                icon="pi pi-refresh"
                className="p-button-outlined mt-3"
                onClick={startOAuthFlow}
                loading={loading}
              />
            </>
          ) : (
            <>
              <p className="text-center">
                Para configurar el servicio de correo, necesitamos autenticarte
                con Google.
              </p>

              {loading ? (
                <div className="flex align-items-center gap-2">
                  <ProgressSpinner style={{ width: "24px", height: "24px" }} />
                  <span>Conectando con Google...</span>
                </div>
              ) : (
                <Button
                  label="Continuar con Google"
                  icon="pi pi-google"
                  className="p-button-outlined"
                  onClick={startOAuthFlow}
                  severity="secondary"
                />
              )}
            </>
          )}

          <small className="text-color-secondary">
            Serás redirigido a Google para autorizar el acceso
          </small>
        </div>
      </Card>
    </div>
  );
}
